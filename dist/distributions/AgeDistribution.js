import { Random } from "../stats/Random.js";
export class AgeDistribution {
    pyramid;
    ages;
    weights;
    constructor(pyramid, minAge = 18, maxAge = Number.MAX_SAFE_INTEGER) {
        this.pyramid = pyramid;
        const entries = pyramid
            .entries
            .filter((e) => e.age >= minAge && e.age <= maxAge);
        this.ages = entries.map((e) => e.age);
        this.weights = entries.map((e) => e.male + e.female);
    }
    sample(person) {
        return Random.weightedChoice(this.ages, this.weights);
    }
}
//# sourceMappingURL=AgeDistribution.js.map