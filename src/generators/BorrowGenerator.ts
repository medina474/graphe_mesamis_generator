import { Person } from "../models/Person.js";
import { Exemplaire, Pret } from "../models/Book.js";

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

    /* Au départ le détenteur est le propriétaire du livre */
    for (const exemplaire of this.exemplaires) {
      detenteurs.set(exemplaire.id, exemplaire.proprietaire);

      exemplaireDisponibleLe.set(exemplaire.id, dateDebut);
    }

    for (const personne of this.personnes) {
      personneDisponibleLe.set(personne.id, dateDebut);

      oeuvresLues.set(personne.id, new Set());
    }

    // Les propriétaires ont déja lus leurs livres
    for (const exemplaire of this.exemplaires) {
      oeuvresLues.get(exemplaire.proprietaire.id)!.add(exemplaire.oeuvre.id);
    }

    let maintenant = new Date(dateDebut);
    let currentDayStart = this.startOfDay(maintenant);
    let pretsToday = 0;
    let dailyQuota = this.dailyPrets();

    while (prets.length < nombrePrets) {
      const jourActuel = this.startOfDay(maintenant);

      if (jourActuel.getTime() !== currentDayStart.getTime()) {
        currentDayStart = jourActuel;
        pretsToday = 0;
        dailyQuota = this.dailyPrets();
      }

      if (pretsToday >= dailyQuota) {
        maintenant = this.startOfNextDay(maintenant);
        continue;
      }

      /*
       * On cherche les personnes qui peuvent
       * emprunter à cet instant.
       */
      const candidats = this.getCandidats(
        maintenant,
        personneDisponibleLe,
        exemplaireDisponibleLe,
        oeuvresLues,
      );

      if (candidats.length === 0) {
        console.log("Aucun candidat");
        /*
         * Aucun candidat maintenant.
         *
         * On avance jusqu'au prochain moment
         * où une personne ou un exemplaire devient disponible.
         */
        const prochaineDate = this.prochaineDisponibilite(
          maintenant,
          personneDisponibleLe,
          exemplaireDisponibleLe,
        );

        if (!prochaineDate) {
          break;
        }

        maintenant = prochaineDate;
        continue;
      }

      /*
       * Le score de lecture utilisé ici est
       * celui du début de la simulation.
       */
      const emprunteur = this.tirerPersonne(candidats);

      const exemplaire = this.choisirExemplaire(
        emprunteur,
        maintenant,
        exemplaireDisponibleLe,
        oeuvresLues,
      );

      if (!exemplaire) {
        /*
         * Cette personne ne dispose finalement
         * d'aucun livre compatible.
         */
        personneDisponibleLe.set(emprunteur.id, maintenant);

        continue;
      }

      const preteur = detenteurs.get(exemplaire.id)!;

      const duree = this.dureePret();

      const fin = new Date(maintenant.getTime() + duree);

      const pret: Pret = {
        exemplaire,
        preteur,
        emprunteur,
        debut: new Date(maintenant),
        fin,
      };

      console.log(
        `${pret.exemplaire.id} | ${pret.exemplaire.oeuvre.title} : ${pret.preteur.firstname} -> ${pret.emprunteur.firstname} ${maintenant.toLocaleDateString()}`,
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

      /*
       * On conserve le moment courant et on laisse
       * la boucle avancer seulement si plus aucun
       * candidat n'est disponible.
       */
    }

    return prets;
  }

  private getCandidats(
    maintenant: Date,
    personneDisponibleLe: Map<string, Date>,
    exemplaireDisponibleLe: Map<string, Date>,
    oeuvresLues: Map<string, Set<string>>,
  ): Person[] {
    return this.personnes.filter((personne) => {
      /*
       * La personne doit avoir terminé son prêt précédent.
       */
      const disponible = personneDisponibleLe.get(personne.id)!;

      if (disponible > maintenant) {
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
       * Elle doit avoir au moins un exemplaire
       * disponible d'une œuvre qu'elle n'a jamais lue.
       */
      return this.exemplaires.some((exemplaire) => {
        const dateDisponible = exemplaireDisponibleLe.get(exemplaire.id)!;

        if (dateDisponible > maintenant) {
          return false;
        }

        return !oeuvresLues.get(personne.id)!.has(exemplaire.oeuvre.id);
      });
    });
  }

  private choisirExemplaire(
    emprunteur: Person,
    maintenant: Date,
    exemplaireDisponibleLe: Map<string, Date>,
    oeuvresLues: Map<string, Set<string>>,
  ): Exemplaire | null {
    const candidats = this.exemplaires.filter((exemplaire) => {
      const disponible = exemplaireDisponibleLe.get(exemplaire.id)!;

      if (disponible > maintenant) {
        return false;
      }

      return !oeuvresLues.get(emprunteur.id)!.has(exemplaire.oeuvre.id);
    });

    if (candidats.length === 0) {
      return null;
    }

    return candidats[Math.floor(Math.random() * candidats.length)];
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
    const jours = 7 + Math.floor(Math.random() * 15);

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
    return 5 + Math.floor(Math.random() * 4);
  }

  private prochaineDisponibilite(
    maintenant: Date,
    personneDisponibleLe: Map<string, Date>,
    exemplaireDisponibleLe: Map<string, Date>,
  ): Date | null {
    const dates = [
      ...personneDisponibleLe.values(),
      ...exemplaireDisponibleLe.values(),
    ].filter((date) => date > maintenant);

    if (dates.length === 0) {
      return null;
    }

    return new Date(Math.min(...dates.map((date) => date.getTime())));
  }
}
