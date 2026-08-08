import { DirectedGraph } from "graphology";
import { AddressGenerator } from "../generators/AddressGenerator.js";
import { Address, Voie } from "../models/Address.js";
import { JsonLoader } from "../loaders/JsonLoader.js";
import { AddressLoader } from "../loaders/AddressLoader.js";
import { Person } from "../models/Person.js";
import { Random } from "../stats/Random.js";

const R = 6371000;
const DEG2RAD = Math.PI / 180;

export class AddressRunner {
  private voies: Voie[] = [];
  private addresses: Address[] = [];

  constructor(
    private readonly graph: DirectedGraph,
    private lat0 = 48.75,
    private lon0 = -4,
  ) {}

  public load(voiePath: string, addressPath: string) {
    this.voies = JsonLoader.load(voiePath, Voie);
    this.addVoies(this.voies);

    this.addresses = AddressLoader.load(addressPath, this.voies);
    this.addAddresses(this.addresses);
  }

  public run(population: Person[]): void {
    const addressGenerator = new AddressGenerator(this.graph, this.addresses);
    addressGenerator.generateAll(population);

    for (const p of population) {
      if (p.address) {
        this.graph.addEdge(p.id, p.address.id, {
          relation: "LIVE",
          weight: 1,
        });

        // 20 mètres autour
        const { x, y } = this.geoToGraph(p.address.lat, p.address.lon);
        const position = Random.around(x, y, 0.1);

        this.graph.mergeNodeAttributes(p.id, {
          x: position.x,
          y: position.y,
          x_orig: position.x,
          y_orig: position.y,
        });
      }
    }
  }

  /**
   *
   * @param lat hectomètres
   * @param lon
   * @returns
   */
  private geoToGraph(lat: number, lon: number) {
    const x =
      ((lon - this.lon0) * DEG2RAD * Math.cos(this.lat0 * DEG2RAD) * R) / 100.0;

    const y = ((lat - this.lat0) * DEG2RAD * R) / 100.0;

    return { x, y };
  }

  addVoies(voies: Voie[]) {
    for (const voie of voies) {
      this.addVoie(voie);
    }
  }

  addVoie(voie: Voie): void {
    this.graph.addNode(voie.id, {
      category: "Way",
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
    const { x, y } = this.geoToGraph(address.lat, address.lon);

    this.graph.addNode(address.id, {
      category: "Address",
      label: address.label,
      x,
      y,
      x_orig: x,
      y_orig: y,
      size: 1,
      color: "#540303",
    });

    this.graph.addEdge(address.id, address.voie.id, {
      relation: "place",
      weight: 1,
    });
  }
}
