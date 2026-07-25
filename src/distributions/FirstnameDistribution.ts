import { Distribution } from "./Distribution.js";
import { Gender, Person } from "../models/Person.js";
import { Random } from "../stats/Random.js";

/**
 * https://www.insee.fr/fr/statistiques/3532172
 */
export class FirstnameDistribution
    implements Distribution<string>{

    sample(person:Partial<Person>):string{

        const pool = [
            [
            [ "Lucas","Léo","Nathan","Gabriel","Maël","Hugo","Ethan","Noah","Arthur","Gabin",
                "Tom","Medhi","Evan","Sacha","Rayan","Mathis","Enzo","Théo","Isaac","Liam"
            ],
            [ "Julien","Maxime","Alexandre","Pierre","Antoine","Romain","Jérémy","Kevin","Nicolas","Benjamin",
                "Florian","Vincent","Michaël","Samuel","Baptiste","Yann","Cédric","Quentin","Thomas","Adrien",
                "Emmanuel", "Marc", "Sébastien", "Olivier", "Laurent"
            ],
            [ "Jean","Michel","Christian","Philippe","Daniel","Patrick","Bernard","Alain","Jacques","Guy",
                "Louis","André","Roger","Maurice","Robert","Henri","François","Gérard","Serge","Raymond", "Didier"
            ]
            ],
            [
            [ "Emma","Léa","Manon","Chloé","Jade","Lina","Lola","Anna","Zoé","Mila",
                "Camille","Nina","Darya","Léna","Louise","Inès","Julia","Samia","Clara","Maya"
            ],
            [ "Marine","Laura","Céline","Charlotte","Elodie","Marion","Sophie","Julie","Amélie","Amandine",
                "Valérie","Aurélie","Isabelle","Caroline","Sonia","Laurence","Cécile","Stéphanie","Sandrine","Emilie",
                "Hélène", "Myriam", "Murielle"
            ],
            [ "Marie","Monique","Françoise","Denise","Nicole","Pierrette","Madeleine","Colette","Agnès","Simone",
                "Geneviève","Jacqueline","Jeanne","Yvonne","Raymonde","Thérèse","Lucienne","Gisèle","Marguerite","Suzanne"
            ]
            ]
        ];

        const ageGroups = [
            { max: 30, index: 0 },
            { max: 50, index: 1 },
            { max: Infinity, index: 2 }
        ];

        const p = ageGroups.find(g => person.age! <= g.max)?.index ?? 2;
        const s = person.gender === Gender.Male ? 0 : 1;

        return Random.choice(pool[s][p]);
    }
}