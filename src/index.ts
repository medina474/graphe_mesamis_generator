import fs from 'fs';
import { Club } from "./models/Club.js";
import { Enterprise } from "./models/Enterprise.js";
import { PersonGenerator } from "./generators/PersonGenerator.js";
import { ClubMembershipGenerator } from "./generators/ClubMembershipGenerator.js";
import { AgePyramidLoader } from "./loaders/AgePyramidLoader.js";
import { FirstnameLoader } from "./loaders/FirstnameLoader.js";
import { LastnameLoader } from "./loaders/LastnameLoader.js";
import { FriendshipRunner } from "./runners/FriendshipRunner.js";
import { LibrariesRunner } from "./runners/LibrariesRunner.js";
import { CsvPersonExporter } from "./exporters/CsvPersonExporter.js";
import { JsonLoader } from "./loaders/JsonLoader.js";
import { DirectedGraph } from "graphology";
import { FamilyGenerator } from "./generators/FamilyGenerator.js";
import { WorkGenerator } from "./generators/WorkGenerator.js";
import { GraphManager } from "./graph/GraphManager.js";

function runMembership() {
    const clubs = JsonLoader.load("data/clubs.json", Club)

    graphManager.addClubs(clubs);

    const clubMembershipGenerator = new ClubMembershipGenerator(
        graph,
        population,
        clubs
    );

    clubMembershipGenerator.generate();
    graphManager.updateClubs(clubs);
}



const graph: DirectedGraph = new DirectedGraph();
const graphManager = new GraphManager(graph);

const generator = new PersonGenerator(
    AgePyramidLoader.load("data/age-pyramid-guyane.json"),
    FirstnameLoader.load("data/prenoms.json"),
    await LastnameLoader.load("data/noms.csv"),
    1, 85);

const population = generator.generateMany(250);

graphManager.addPersons(population);

/* Familles */

const familyGenerator = new FamilyGenerator(
    graph,
    population
);

await familyGenerator.generate();

/* Entreprises */

const enterprises = JsonLoader.load("data/entreprises.json", Enterprise);

graphManager.addEnterprises(enterprises);

const workGenerator = new WorkGenerator(graph, population, enterprises);

workGenerator.generate();
graphManager.updateEnterprises(enterprises);

runMembership();

const friendshipRunner = new FriendshipRunner(graph);
friendshipRunner.run(population);

const librariesRunner = new LibrariesRunner(graph);
await librariesRunner.run()

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

/*
const graphExporter = new GraphExporter();
await graphExporter.export(graph, "output/graph.json");
*/
