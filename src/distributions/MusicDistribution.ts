import { Distribution } from "./Distribution.js";
import { Person } from "../models/Person.js";
import { BetaDistribution } from "../stats/BetaDistribution.js";

export class MusicDistribution
    implements Distribution<number>{

    /**
     * Musique pratique indépendante de l'âge
     * @returns valeur normalisée (0-1)
     */
    sample(person:Partial<Person>):number{

        return BetaDistribution.sample(2, 2)
    }
}
