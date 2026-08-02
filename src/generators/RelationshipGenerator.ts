import { Console } from "console";
import { CsvPersonExporter } from "../exporters/CsvPersonExporter.js";
import { Gender, Person } from "../models/Person.js";
import { UndirectedGraph } from "graphology";
import { Club } from "../models/Club.js";
import { nodeCrypto } from "random-js";

export class RelationshipGenerator {
  private p_pref = 0.45; // 0.45
  private p_triadic = 0.45; // 0.40
  private p_similitude = 1 - this.p_pref - this.p_triadic;

  constructor(
    private graph: UndirectedGraph,
    private individus: Person[],
    private clubs: Club[]
  ) {
    
    for (const club of this.clubs) {
      club.size = 1;
      graph.addNode(club.id, {
        category: 'club',
        name: club.name,
        label: club.name,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1,
        color: "#82ff69",
      });
    }
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  generateFriends() {
    const N = this.individus.length;

    for (let k = 0; k < N * 15; k++) {
      const i = Math.floor(Math.random() * N);
      const j = Math.floor(Math.random() * N);

      if (i === j) {
        continue;
      }

      if (this.graph.hasEdge(String(i), String(j))) {
        continue;
      }

      const a = this.individus[i];
      const b = this.individus[j];

      // Homophilie
      const diffSexe = +(a.gender == b.gender);
      const diffAge = Math.abs(a.age - b.age) / 60;
      const diffLecture = Math.abs(a.reading - b.reading);
      const diffMusique = Math.abs(a.music - b.music);
      const diffSport =
        (1 - Math.abs(a.sport - b.sport)) *
        Math.pow((a.sport + b.sport) / 2, 2);

      const diffEtudes = Math.abs(a.education - b.education) / 3;
      const diffRichesse = Math.abs(a.wealth - b.wealth) / 3;
      const similitude =
        1 -
        (diffSexe * 2 +
          diffAge * 2 +
          diffLecture +
          diffMusique +
          diffSport * 4 +
          diffEtudes +
          diffRichesse) /
          12;

      // Attachement préférentiel
      const degreeA = this.graph.degree(String(i)) + 1;
      const degreeB = this.graph.degree(String(j)) + 1;
      const pref = (degreeA + degreeB) / (2 * this.individus.length);

      // Fermeture triadique
      const neighborsA = new Set(this.graph.neighbors(String(i)));
      const neighborsB = new Set(this.graph.neighbors(String(j)));
      const common = [...neighborsA].filter((n) => neighborsB.has(n)).length;
      const triadic = Math.min(common / 3, 0.5);

      // Probabilité globale
      const p =
        this.p_similitude * similitude +
        this.p_pref * pref +
        this.p_triadic * triadic;
      const r = Math.random();

      //console.log(`${similitude} ${pref} ${triadic} ${p} (>${r})`);

      if (r < p) {
        this.individus[i].edges++;
        this.individus[j].edges++;
        this.graph.addEdge(String(i), String(j),{
          relation: "friends",
          category: "friends",
          weight: 3,
        });
      }
    }
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

  clubAffiliate() {

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
      let retenus = this.shuffle(
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

  generateMany(): void {
    this.clubAffiliate();
  }
}
