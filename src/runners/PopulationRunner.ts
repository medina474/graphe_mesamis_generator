import { DirectedGraph } from "graphology";
import { PersonGenerator } from "../generators/PersonGenerator.js";
import { Person, Gender } from "../models/Person.js";

import { FirstnameStat } from "../models/PersonStat.js";
import { LastnameStat } from "../models/PersonStat.js";

import { AgePyramidStat } from "../models/AgePyramidStat.js";

import { AgePyramidLoader } from "../loaders/AgePyramidLoader.js";
import { FirstnameLoader } from "../loaders/FirstnameLoader.js";
import { LastnameLoader } from "../loaders/LastnameLoader.js";

/**
 * Crée une population d'individus
 */
export class PopulationRunner {
  private pyramid: AgePyramidStat;
  private firstnames: FirstnameStat[] = [];
  private lastnames: LastnameStat[] = [];

  constructor(private readonly graph: DirectedGraph) {
    this.pyramid = new AgePyramidStat([]);
  }

  public load(
    pyramidStatPath: string,
    firstnameStatPath: string,
    lastnameStatPath: string,
  ) {
    this.pyramid = AgePyramidLoader.load(pyramidStatPath);
    this.firstnames = FirstnameLoader.load(firstnameStatPath);
    this.lastnames = LastnameLoader.load(lastnameStatPath);
  }

  public run(nb: number, minAge: number, maxAge = Number.MAX_SAFE_INTEGER): Person[] {
    console.log(`----------------------------------------`);
    const generator = new PersonGenerator(
      this.pyramid,
      this.firstnames,
      this.lastnames,
      minAge,
      maxAge,
    );

    const population = generator.generateMany(nb);

    this.addPersons(population);

    return population;
  }

  addPerson(person: Person): void {
    this.graph.addNode(person.id, {
      category: "Person",
      firstname: person.firstname,
      lastname: person.lastname,
      genre: person.gender,
      age: person.age,
      sport: person.sport,
      reading_orig: person.reading,
      reading: person.reading,
      music: person.music,
      education: person.education,
      wealth_orig: person.wealth,
      wealth: person.wealth,
      label: `${person.firstname} ${person.lastname} (${person.age})`,
      color: person.gender === Gender.Male ? "#4A90E2" : "#FF69B4",
      size: 1,
      x_orig: Math.random() * 100,
      y_orig: Math.random() * 100,
    });
  }

  addPersons(persons: Person[]): void {
    for (const person of persons) {
      this.addPerson(person);
    }
  }
}
