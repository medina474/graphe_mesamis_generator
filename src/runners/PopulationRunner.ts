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
  private firstnames: FirstnameStat[];
  private lastnames: LastnameStat[];

  constructor(private readonly graph: DirectedGraph) {
    this.pyramid = new AgePyramidStat([]);
    this.lastnames = [];
    this.firstnames = [];
  }

  public async load(
    pyramidStatPath: string,
    firstnameStatPath: string,
    lastnameStatPath: string,
  ) {
    this.pyramid = AgePyramidLoader.load(pyramidStatPath);
    this.firstnames = FirstnameLoader.load(firstnameStatPath);
    this.lastnames = await LastnameLoader.load(lastnameStatPath);
  }

  public run(minAge: number, maxAge = Number.MAX_SAFE_INTEGER): Person[] {
    console.log(`----------------------------------------`);
    const generator = new PersonGenerator(
      this.pyramid,
      this.firstnames,
      this.lastnames,
      minAge,
      maxAge,
    );

    const population = generator.generateMany(250);

    this.addPersons(population);

    return population;
  }

  addPerson(person: Person): void {
    this.graph.addNode(person.id, {
      category: "person",
      firstname: person.firstname,
      lastname: person.lastname,
      age: person.age,
      x: Math.random() * 100,
      y: Math.random() * 100,
      label: `${person.firstname} ${person.lastname} ${person.age}`,
      size: 3,
      color: person.gender === Gender.Male ? "#4A90E2" : "#FF69B4",
    });
  }

  addPersons(persons: Person[]): void {
    for (const person of persons) {
      this.addPerson(person);
    }
  }
}
