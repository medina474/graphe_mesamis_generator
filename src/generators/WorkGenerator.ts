import { DirectedGraph } from "graphology";
import { Gender, Person, Education, Wealth } from "../models/Person.js";
import { Enterprise, PlageRichesse, Poste } from "../models/Enterprise.js";
import { Random } from "../stats/Random.js";

interface Emploi {
  niveau: number;
  enterprise: Enterprise;
  poste: Poste;
}

interface Affectation {
  person: Person;
  enterprise: Enterprise;
  poste: Poste;
}

export class WorkGenerator {
  private emplois: Emploi[];

  constructor(
    private graph: DirectedGraph,
    private individus: Person[],
    private enterprises: Enterprise[],
  ) {
    this.emplois = [];

    // Extraire les emplois pour affecter les postes les plus contraints en premier
    for (const enterprise of this.enterprises) {
      for (const poste of enterprise.postes) {
        this.emplois.push({
          niveau: poste.niveauEtude ?? -1,
          enterprise,
          poste,
        });
      }
    }

    // Trier par niveau d'etudes décroissant
    this.emplois = this.emplois.sort((a, b) => {
      return b.niveau - a.niveau;
    });
  }

  generate() {
    const disponibles = [
      ...this.individus.filter((i) => i.age > 20 && i.age < 65),
    ];
    const nbDisponibles = disponibles.length;
    console.log(`Population en âge de travailler : ${nbDisponibles}`);
    const affectations: Affectation[] = [];

    for (const emploi of this.emplois) {
      for (let k = 0; k < emploi.poste.effectif; k++) {
        const candidat = this.meilleurCandidat(emploi.poste, disponibles);

        if (candidat === null) {
          console.log(
            `pas de candidat disponible pour le poste de ${emploi.poste.name} ${emploi.enterprise.name}`,
          );
          continue;
        }

        affectations.push({
          person: candidat,
          enterprise: emploi.enterprise,
          poste: emploi.poste,
        });

        candidat.work = emploi.enterprise

        if (emploi.poste.richesse) {
          candidat.wealth = this.tirerRichesse(emploi.poste.richesse);
        }

        this.graph.addEdge(candidat.id, emploi.enterprise.id, {
          relation: "WORK",
          weight: 1,
        });

        const index = disponibles.indexOf(candidat);
        disponibles.splice(index, 1);
      }
    }

    console.log(`Population en activité : ${affectations.length}`);
    console.log(
      `Taux d'activité : ${((affectations.length / nbDisponibles) * 100).toFixed(2)}`,
    );
  }

  private meilleurCandidat(poste: Poste, personnes: Person[]): Person | null {
    const candidats = personnes.filter((personne) =>
      this.estCompatible(poste, personne),
    );

    if (candidats.length === 0) {
      return null;
    }

    return candidats.reduce((meilleur, candidat) => {
      const scoreCandidat = this.score(poste, candidat);
      const scoreMeilleur = this.score(poste, meilleur);

      return scoreCandidat > scoreMeilleur ? candidat : meilleur;
    });
  }

  private estCompatible(poste: Poste, personne: Person): boolean {
    // Une personne sous-qualifiée peut être recrutée,
    // mais elle sera moins bien classée qu'une personne
    // possédant le niveau requis.
    //
    // On ne filtre donc pas ici sur le diplôme.

    if (poste.ageMin !== undefined && personne.age < poste.ageMin) {
      return false;
    }

    if (poste.ageMax !== undefined && personne.age > poste.ageMax) {
      return false;
    }

    return true;
  }

  private score(poste: Poste, personne: Person): number {
    let score = 0;

    if (poste.niveauEtude === null) {
      // Poste indifférent : tous les candidats sont équivalents
      // sur le critère du diplôme.
      score += 0;
    } else {
      const ecart = personne.education - poste.niveauEtude;

      if (ecart === 0) {
        // Niveau exactement adapté.
        score += 100;
      } else if (ecart > 0) {
        // Surqualification.
        // Plus l'écart est grand, moins le score est bon.
        score += 100 - ecart * 10;
      } else {
        // Sous-qualification.
        // Elle reste possible, mais fortement pénalisée.
        score += 50 + ecart * 20;
      }
    }

    // Pour les postes ayant un âge minimum,
    // privilégier une personne ayant suffisamment d'expérience.
    if (poste.ageMin !== undefined) {
      const anciennete = personne.age - poste.ageMin;

      score += Math.min(Math.max(anciennete, 0), 20);
    }

    return score;
  }

  private tirerRichesse(richesse: number | PlageRichesse): number {
    if (typeof richesse === "number") {
      return richesse;
    }

    return (
      Math.floor(Math.random() * (richesse.max - richesse.min + 1)) +
      richesse.min
    );
  }
}
