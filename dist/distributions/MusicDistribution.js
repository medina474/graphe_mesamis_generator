import { Random } from "../stats/Random.js";
export class MusicDistribution {
    /**
     * Musique pratique indépendante de l'âge
     * @returns valeur normalisée (0-1)
     */
    sample(person) {
        return Random.beta(2, 2);
    }
}
