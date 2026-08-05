import { Distribution } from "./Distribution.js";
import { Person } from "../models/Person.js";
import { Random } from "../stats/Random.js";

export class ReadingDistribution
    implements Distribution<number>{

    sample(person:Partial<Person>):number{

        // Base : 15% + effet de l'éducation + effet de l'âge
        let meanRead = 0.15 + 0.18 * person.education! + 0.002 * (person.age! - 18);

        // Femmes plus lectrices : ajout d’un bonus
        if (person.gender === "F") meanRead += 0.16;

        // Bonus sénior : lecture plus fréquente chez les séniors
        if (person.age! > 60) meanRead += 0.09;

        // Clipping entre 0.02 et 0.98
        meanRead = Math.min(Math.max(meanRead, 0.02), 0.98);

        // Paramètres de la distribution bêta
        const a = Math.max(meanRead * 7, 0.5);
        const b = Math.max((1 - meanRead) * 7, 0.5);

        // Tirage aléatoire
        const reading = Random.beta(a, b);

        return reading;
    }
}
