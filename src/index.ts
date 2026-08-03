import { mkdirSync } from "node:fs";
import { Gender } from "./models/Person.js";
import { Club } from "./models/Club.js";
import { Enterprise } from "./models/Enterprise.js";
import { PersonGenerator } from "./generators/PersonGenerator.js";
import { ClubMembershipGenerator } from "./generators/ClubMembershipGenerator.js";
import { AgePyramidLoader } from "./loaders/AgePyramidLoader.js";
import { FirstnameLoader } from "./loaders/FirstnameLoader.js";
import { LastnameLoader } from "./loaders/LastnameLoader.js";
import { CsvPersonExporter } from "./exporters/CsvPersonExporter.js";
import fs from 'fs';
import { JsonLoader } from "./loaders/JsonLoader.js";
import { DirectedGraph } from "graphology";
import { FamilyGenerator } from "./generators/FamilyGenerator.js";
import { WorkGenerator } from "./generators/WorkGenerator.js";
import { GraphNodeBuilder } from "./graph/GraphNodeBuilder.js";

const graph: DirectedGraph = new DirectedGraph();
const nodeBuilder = new GraphNodeBuilder(graph);

const generator = new PersonGenerator(
    AgePyramidLoader.load("data/age-pyramid-guyane.json"),
    FirstnameLoader.load("data/prenoms.json"),
    LastnameLoader.load("data/noms.csv"),
    0, 85);

const population = generator.generateMany(250);

nodeBuilder.addPersons(population);

/* Familles */
const familyGenerator = new FamilyGenerator(
    graph,
    population
);

familyGenerator.generate();

/* Clubs */
const clubs = JsonLoader.load("data/clubs.json", Club)

nodeBuilder.addClubs(clubs);

const clubMembershipGenerator = new ClubMembershipGenerator(
    graph,
    population,
    clubs
    );

clubMembershipGenerator.generate();

/* Entreprises */
const enterprises = JsonLoader.load("data/entreprises.json", Enterprise)

nodeBuilder.addEnterprises(enterprises);

const workGenerator = new WorkGenerator(graph, population, enterprises)

workGenerator.generate();

/* Export */

mkdirSync("output", { recursive: true });

const exporter = new CsvPersonExporter();

await exporter.export(
    population,
    "output/persons.csv"
);

await fs.writeFile(
    "./output/relationships.json",
    JSON.stringify(graph.export(), null, 2),
    (err) => err && console.error(err)
);

/*
const graphExporter = new GraphExporter();
await graphExporter.export(graph, "output/graph.json");
*/