import { Person } from "../models/Person.js";
import { Exemplaire, Pret } from "../models/Book.js";
import { Random } from "../stats/Random.js";

export class BorrowGenerator {
  constructor(
    private readonly personnes: Person[],
    private readonly exemplaires: Exemplaire[],
  ) {}

  generer(nombrePrets: number, dateDebut: Date = new Date()): Pret[] {
    console.log(`Prêts`);
    console.log(`----------------------------------------`);
    const prets: Pret[] = [];

    /*
     * Détenteur actuel de chaque exemplaire.
     *
     * Au début de la simulation, le détenteur
     * est le propriétaire.
     */
    const detenteurs = new Map<string, Person>();

    /*
     * Historique des œuvres déjà lues par personne.
     */
    const oeuvresLues = new Map<string, Set<string>>();

    /*
     * Date à laquelle chaque exemplaire pourra
     * être de nouveau prêté.
     */
    const exemplaireDisponibleLe = new Map<string, Date>();

    /*
     * Date à laquelle chaque personne pourra
     * de nouveau emprunter.
     */
    const personneDisponibleLe = new Map<string, Date>();

    /* Au départ toutes les personnes sont disponibles
     */
    for (const personne of this.personnes) {
      personneDisponibleLe.set(personne.id, dateDebut);
      oeuvresLues.set(personne.id, new Set());
    }

    /* Au départ le détenteur est le propriétaire du livre
     * Le livre est immédiatement disponible
     * Les propriétaires ont déja lus leurs livres
     */
    for (const exemplaire of this.exemplaires) {
      detenteurs.set(exemplaire.id, exemplaire.proprietaire);
      exemplaireDisponibleLe.set(exemplaire.id, dateDebut);
      oeuvresLues.get(exemplaire.proprietaire.id)!.add(exemplaire.oeuvre.id);
    }

    const maintenant = new Date(dateDebut);
    let currentDay = this.startOfDay(maintenant);
    let backupDay = this.startOfDay(maintenant);
    let pretsToday = 0;
    let dailyQuota = this.dailyPrets();

    while (prets.length < nombrePrets) {

      // Nouveau jour ? Recalcul d'un quota pour la journée.
      // Retour éventuels des prêts
      if (currentDay.getTime() !== backupDay.getTime()) {
        pretsToday = 0;
        dailyQuota = this.dailyPrets();
        backupDay = this.startOfDay(currentDay); // Copie la valeur pas la référence
      }

      // Quota journalier de prêts atteint ? On incrémente d'un jour
      // Retour des exemplaires à leur propriétaire
      if (pretsToday >= dailyQuota) {
        currentDay = this.startOfNextDay(currentDay);

        for (const [idExemplaire, dateDisponible] of exemplaireDisponibleLe) {
          if (dateDisponible <= currentDay) {
            const exemplaire: Exemplaire = this.exemplaires.find(
              (x) => idExemplaire == x.id,
            )!;

            if (detenteurs.get(idExemplaire) != exemplaire?.proprietaire && Math.random() < 0.25) {
              console.log('Retour au propriétaire');
              detenteurs.set(idExemplaire, exemplaire?.proprietaire);
            }
          }
        }

        continue;
      }

      /*
       * Quels sont les exemplaires disponible aujourd'hui ?
       */
      const exemplairesDisponible = this.exemplaires.filter((exemplaire) => {
        const dateDisponible = exemplaireDisponibleLe.get(exemplaire.id)!;
        return (dateDisponible <= currentDay) 
      });

      /*
       * On cherche les personnes qui peuvent
       * emprunter à cet instant.
       */
      const candidats = this.getCandidats(
        currentDay,
        personneDisponibleLe,
        exemplairesDisponible,
        oeuvresLues,
      );

      if (candidats.length === 0) {
        console.log("Aucun candidat disponible");

        // Aucun candidat pour l'instant : avancer d'un jour.
        currentDay = this.startOfNextDay(currentDay);
        continue;
      }

      /*
       * Le score de lecture utilisé ici est
       * celui du début de la simulation.
       */
      const emprunteur = this.tirerPersonne(candidats);

      const exemplaire = this.choisirExemplaire(
        emprunteur,
        exemplairesDisponible,
        oeuvresLues,
      );

      if (!exemplaire) {
        /*
         * Cette personne ne dispose finalement d'aucun livre compatible.
         * Elle doit attendre 7 jours pour être de nouveau disponible et laisser la chance à d'autres
         */
        personneDisponibleLe.set(
          emprunteur.id,
          new Date(currentDay.getTime() + Random.int(3, 8)),
        );
        continue;
      }

      const preteur = detenteurs.get(exemplaire.id)!;

      const duree = this.dureePret();

      const fin = new Date(currentDay.getTime() + duree);

      const pret: Pret = {
        exemplaire,
        preteur,
        emprunteur,
        debut: new Date(currentDay),
        fin,
      };

      console.log(
        `${pret.exemplaire.id} | ${pret.exemplaire.oeuvre.title} : ${pret.preteur.firstname} -> ${pret.emprunteur.firstname} ${currentDay.toLocaleDateString()}`,
      );
      prets.push(pret);
      pretsToday++;

      /*
       * Le livre change de détenteur.
       */
      detenteurs.set(exemplaire.id, emprunteur);

      /*
       * Le livre ne pourra pas être repris
       * avant la fin du prêt.
       */
      exemplaireDisponibleLe.set(exemplaire.id, fin);

      /*
       * L'emprunteur ne pourra pas emprunter
       * un autre livre avant la fin de celui-ci.
       */
      personneDisponibleLe.set(emprunteur.id, fin);

      /*
       * L'œuvre est maintenant considérée comme lue.
       *
       * Important : on utilise oeuvre.id et non
       * exemplaire.id.
       */
      oeuvresLues.get(emprunteur.id)!.add(exemplaire.oeuvre.id);

      if (!emprunteur.interestTags) {
        emprunteur.interestTags = {};
      }

      for (const tag of exemplaire.oeuvre.genres) {
        emprunteur.interestTags[tag] = (emprunteur.interestTags[tag] ?? 0) + 1;
      }
    }

    return prets;
  }

