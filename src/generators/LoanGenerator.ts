import { Person } from "../models/Person.js";
import { Copy, Loan, GenreInfo } from "../models/Book.js";
import { Random } from "../stats/Random.js";

export class LoanGenerator {
  private copiesAvalaiblesCurrentDay: Copy[] = [];

  constructor(
    private readonly personnes: Person[],
    private readonly copies: Copy[],
    private readonly genres: Record<string, GenreInfo>
  ) {
    const genresNames = Object.keys(genres);
    this.personnes
      .filter((p) => Object.keys(p.interestTags).length === 0)
      .forEach((p) => {
        const genre = genresNames[Math.floor(Math.random() * genresNames.length)];
        p.interestTags[genre] = 1;
      });
  }

  generer(nombrePrets: number, dateDebut: Date = new Date()): Loan[] {
    console.log(`Prêts`);
    console.log(`----------------------------------------`);
    const prets: Loan[] = [];

    /* Au départ toutes les personnes sont disponibles
     */
    for (const personne of this.personnes) {
      personne.availableAt = dateDebut;
    }

    /* Au départ le détenteur est le propriétaire du livre
     * Le livre est immédiatement disponible
     * Les propriétaires ont déja lus leurs livres
     */
    for (const exemplaire of this.copies) {
      exemplaire.availableAt = dateDebut;
      exemplaire.owner.oeuvresLues.add(exemplaire.book);
    }

    const maintenant = new Date(dateDebut);
    let currentDay = this.startOfDay(maintenant);
    let backupDayTime = currentDay.getTime() - 1;
    let pretsToday = 0;
    let dailyQuota = this.dailyPrets();
    let index = 1;

    while (prets.length < nombrePrets) {
      /*
       * Nouveau jour ?
       * Recalcul d'un quota pour la journée.
       *  Retour éventuels des prêts
       */
      if (currentDay.getTime() !== backupDayTime) {
        pretsToday = 0;
        /*
         * Combien de prêts sont prévus ce jour  ?
         */
        dailyQuota = this.dailyPrets();
        backupDayTime = currentDay.getTime(); // Copie la valeur pas la référence

        /*
         * Quels sont les exemplaires disponible aujourd'hui ?
         */
        this.copiesAvalaiblesCurrentDay = this.copies.filter((exemplaire) => {
          return exemplaire.availableAt <= currentDay;
        });

        console.log(
          `${currentDay.toLocaleDateString("fr-FR")} : ${dailyQuota} copies prévues | ${this.copiesAvalaiblesCurrentDay.length} copies disponibles.`,
        );
      }

      /*
       * Quota journalier de prêts atteint ?
       * On incrémente d'un jour
       * Retour des exemplaires à leur propriétaire
       */
      if (pretsToday >= dailyQuota) {
        currentDay = this.startOfNextDay(currentDay);

        this.copies
          .filter((c) => c.availableAt < currentDay && c.holder != c.owner)
          .forEach((c) => {
            if (Math.random() < 0.005) {
              c.holder = c.owner;
              let pret_precedent = this.dernierPret(prets, c);
              if (pret_precedent) {
                pret_precedent.returnedDate = currentDay;
              } else {
                console.warn(`Retour sans prêt`);
              }
            }
          });

        continue;
      }

      /*
       * On cherche les personnes qui peuvent
       * emprunter à cet instant.
       */
      const candidats = this.getCandidats(currentDay);

      if (candidats.length === 0) {
        console.info("Aucun candidat disponible");

        // Aucun candidat pour l'instant : avancer d'un jour.
        currentDay = this.startOfNextDay(currentDay);
        continue;
      }

      /*
       * Le score de lecture utilisé ici est
       * celui du début de la simulation.
       */
      const emprunteur = this.tirerPersonne(candidats);

      const exemplaire = this.choisirExemplaire(emprunteur);

      if (!exemplaire) {
        /*
         * Cette personne ne dispose finalement d'aucun livre compatible.
         * Elle doit attendre 7 jours pour être de nouveau disponible et laisser la chance à d'autres
         */
        
        console.log(`Pas de copie compatible pour ${emprunteur.firstname} ${Object.keys(emprunteur.interestTags).join(', ')}`)
        emprunteur.availableAt = new Date(
          currentDay.getTime() + Random.int(3, 8),
        );
        continue;
      }

      const preteur = exemplaire.holder;

      const duree = this.dureePret();

      const fin = new Date(currentDay.getTime() + duree);

      let pret_precedent;
      if (preteur != exemplaire.owner) {
        pret_precedent = this.dernierPret(prets, exemplaire);
      }

      const pret: Loan = {
        id: `loan_${index++}`,
        copy: exemplaire,
        preteur,
        emprunteur,
        start: new Date(currentDay),
        end: fin,
        previous: pret_precedent,
      };

      console.log(
        `${pret.copy.id} | ${pret.copy.book.title} | ${pret.preteur.firstname} -> ${pret.emprunteur.firstname} ${pret.emprunteur.reading}`,
      );
      prets.push(pret);
      pretsToday++;

      /*
       * Le livre change de détenteur.
       */
      exemplaire.holder = emprunteur;

      /*
       * Le livre ne pourra pas être repris
       * avant la fin du prêt.
       */
      exemplaire.availableAt = fin;

      /*
       * L'emprunteur ne pourra pas emprunter
       * un autre livre avant la fin de celui-ci.
       */
      emprunteur.availableAt = fin;

      /*
       * L'œuvre est maintenant considérée comme lue.
       *
       * Important : on utilise oeuvre.id et non
       * exemplaire.id.
       */
      emprunteur.oeuvresLues.add(exemplaire.book);

      for (const tag of exemplaire.book.genres) {
        emprunteur.interestTags[tag] = (emprunteur.interestTags[tag] ?? 0) + 1;
      }
    }

    return prets;
  }

  private getCandidats(currentDay: Date): Person[] {
    return this.personnes.filter((personne) => {
      /*
       * La personne doit avoir terminé son prêt précédent.
       */
      if (personne.availableAt > currentDay) {
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
       * Existe-t-il au moins une copie disponible (some)
       * d'une œuvre jamais lue par la personne
       */
      return this.copiesAvalaiblesCurrentDay.some(
        (copy) => !personne.oeuvresLues.has(copy.book),
      );
    });
  }

  private choisirExemplaire(emprunteur: Person): Copy | null {
    // Les oeuvres sont celles qui sont disponibles ce jour
    // et qui n'ont pas été lues par l'emprunteur
    const selection = this.copiesAvalaiblesCurrentDay.filter((copy) => {
      return !emprunteur.oeuvresLues.has(copy.book) && 
        Object.keys(emprunteur.interestTags).some(t => copy.book.genres.includes(t));
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

  /**
   * Le score est calculé à partir du nombre de genres en commun entre
   * la personne et le livre
   * @param emprunteur
   * @param exemplaire
   * @returns
   */
  private scoreExemplaire(emprunteur: Person, exemplaire: Copy): number {
    return (
      1 +
      exemplaire.book.genres.reduce(
        (somme, genre) => somme + (emprunteur.interestTags[genre] ?? 0),
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

  private dernierPret(prets: Loan[], exemplaire: Copy): Loan | undefined {
    const finds = prets
      .filter((p) => p.copy == exemplaire)
      .sort((a, b) => b.end.getTime() - a.end.getTime());
    return finds.length > 0 ? finds[0] : undefined;
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
