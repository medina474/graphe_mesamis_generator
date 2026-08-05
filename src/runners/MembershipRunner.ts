import { DirectedGraph } from "graphology";
import { JsonLoader } from "../loaders/JsonLoader.js";
import { Person } from "../models/Person.js";
import { Club } from "../models/Club.js";
import { ClubMembershipGenerator } from "../generators/ClubMembershipGenerator.js";

export class MembershipRunner {
  constructor(private readonly graph: DirectedGraph) {}

  public run(population: Person[]): void {
    console.log(`----------------------------------------`);
    const clubs = JsonLoader.load("data/clubs.json", Club);

    this.addClubs(clubs);

    const clubMembershipGenerator = new ClubMembershipGenerator(
      this.graph,
      population,
      clubs,
    );

    clubMembershipGenerator.generate();
    this.updateClubs(clubs);
  }

  addClubs(clubs: Club[]): void {
    for (const club of clubs) {
      this.addClub(club);
    }
  }

  addClub(club: Club): void {
    this.graph.addNode(club.id, {
      category: "club",
      name: club.name,
      label: club.name,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1,
      color: "#82ff69",
    });
  }

  updateClubs(clubs: Club[]): void {
    for (const club of clubs) {
      this.graph.mergeNodeAttributes(club.id, {
        size: Math.ceil(club.size / 3.0),
      });
    }
  }
}
