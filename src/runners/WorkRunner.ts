import { DirectedGraph } from "graphology";
import { JsonLoader } from "../loaders/JsonLoader.js";
import { WorkGenerator } from "../generators/WorkGenerator.js";
import { Enterprise, Facture } from "../models/Enterprise.js";
import { Person } from "../models/Person.js";
import { fa } from "@faker-js/faker";

export class WorkRunner {
  constructor(private readonly graph: DirectedGraph) {}

  public run(population: Person[]): void {
    console.log(`----------------------------------------`);
    const enterprises = JsonLoader.load("data/entreprises.json", Enterprise);

    for (const enterprise of enterprises) {
      this.addEnterprise(enterprise);
    }

    const factures = JsonLoader.load("data/factures.json", Facture);
    for (const facture of factures) {
      this.addFacture(facture);
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
      category: "Enterprise",
      name: enterprise.name,
      label: enterprise.name,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1,
      color: "#ffd035",
    });
  }

  addFacture(facture: Facture): void {
    this.graph.addNode(facture.id, {
      category: "Invoice",
      date: facture.date,
      montant_ht: facture.montant_ht,
      taux_tva: facture.taux_tva,
      montant_tva: facture.montant_tva,
      montant_ttc: facture.montant_ttc,
      size: 1,
      color: "#3575ff",
    });

    console.log(facture)
    this.graph.addEdge(facture.fournisseur, facture.client, {
      relation: "INVOICE",
      weight: 1,
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
