import { DirectedGraph } from "graphology";
import { FamilyGenerator } from "../generators/FamilyGenerator.js";
import { Person } from "../models/Person.js";

export class FamilyRunner {

    constructor(
        private readonly graph: DirectedGraph
    ) {}

    public run(population: Person[]):void {
        const familyGenerator = new FamilyGenerator(
            this.graph,
            population
        );
        
        familyGenerator.generate();
    }
}