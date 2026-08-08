import { Gender } from "../models/Person.js";
import { Random } from "../stats/Random.js";
export class GenderDistribution {
    pyramid;
    constructor(pyramid) {
        this.pyramid = pyramid;
    }
    sample(person) {
        return Random.bool(this.pyramid.maleProbability(person.age))
            ? Gender.Male
            : Gender.Female;
    }
}
//# sourceMappingURL=GenderDistribution.js.map