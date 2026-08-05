import fs from 'fs';
import { Club } from "./models/Club.js";
import { Enterprise } from "./models/Enterprise.js";
import { PersonGenerator } from "./generators/PersonGenerator.js";
import { ClubMembershipGenerator } from "./generators/ClubMembershipGenerator.js";
import { PopulationRunner } from "./runners/PopulationRunner.js";
import { FamilyRunner } from "./runners/FamilyRunner.js";
import { FriendshipRunner } from "./runners/FriendshipRunner.js";
import { LibrariesRunner } from "./runners/LibrariesRunner.js";
import { MembershipRunner } from "./runners/MembershipRunner.js";
import { WorkRunner } from "./runners/WorkRunner.js";
import { CsvPersonExporter } from "./exporters/CsvPersonExporter.js";
import { DirectedGraph } from "graphology";
import { FamilyGenerator } from "./generators/FamilyGenerator.js";

const graph: DirectedGraph = new DirectedGraph();

const populationRunner = new PopulationRunner(graph);
await populationRunner.load();
const population = populationRunner.run(1, 85);

/* Familles */



const workRunner = new WorkRunner(graph);
workRunner.run(population);

const membershipRunner = new MembershipRunner(graph);
membershipRunner.run(population);

const librariesRunner = new LibrariesRunner(graph);
await librariesRunner.run()

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
    (err) => err && console.error(err)
);
