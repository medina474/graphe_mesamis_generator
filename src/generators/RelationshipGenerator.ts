import { Console } from "console";
import { CsvPersonExporter } from "../exporters/CsvPersonExporter.js";
import { Gender, Person } from "../models/Person.js";
import { UndirectedGraph } from "graphology";
import { Club } from "../models/Club.js";
import { nodeCrypto } from "random-js";
import { Random } from "../stats/Random.js";

export class RelationshipGenerator {
  private p_pref = 0.45; // 0.45
  private p_triadic = 0.45; // 0.40
  private p_similitude = 1 - this.p_pref - this.p_triadic;

  constructor(
    private graph: UndirectedGraph,
    private individus: Person[],
  ) {
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
  
  generateMany(): void {
    
  }
}
