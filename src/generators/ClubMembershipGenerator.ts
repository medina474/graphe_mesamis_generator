import { DirectedGraph } from "graphology";
import { Gender, Person } from "../models/Person.js";
import { Club } from "../models/Club.js";
import { Random } from "../stats/Random.js";

export class ClubMembershipGenerator {
    constructor(
        private graph: DirectedGraph,
        private individus: Person[],
        private clubs: Club[],
    ) {
    }

    private scoreClub(personne: Person, club: Club): number {

      let score = Math.random();

      // Sport
      if (club.criteria?.sport) {
          score += personne.sport * club.criteria.sport;
      }

      // Richesse
      if (club.criteria?.wealth) {
          score += personne.wealth * club.criteria.wealth;
      }

      // Éducation
      if (club.criteria?.education) {
          score += personne.education * club.criteria.education;
      }

      // Genre
      if (club.gender) {
          score *= personne.gender === Gender.Male
              ? club.gender.male ?? 0
              : club.gender.female ?? 0;
      }

      return score;
  }
  
  generate() {

    for (const club of this.clubs) {

      // Les clubs ont une capacité maximale. 
      // Calculons la capacité réelle
      const capacite_reelle = Math.floor(club.capacity * (Math.random() / 3 + 0.7)) 

      console.log("----------------------------------------")
      console.log(`${club.name}`) 

      // Choisir les candidats :
      // - Ils ne doivent pas déja appartenir au club.
      let candidats: Person[] = this.individus.filter(i => !i.clubs.includes(club) &&
        i.age > 18
      );
      
      // - Si un seul membre du tableau exclusive se retrouve dans les tags de la personne,
      // elle est exclue. Une personne ne peut appartenir à des clubs fortement concurentiels.
      if (club.exclusive) {
        candidats = candidats.filter(p => !club.exclusive!.some(t => p.tags.has(t)));
      }

      // Trier les candidats suivant le score Club 
      // Sélectionner une population 2 fois plus grande.
      // Les trier aléatoirement
      let retenus = Random.shuffle(
        candidats
          .map(i => ({
            personne: i,
            score: this.scoreClub(i, club)
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, club.capacity * 2)
      )

      // Finalement ne garder que le nombre corresopndant à la capacité
      for (let r of retenus.slice(0, capacite_reelle - 1))
      {
        r.personne.clubs.push(club)

        for (let t of club.tags) {
          r.personne.tags.add(t)
        }

        this.graph.addEdge(r.personne.id, club.id, {
            relation: "MEMBER",
            weight: 1,
          });

        club.size++;
      }

      console.log(`${club.size} adhérents`)
    }
  }
}