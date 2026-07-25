import { Distribution } from "./Distribution.js";
import { Gender, Person } from "../models/Person.js";
import { AgePyramid } from "../stats/AgePyramid.js";
import { Random } from "../stats/Random.js";

export class GenderDistribution implements Distribution<Gender> {
  constructor(private readonly pyramid: AgePyramid) {}
  sample(person: Partial<Person>): Gender {

    return Random.bool(this.pyramid.maleProbability(person.age!))
            ? Gender.Male
            : Gender.Female;
  }
}
