import { Random } from "./Random.js";

export class NormalDistribution {

    static sample(mean: number, sigma: number): number {

        const u1 = Random.next();

        const u2 = Random.next();

        const z =
            Math.sqrt(-2 * Math.log(u1))
            * Math.cos(2 * Math.PI * u2);

        return mean + sigma * z;

    }

}