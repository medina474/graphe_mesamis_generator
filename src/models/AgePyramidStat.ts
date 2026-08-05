export interface AgePyramidEntry {
    age: number;
    male: number;
    female: number;
}

/**
 * https://www.insee.fr/fr/outil-interactif/5014911/pyramide.htm?#!t=2&c=971
 */
export class AgePyramidStat {
  public readonly ages: number[];
  public readonly weights: number[];

  constructor(public readonly entries: AgePyramidEntry[]) {
    this.ages = entries.map((e) => e.age);
    this.weights = entries.map((e) => e.male + e.female);
  }

  /**
   * Population masculine d'un âge.
   */
  male(age: number): number {
    const e = this.entries.find((x) => x.age === age);
    return e ? e.male : 0;
  }

  /**
   * Population féminine d'un âge.
   */
  female(age: number): number {
    const e = this.entries.find((x) => x.age === age);
    return e ? e.female : 0;
  }

  /**
   * Population totale d'un âge.
   */
  total(age: number): number {
    return this.male(age) + this.female(age);
  }

  /**
   * Population totale.
   */
  population(): number {
    return this.entries.reduce((sum, e) => sum + e.male + e.female, 0);
  }

  maleProbability(age: number): number {
    return this.male(age) / this.total(age);
  }

  femaleProbability(age: number): number {
    return this.female(age) / this.total(age);
  }
}
