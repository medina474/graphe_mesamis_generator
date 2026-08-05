import fs from 'fs';
import { PopulationRunner } from "./runners/PopulationRunner.js";
import { FriendshipRunner } from "./runners/FriendshipRunner.js";
import { LibrariesRunner } from "./runners/LibrariesRunner.js";
import { MembershipRunner } from "./runners/MembershipRunner.js";
import { WorkRunner } from "./runners/WorkRunner.js";
import { DirectedGraph } from "graphology";
const graph = new DirectedGraph();
const populationRunner = new PopulationRunner(graph);
await populationRunner.load();
const population = populationRunner.run(1, 85);
/* Familles */
const workRunner = new WorkRunner(graph);
workRunner.run(population);
const membershipRunner = new MembershipRunner(graph);
membershipRunner.run(population);
const librariesRunner = new LibrariesRunner(graph);
await librariesRunner.run();
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
