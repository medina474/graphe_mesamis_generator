import fs from "fs";
import { PopulationRunner } from "./runners/PopulationRunner.js";
import { FamilyRunner } from "./runners/FamilyRunner.js";
import { FriendshipRunner } from "./runners/FriendshipRunner.js";
import { LibrariesRunner } from "./runners/LibrariesRunner.js";
import { MembershipRunner } from "./runners/MembershipRunner.js";
import { WorkRunner } from "./runners/WorkRunner.js";
import { DirectedGraph } from "graphology";
const graph = new DirectedGraph();
const populationRunner = new PopulationRunner(graph);
await populationRunner.load("data/age-pyramid-guyane.json", "data/prenoms.json", "data/noms.csv");
const population = populationRunner.run(1, 85);
const familyRunner = new FamilyRunner(graph);
familyRunner.run(population);
const workRunner = new WorkRunner(graph);
workRunner.run(population);
const membershipRunner = new MembershipRunner(graph);
membershipRunner.load("data/clubs.json");
membershipRunner.run(population);
const librariesRunner = new LibrariesRunner(graph);
await librariesRunner.load("data/books.csv", "data/libraries.json");
librariesRunner.run(population);
const friendshipRunner = new FriendshipRunner(graph);
friendshipRunner.run(population);
/* Export

mkdirSync("output", { recursive: true });

const exporter = new CsvPersonExporter();

await exporter.export(
    population,
    "output/persons.csv"
);
*/
await fs.writeFile("./output/relationships.json", JSON.stringify(graph.export(), null, 2), (err) => err && console.error(err));
