import { Gender, Person } from "../models/Person.js";
import { UndirectedGraph } from "graphology";

export class RelationshipGenerator {

    private p_pref = 0.45;     // 0.45
    private p_triadic = 0.45;  // 0.40
    private p_similitude = 1 - this.p_pref - this.p_triadic;

    private graph: UndirectedGraph;

    private hommes: Person[];
    private femmes: Person[];

    constructor(private individus: Person[]) {
        this.graph = new UndirectedGraph;

        for (let k = 0 ; k < this.individus.length ; k++) {
            this.graph.addNode(this.individus[k].id, 
                { 'firstname': this.individus[k].firstname,
                  'lastname': this.individus[k].lastname  
                })
        }

        this.hommes = individus.filter(i => i.gender === Gender.Male)
        this.femmes = individus.filter(i => i.gender === Gender.Female)
    }

    generateFriends()
    {
        const N = this.individus.length;

        for (let k = 0 ; k < N * 15 ; k++) {

            const i = Math.floor(Math.random() * N);
            const j = Math.floor(Math.random() * N);

            console.log(`${i} ? ${j}`);

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
            const diffSport = (1 - Math.abs(a.sport - b.sport)) * Math.pow((a.sport + b.sport) / 2, 2);

            const diffEtudes = Math.abs(a.education - b.education) / 3;
            const diffRichesse = Math.abs(a.wealth - b.wealth) / 3;
            const similitude = 1 - (diffSexe * 2 + diffAge * 2 + diffLecture + diffMusique + diffSport * 4 + diffEtudes + diffRichesse) / 12;

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
            const p = this.p_similitude * similitude + this.p_pref * pref + this.p_triadic * triadic;
            const r = Math.random();

            //console.log(`${similitude} ${pref} ${triadic} ${p} (>${r})`);

            if (r < p) {
                this.individus[i].edges++;
                this.individus[j].edges++;
                this.graph.addEdge(String(i), String(j));
            }
        }
    }

    generateCouple(minAge: number, maxAge: number, celibacyRate: number)
    {
        const femmes = this.femmes.filter(
            f => f.married === false && f.age >= minAge && f.age <= maxAge
        );

        for (const femme of femmes) {

            // Cette personne reste célibataire
            if (Math.random() < celibacyRate) {
                continue;
            }

            // Recherche des hommes compatibles. Hommes non mariés pas moins de 5 ans de moins
            // que la femme et au plus 10 ans de plus
            // Trier par écart d'age
            // ToDo : ajouter le niveau d'étude qui est très déterminant.
            const candidats = this.hommes.filter(h => !h.married)
                .map(homme => ({
                    homme,
                    ecartAge: Math.abs(femme.age - homme.age)
                }))
                .filter(c => c.homme.age > femme.age - 5 && c.homme.age < femme.age + 10)
                .sort((a, b) => a.ecartAge - b.ecartAge);

            if (candidats.length === 0) {
                continue;
            }

            // Pour l'instant : choisir aléatoirement parmi
            // les trois meilleurs candidats
            const nb = Math.min(3, candidats.length);
            const candidat = candidats[Math.floor(Math.random() * nb)];

            const homme = candidat.homme;

            this.graph.addEdge(femme.id, homme.id, {
                type: "marriage"
            });

            // Une personne ne peut être marié qu'une fois
            homme.married = true;
            femme.married = true;
        }
    }

    generateMany() :UndirectedGraph
    {
        this.generateCouple(65, 120, 0.3);

        return this.graph;
    }

    export(): object {
        return this.graph.export();
    }
}
