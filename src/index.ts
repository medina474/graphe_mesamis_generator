import { mkdirSync } from "node:fs";
import { PersonGenerator } from "./generators/PersonGenerator.js";
import { RelationshipGenerator } from "./generators/RelationshipGenerator.js";
import { AgePyramidLoader } from "./stats/loaders/AgePyramidLoader.js";
import { FirstnameLoader } from "./stats/loaders/FirstnameLoader.js";
import { LastnameLoader } from "./stats/loaders/LastnameLoader.js";
import { CsvPersonExporter } from "./exporters/CsvPersonExporter.js";
import { GraphExporter } from "./exporters/GraphExporter.js";

const generator = new PersonGenerator(
    AgePyramidLoader.load("data/age-pyramid-guadeloupe.json"),
    FirstnameLoader.load("data/prenoms.json"),
    LastnameLoader.load("data/noms.csv"),
    18, 79);

const population = generator.generateMany(5000);

console.log(population.slice(0, 3));

mkdirSync("output", { recursive: true });

const exporter = new CsvPersonExporter();

await exporter.export(
    population,
    "output/persons.csv"
);

const relationshipGenerator = new RelationshipGenerator(population);
const graph = relationshipGenerator.generateMany();

const graphExporter = new GraphExporter();
await graphExporter.export(graph, "output/graph.json");
