import { DirectedGraph } from "graphology";
import { FriendsGenerator } from "../generators/FriendsGenerator.js";
import { Person } from "../models/Person.js";

export class FriendshipRunner {

    constructor(
        private readonly graph: DirectedGraph
    ) {}

    public run(population: Person[], iterations: number):void {
        console.log(`----------------------------------------`);
        const friendsGenerator = new FriendsGenerator(this.graph, population);
        friendsGenerator.generate(iterations);
        this.updatePersons(population);
    }

    updatePersons(personnes: Person[]): void {
        for (const personne of personnes) {
            this.graph.mergeNodeAttributes(personne.id, {
                size: 1.0,
            });
        }
    }
}