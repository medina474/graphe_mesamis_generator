import { UndirectedGraph } from "graphology";
import { Gender, Person } from "../models/Person.js";
import { Club } from "../models/Club.js";
import { Random } from "../stats/Random.js";

export class ClubMembershipGenerator {
    constructor(
        private graph: UndirectedGraph,
        private individus: Person[],
        private clubs: Club[],
    ) {      

    }

    private getClubs(personId: number): string[] {
        return this.graph
          .edges(personId)
          .filter((edge) => {
            const attributes = this.graph.getEdgeAttributes(edge);
            return attributes.relation === "club";
          })
          .map((edge) => {
            const [source, target] = this.graph.extremities(edge);
            return source === personId.toString() ? target : source;
          });
      }
    
      private isAffiliate(personne: Person, club: Club): boolean {
        return this.getClubs(personne.id).includes(club.id);
      }

    private scoreClub(
        personne: Person,
        club: Club
    ): number {

        let score;

        if (club.tags.includes("sport")) {
        // Les clubs de sport sont exclusifs. Une personne ne peut pas adhérer à deux clubs de sport
        score = (personne.clubs.some(c => c.tags.includes("sport"))) ?
        0 :
        personne.sport;
        }
        else if (club.tags.includes("musique")) {
        score = personne.music
        }
        else {
        score = Math.random();
        }

        return score;
    }

  generate() {

    for (const club of this.clubs) {

      // Les clubs ont une capacité maximale. 
      // Calculons la capacité réelle
      const capacite_reelle = Math.floor(club.capacity * (Math.random() / 3 + 0.7)) 

      // Choisir les candidats :
      // - Ils ne doivent pas déja appartenir au club
      let candidats: Person[] = this.individus.filter(i => !i.clubs.includes(club));
      
      // Trier les candidats suivant le score Club 
      // Sélectionner une population 5 fois plus grande.
      // Les trier aléatoirement
      let retenus = Random.shuffle(
        candidats
          .map(i => ({
            personne: i,
            score: this.scoreClub(i, club)
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, club.capacity * 5)
      )

      // Finalement ne garder que le nombre corresopndant à la capacité
      for (let r of retenus.slice(0, capacite_reelle - 1))
      {
        r.personne.clubs.push(club)

        this.graph.addEdge(r.personne.id, club.id, {
            relation: "club",
            category: "club",
            weight: 1,
          });

        this.graph.mergeNodeAttributes(club.id, {
            size: club.size,
          });

        club.size++;
      }

      console.log(`${club.name} : ${club.size} adhérents`)
    }
  }
}