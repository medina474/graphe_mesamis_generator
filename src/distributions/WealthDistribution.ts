import { Distribution } from "./Distribution.js";
import { Person } from "../models/Person.js";
import { Random } from "../stats/Random.js";

export class WealthDistribution
    implements Distribution<number>{

    sample(person:Partial<Person>):number{

        // Ajoute un bruit gaussien (moyenne 0, écart-type 0.7)
        const wealthCont = person.education! / 2 + Random.normal(0.2, 0.9);

        // Classification en 4 niveaux selon la valeur continue
        let wealth;
        if (wealthCont < 0.5) {
            wealth = 0;
        } else if (wealthCont < 1.5) {
            wealth = 1;
        } else if (wealthCont < 2.5) {
            wealth = 2;
        } else {
            wealth = 3;
        }

        return wealth;
    }
}
