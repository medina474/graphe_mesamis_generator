import jstat from "jstat";
export class BetaDistribution {
    /**
     * Génère une valeur selon une loi Beta(alpha, beta)
     *
     * @param alpha paramètre de forme α (>0)
     * @param beta paramètre de forme β (>0)
     * @returns une valeur comprise entre 0 et 1
     */
    static sample(alpha, beta) {
        if (alpha <= 0 || beta <= 0) {
            throw new Error("Les paramètres alpha et beta doivent être strictement positifs");
        }
        return jstat.beta.sample(alpha, beta);
    }
}
