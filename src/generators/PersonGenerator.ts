import { Gender, Person } from "../models/Person.js";

import { AgePyramidStat } from "../models/AgePyramidStat.js";
import { FirstnameStat } from "../models/PersonStat.js";
import { LastnameStat } from "../models/PersonStat.js";

import { AgeDistribution } from "../distributions/AgeDistribution.js";
import { GenderDistribution } from "../distributions/GenderDistribution.js";
import { FirstnameDistribution } from "../distributions/FirstnameDistribution.js";
import { LastnameDistribution } from "../distributions/LastnameDistribution.js";

import { EducationDistribution } from "../distributions/EducationDistribution.js";
import { WealthDistribution } from "../distributions/WealthDistribution.js";
import { SportDistribution } from "../distributions/SportDistribution.js";
import { ReadingDistribution } from "../distributions/ReadingDistribution.js";
import { MusicDistribution } from "../distributions/MusicDistribution.js";

export class PersonGenerator {
  private readonly ageDistribution: AgeDistribution;
  private readonly genderDistribution: GenderDistribution;

  private readonly firstnameDistribution: FirstnameDistribution;
  private readonly lastnameDistribution: LastnameDistribution;

  private readonly educationDistribution: EducationDistribution;
  private readonly wealthDistribution: WealthDistribution;

  private readonly sportDistribution: SportDistribution;
  private readonly readingDistribution: ReadingDistribution;
  private readonly musicDistribution: MusicDistribution;

  constructor(
    private readonly pyramid: AgePyramidStat,
    private readonly firstnames: FirstnameStat[],
    private readonly lastnames: LastnameStat[],
    minAge = 18,
    maxAge = Number.MAX_SAFE_INTEGER,
  ) {
    this.ageDistribution = new AgeDistribution(pyramid, minAge);
    this.genderDistribution = new GenderDistribution(pyramid);
    this.firstnameDistribution = new FirstnameDistribution(firstnames);
    this.lastnameDistribution = new LastnameDistribution(lastnames);
    this.educationDistribution = new EducationDistribution();
    this.wealthDistribution = new WealthDistribution();
    this.sportDistribution = new SportDistribution();
    this.readingDistribution = new ReadingDistribution();
    this.musicDistribution = new MusicDistribution();
  }

  /**
   * Génère un individu complet
   */
  generate(id: string): Person {
    /*
     * On construit progressivement l'individu (interface + partial plutôt que class).
     *
     * Les distributions peuvent utiliser
     * les propriétés déjà présentes.
     */
    const person = new Person (id);

    // Caractéristiques démographiques

    person.age = this.ageDistribution.sample(person);

    person.gender = this.genderDistribution.sample(person);

    person.firstname = this.firstnameDistribution.sample(person);

    person.lastname = this.lastnameDistribution.sample(person);

    if (person.age < 18) return person;

    // Caractéristiques sociales

    person.education = this.educationDistribution.sample(person);
    person.wealth = this.wealthDistribution.sample(person);

    // Centres d'intérêt

    person.sport = this.sportDistribution.sample(person);
    person.reading = this.readingDistribution.sample(person);
    person.music = this.musicDistribution.sample(person);

    return person;
  }

  /**
   * Génère une population complète
   */
  generateMany(count: number): Person[] {
    const persons: Person[] = [];

    for (let i = 1; i <= count; i++) {
      persons.push(this.generate(i.toString()));
    }

    return persons;
  }
}
