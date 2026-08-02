import { mkdirSync } from "node:fs";
import { PersonGenerator } from "./generators/PersonGenerator.js";
import { RelationshipGenerator } from "./generators/RelationshipGenerator.js";
import { AgePyramidLoader } from "./stats/loaders/AgePyramidLoader.js";
import { FirstnameLoader } from "./stats/loaders/FirstnameLoader.js";
import { LastnameLoader } from "./stats/loaders/LastnameLoader.js";
import { CsvPersonExporter } from "./exporters/CsvPersonExporter.js";
import fs from 'fs';
import { ClubLoader } from "./stats/loaders/ClubLoader.js";
const generator = new PersonGenerator(AgePyramidLoader.load("data/age-pyramid-guadeloupe.json"), FirstnameLoader.load("data/prenoms.json"), LastnameLoader.load("data/noms.csv"), 0, 85);
const population = generator.generateMany(100);
console.log(population.slice(0, 3));
mkdirSync("output", { recursive: true });
const exporter = new CsvPersonExporter();
await exporter.export(population, "output/persons.csv");
const relationshipGenerator = new RelationshipGenerator(population, ClubLoader.load("data/clubs.json"));
relationshipGenerator.generateMany();
await fs.writeFile("./output/relationships.json", JSON.stringify(relationshipGenerator.export(), null, 2), (err) => err && console.error(err));
/*
const graphExporter = new GraphExporter();
await graphExporter.export(graph, "output/graph.json");
*/ 
