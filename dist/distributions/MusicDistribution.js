import { BetaDistribution } from "../stats/BetaDistribution.js";
export class MusicDistribution {
    /**
     * Musique pratique indépendante de l'âge
     * @returns valeur normalisée (0-1)
     */
    sample(person) {
        return BetaDistribution.sample(2, 2);
    }
}
