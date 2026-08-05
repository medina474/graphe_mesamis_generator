import { Distribution } from "./Distribution.js";
import { AgePyramidStat } from "../models/AgePyramidStat.js";
import { Person } from "../models/Person.js";
import { Random } from "../stats/Random.js";

export class AgeDistribution implements Distribution<number> {
  private readonly ages: number[];
  private readonly weights: number[];

  constructor(
    private readonly pyramid: AgePyramidStat,
    minAge = 18,
    maxAge = Number.MAX_SAFE_INTEGER,
  ) {
    const entries = pyramid
      .entries
      .filter((e) => e.age >= minAge && e.age <= maxAge);

    this.ages = entries.map((e) => e.age);
    this.weights = entries.map((e) => e.male + e.female);
  }
  sample(person: Partial<Person>): number {
    return Random.weightedChoice(this.ages, this.weights);
  }
}
