import { Distribution } from "./Distribution.js";
import { Education, Person } from "../models/Person.js";
import { Random } from "../stats/Random.js";

export class EducationDistribution
    implements Distribution<Education>{

    sample(person:Partial<Person>):Education{

        // --- Niveau d'études influencé par âge ---
        const base = [0.25, 0.35, 0.25, 0.15];
        const ageEffect = (30 - person.age!) / 60;
        const adjust = [-0.05, 0, 0.03, 0.02].map(v => v * (1 + ageEffect));

        // Calcul des probabilités corrigées
        let probs = base.map((b, i) => Math.min(0.9, Math.max(0.01, b + adjust[i])));

        return Random.weightedChoice(
            [
                Education.None,
                Education.CAP,
                Education.Bac,
                Education.Superior
            ],
            probs
        );
    }
}
