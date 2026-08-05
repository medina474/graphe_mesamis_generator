import { Distribution } from "./Distribution.js";
import { Person } from "../models/Person.js";
import { Random } from "../stats/Random.js";

export class SportDistribution
    implements Distribution<number>{

    sample(person:Partial<Person>):number{

        // Moyenne de sport qui diminue avec l’âge
        let meanSport = Math.min(Math.max(0.65 - 0.0065 * (person.age! - 18), 0.05), 0.9);

        if (person.gender === "F") meanSport -= 0.15;

        // Paramètres de la distribution bêta
        const a = Math.max(meanSport * 6, 0.5);
        const b = Math.max((1 - meanSport) * 6, 0.5);

        // Tirage aléatoire selon Beta(a, b)
        const sport = Random.beta(a, b);

        return sport;
    }
}
