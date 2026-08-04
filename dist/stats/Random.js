import { MersenneTwister19937, Random as RandomJS } from "random-js";
export class Random {
    static engine = MersenneTwister19937.autoSeed();
    static random = new RandomJS(Random.engine);
    /**
     * Initialise le générateur avec une graine.
     */
    static seed(seed) {
        this.engine = MersenneTwister19937.seed(seed);
        this.random = new RandomJS(this.engine);
    }
    /**
     * Réel entre 0 et 1.
     */
    static next() {
        return this.random.real(0, 1, false);
    }
    /**
     * Entier inclusif.
     */
    static int(min, max) {
        return this.random.integer(min, max);
    }
    /**
     * Réel.
     */
    static float(min, max) {
        return this.random.real(min, max, false);
    }
    /**
     * Booléen.
     */
    static bool(probability = 0.5) {
        return this.next() < probability;
    }
    /**
     * Choix uniforme.
     */
    static choice(array) {
        if (!array || array.length === 0)
            throw new Error("Empty array");
        return array[this.int(0, array.length - 1)];
    }
    /**
     * Choix pondéré.
     */
    static weightedChoice(values, weights) {
        if (values.length !== weights.length)
            throw new Error("values/weights size mismatch");
        const total = weights.reduce((a, b) => a + b, 0);
        let r = this.float(0, total);
        for (let i = 0; i < values.length; i++) {
            r -= weights[i];
            if (r <= 0)
                return values[i];
        }
        return values[values.length - 1];
    }
    static shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    /**
     * Distribution normale (gaussien) entre 0 et 1
     * @returns number
     */
    static normal(mean, sigma) {
        let u = 0;
        let v = 0;
        while (u === 0)
            u = Random.next();
        while (v === 0)
            v = Random.next();
        const z = Math.sqrt(-2 * Math.log(u))
            * Math.cos(2 * Math.PI * v);
        return mean + sigma * z;
    }
    static cosineSimilarity(a, b) {
        let dot = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] ** 2;
            normB += b[i] ** 2;
        }
        if (normA === 0 || normB === 0) {
            return 0;
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
