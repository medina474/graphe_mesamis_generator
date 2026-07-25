import { MersenneTwister19937, Random as RandomJS } from "random-js";

export class Random {

    private static engine = MersenneTwister19937.autoSeed();

    private static random = new RandomJS(Random.engine);

    /**
     * Initialise le générateur avec une graine.
     */
    static seed(seed: number): void {
        this.engine = MersenneTwister19937.seed(seed);
        this.random = new RandomJS(this.engine);
    }

    /**
     * Réel entre 0 et 1.
     */
    static next(): number {
        return this.random.real(0, 1, false);
    }

    /**
     * Entier inclusif.
     */
    static int(min: number, max: number): number {
        return this.random.integer(min, max);
    }

    /**
     * Réel.
     */
    static float(min: number, max: number): number {
        return this.random.real(min, max, false);
    }

    /**
     * Booléen.
     */
    static bool(probability = 0.5): boolean {
        return this.next() < probability;
    }

    /**
     * Choix uniforme.
     */
    static choice<T>(array: readonly T[]): T {

        if (array.length === 0)
            throw new Error("Empty array");

        return array[this.int(0, array.length - 1)];
    }

    /**
     * Choix pondéré.
     */
    static weightedChoice<T>(
        values: readonly T[],
        weights: readonly number[]
    ): T {

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

}