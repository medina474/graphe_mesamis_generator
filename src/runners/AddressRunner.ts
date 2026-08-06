import { DirectedGraph } from "graphology";
import { FamilyGenerator } from "../generators/FamilyGenerator.js";
import { Voie } from "../models/Address.js";
import { JsonLoader } from "../loaders/JsonLoader.js";
import { Person } from "../models/Person.js";

export class AddressRunner {
  private voies: Voie[] = [];

  constructor(private readonly graph: DirectedGraph) {}

  public load(clubsVoie: string) {
    this.voies = JsonLoader.load(clubsVoie, Voie);
    this.addVoies(this.voies);
  }

  public run(population: Person[]): void {
    
  }

  addVoies(voies: Voie[]) {
    for (const voie of voies) {
      this.addVoie(voie);
    }
  }

  addVoie(voie: Voie): void {
    this.graph.addNode(voie.id, {
      category: "voie",
      label: voie.voie,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1,
      color: "#ff3535",
    });
  }
}
