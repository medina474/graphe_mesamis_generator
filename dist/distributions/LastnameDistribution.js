import { Random } from "../stats/Random.js";
export class LastnameDistribution {
    values;
    weights;
    constructor(lastnames) {
        this.values = lastnames.map((e) => e.name);
        this.weights = lastnames.map((e) => e.count);
    }
    sample(person) {
        return Random.weightedChoice(this.values, this.weights);
    }
}
//# sourceMappingURL=LastnameDistribution.js.map