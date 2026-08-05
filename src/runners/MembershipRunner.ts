import { DirectedGraph } from "graphology";
import { JsonLoader } from "../loaders/JsonLoader.js";
import { Person } from "../models/Person.js";
import { Club } from "../models/Club.js";
import { ClubMembershipGenerator } from "../generators/ClubMembershipGenerator.js";

export class MembershipRunner {
  private clubs: Club[] = [];

  constructor(private readonly graph: DirectedGraph) {}

  /**
   * Charge la liste des clubs depuis un fichier json.
   * Ajoute les clubs au graphe.
   * @param clubsPath
   */
  public load(clubsPath: string) {
    this.clubs = JsonLoader.load(clubsPath, Club);
    this.addClubs(this.clubs);
  }

  public run(population: Person[]): void {
    console.log(`----------------------------------------`);

    const clubMembershipGenerator = new ClubMembershipGenerator(
      this.graph,
      population,
      this.clubs,
    );

    clubMembershipGenerator.generate();

    this.updateClubs(this.clubs);
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
