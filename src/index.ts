import fs from "fs";
import { PopulationRunner } from "./runners/PopulationRunner.js";
import { FamilyRunner } from "./runners/FamilyRunner.js";
import { FriendshipRunner } from "./runners/FriendshipRunner.js";
import { LibrariesRunner } from "./runners/LibrariesRunner.js";
import { MembershipRunner } from "./runners/MembershipRunner.js";
import { WorkRunner } from "./runners/WorkRunner.js";
import { AddressRunner } from "./runners/AddressRunner.js";
import { CsvPersonExporter } from "./exporters/CsvPersonExporter.js";
import { MultiDirectedGraph } from "graphology";

const graph: MultiDirectedGraph = new MultiDirectedGraph();

const populationRunner = new PopulationRunner(graph);
populationRunner.load(
  "data/age-pyramid-guyane.json",
  "data/prenoms.json",
  "data/noms.csv",
);
const population = populationRunner.run(20, 1, 85);
/*
const familyRunner = new FamilyRunner(graph);
familyRunner.run(population);

const workRunner = new WorkRunner(graph);
workRunner.run(population);

const membershipRunner = new MembershipRunner(graph);
membershipRunner.load("data/clubs.json");
membershipRunner.run(population);
*/
const librariesRunner = new LibrariesRunner(graph);
librariesRunner.load("data/serie.csv", "data/books.csv", "data/libraries.json");
librariesRunner.run(500, population.filter(p => p.age > 18));
librariesRunner.update();
/*
const addressRunner = new AddressRunner(graph);
addressRunner.load("data/voies.json", "data/adresses.csv");
addressRunner.run(population);
*/

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

await fs.writeFile(
  "./output/relationships.json",
  JSON.stringify(graph.export(), null, 2),
  (err) => err && console.error(err),
);
