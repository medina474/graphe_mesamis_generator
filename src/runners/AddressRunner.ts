import { DirectedGraph } from "graphology";
import { AddressGenerator } from "../generators/AddressGenerator.js";
import { Address, Voie } from "../models/Address.js";
import { JsonLoader } from "../loaders/JsonLoader.js";
import { AddressLoader } from "../loaders/AddressLoader.js";
import { Person } from "../models/Person.js";

export class AddressRunner {
  private voies: Voie[] = [];
  private addresses: Address[] = [];

  constructor(private readonly graph: DirectedGraph) {}

  public async load(voiePath: string, addressPath: string) {
    this.voies = JsonLoader.load(voiePath, Voie);
    this.addVoies(this.voies);

    this.addresses = AddressLoader.load(addressPath, this.voies);
  }

  public run(population: Person[]): void {
    const addressGenerator = new AddressGenerator(this.graph, this.addresses);
    addressGenerator.generateAll(population);
  }

  addVoies(voies: Voie[]) {
    for (const voie of voies) {
      this.addVoie(voie);
    }
  }

  addVoie(voie: Voie): void {
    this.graph.addNode(voie.id, {
      category: "address",
      label: voie.voie,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1,
      color: "#ff3535",
    });
  }

  addAddresses(addresses: Address[]) {
    for (const address of addresses) {
      this.addAddress(address);
    }
  }

  addAddress(address: Address): void {
    this.graph.addNode(address.id, {
      category: "address",
      label: address.voie,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1,
      color: "#540303",
    });
  }
}
