import { DirectedGraph } from "graphology";
import { JsonLoader } from "../loaders/JsonLoader.js";
import { WorkGenerator } from "../generators/WorkGenerator.js";
import { Enterprise } from "../models/Enterprise.js";
import { Person } from "../models/Person.js";

export class WorkRunner {
  constructor(private readonly graph: DirectedGraph) {}

  public run(population: Person[]): void {
    console.log(`----------------------------------------`);
    const enterprises = JsonLoader.load("data/entreprises.json", Enterprise);

    for (const enterprise of enterprises) {
      this.addEnterprise(enterprise);
    }

    const workGenerator = new WorkGenerator(
      this.graph,
      population,
      enterprises,
    );

    workGenerator.generate();
    this.updateEnterprises(enterprises);
  }

  addEnterprise(enterprise: Enterprise): void {
    this.graph.addNode(enterprise.id, {
      category: "enterprise",
      name: enterprise.name,
      label: enterprise.name,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1,
      color: "#ffd035",
    });
  }

  updateEnterprises(enterprises: Enterprise[]): void {
    for (const enterprise of enterprises) {
      this.graph.mergeNodeAttributes(enterprise.id, {
        size: Math.ceil(enterprise.effectif / 3.0),
      });
    }
  }
}