  private getCandidats(
    currentDay: Date,
    personneDisponibleLe: Map<string, Date>,
    exemplairesDisponible: Exemplaire[],
    oeuvresLues: Map<string, Set<string>>,
  ): Person[] {
    return this.personnes.filter((personne) => {
      /*
       * La personne doit avoir terminé son prêt précédent.
       */
      const disponible = personneDisponibleLe.get(personne.id)!;

      if (disponible > currentDay) {
        return false;
      }

      /*
       * Une personne qui ne lit pas n'est pas candidate.
       * N'arrive jamais reading est compris entre 0 et 1
       */
      if (personne.reading <= 0) {
        return false;
      }

      /*
       * Il doit y avoir au moins un exemplaire
       * disponible d'une œuvre qu'elle n'a jamais lue.
       */
      const oeuvresLuesPerson = oeuvresLues.get(personne.id)!
      return exemplairesDisponible.some((exemplaire) => {
        return !oeuvresLuesPerson.has(exemplaire.oeuvre.id);
      });
    });
  }

  private choisirExemplaire(
    emprunteur: Person,
    exemplairesDisponible: Exemplaire[],
    oeuvresLues: Map<string, Set<string>>,
  ): Exemplaire | null {
    // Les oeuvres sont celles qui sont disponibles à l'instant 
    // et qui n'ont pas été lues par l'emprunteur
    const oeuvresLuesPerson = oeuvresLues.get(emprunteur.id)!
    const selection = exemplairesDisponible.filter((exemplaire) => {
      return !oeuvresLuesPerson.has(exemplaire.oeuvre.id);
    });

    if (selection.length === 0) {
      return null;
    }

    const poids = selection.map((exemplaire) =>
      this.scoreExemplaire(emprunteur, exemplaire),
    );

    const total = poids.reduce((somme, poids) => somme + poids, 0);
    let tirage = Math.random() * total;
    let index = 0;

    for (; index < selection.length; index++) {
      tirage -= poids[index];

      if (tirage < 0) {
        break;
      }
    }

    if (index >= selection.length) {
      index = selection.length - 1;
    }

    return selection[index];
  }

  private scoreExemplaire(emprunteur: Person, exemplaire: Exemplaire): number {
    const counts = emprunteur.interestTags ?? {};

    return (
      1 +
      exemplaire.oeuvre.genres.reduce(
        (somme, genre) => somme + (counts[genre] ?? 0),
        0,
      )
    );
  }

  private tirerPersonne(personnes: Person[]): Person {
    const total = personnes.reduce(
      (somme, personne) => somme + personne.reading,
      0,
    );

    let tirage = Math.random() * total;

    for (const personne of personnes) {
      tirage -= personne.reading;

      if (tirage <= 0) {
        return personne;
      }
    }

    return personnes[personnes.length - 1];
  }

  private dureePret(): number {
    /*
     * Entre 7 et 21 jours inclus.
     */
    const jours = Random.normalRange(7, 21);

    return jours * 24 * 60 * 60 * 1000;
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private startOfNextDay(date: Date): Date {
    const start = this.startOfDay(date);
    return new Date(start.getTime() + 24 * 60 * 60 * 1000);
  }

  private dailyPrets(): number {
    return 2 + Math.floor(Math.random() * 4);
  }
}
