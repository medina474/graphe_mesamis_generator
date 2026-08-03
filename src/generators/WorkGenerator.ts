import { DirectedGraph } from "graphology";
import { Gender, Person, Education } from "../models/Person.js";
import { Enterprise, Poste } from "../models/Enterprise.js";
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

        for (const enterprise of this.enterprises) {
            for (const poste of enterprise.postes) {
                this.emplois.push({
                    niveau: poste.niveauEtude ?? -1,
                    enterprise,
                    poste,
                });
            }
        }

        this.emplois = this.emplois.sort((a, b) => {
            return b.niveau - a.niveau;
        });
    }

    generate() {

        const disponibles = [...this.individus.filter(i => i.age > 20 && i.age < 65)];
        const affectations: Affectation[] = [];

        for (const emploi of this.emplois) {
          console.log(`${emploi.enterprise.name} - ${emploi.poste.commentaire}`)
          for (let k = 0 ; k < emploi.poste.effectif ; k++) {
            const candidat = this.meilleurCandidat(
                emploi.poste,
                disponibles,
            );

            if (candidat === null) {
                continue;
            }

            affectations.push({
                person: candidat,
                enterprise: emploi.enterprise,
                poste: emploi.poste,
            });

            this.graph.addEdge(candidat.id, emploi.enterprise.id, {
              relation: "work",
              category: "work",
              weight: 1,
            });

            const index = disponibles.indexOf(candidat);
            disponibles.splice(index, 1);
          }
        }
    }

    private meilleurCandidat(
      poste: Poste,
      personnes: Person[],
    ): Person | null {

    const candidats = personnes.filter(personne =>
      this.estCompatible(poste, personne)
    );

    if (candidats.length === 0) {
      return null;
    }

    return candidats.reduce((meilleur, candidat) => {
      const scoreCandidat = this.score(poste, candidat);
      const scoreMeilleur = this.score(poste, meilleur);

      return scoreCandidat > scoreMeilleur
        ? candidat
        : meilleur;
    });
  }

  private estCompatible(
    poste: Poste,
    personne: Person,
  ): boolean {

    // Une personne sous-qualifiée peut être recrutée,
    // mais elle sera moins bien classée qu'une personne
    // possédant le niveau requis.
    //
    // On ne filtre donc pas ici sur le diplôme.

    if (
      poste.ageMin !== undefined &&
      personne.age < poste.ageMin
    ) {
      return false;
    }

    if (
      poste.ageMax !== undefined &&
      personne.age > poste.ageMax
    ) {
      return false;
    }

    return true;
  }

  private score(
    poste: Poste,
    personne: Person,
  ): number {

    let score = 0;

    if (poste.niveauEtude === null) {
      // Poste indifférent : tous les candidats sont équivalents
      // sur le critère du diplôme.
      score += 0;
    } else {
      const ecart =
        personne.education - poste.niveauEtude;

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
      const anciennete =
        personne.age - poste.ageMin;

      score += Math.min(Math.max(anciennete, 0), 20);
    }

    return score;
  }
}