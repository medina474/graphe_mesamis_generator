import { mkdirSync } from "node:fs";
import { Gender } from "./models/Person.js";
import { PersonGenerator } from "./generators/PersonGenerator.js";
import { ClubMembershipGenerator } from "./generators/ClubMembershipGenerator.js";
import { AgePyramidLoader } from "./stats/loaders/AgePyramidLoader.js";
import { FirstnameLoader } from "./stats/loaders/FirstnameLoader.js";
import { LastnameLoader } from "./stats/loaders/LastnameLoader.js";
import { CsvPersonExporter } from "./exporters/CsvPersonExporter.js";
import fs from 'fs';
import { ClubLoader } from "./stats/loaders/ClubLoader.js";
import { UndirectedGraph } from "graphology";
import { FamilyGenerator } from "./generators/FamilyGenerator.js";

const graph: UndirectedGraph = new UndirectedGraph();

const generator = new PersonGenerator(
    AgePyramidLoader.load("data/age-pyramid-guyane.json"),
    FirstnameLoader.load("data/prenoms.json"),
    LastnameLoader.load("data/noms.csv"),
    0, 85);

const population = generator.generateMany(100);

console.log(population.slice(0, 3));

/* Ajouter la population au graphe */
for (let p of population) 
{
    graph.addNode(
        p.id, 
        {
            category: 'person',
            firstname: p.firstname,
            lastname: p.lastname,
            age: p.age,
            x: Math.random() * 100,
            y: Math.random() * 100,
            label: `${p.firstname} ${p.lastname} ${p.age}`,
            size: 3,
            color: p.gender === Gender.Male ? "#4A90E2" : "#FF69B4",
        }
    );
}

/* Familles */
const familyGenerator = new FamilyGenerator(
    graph,
    population
);

familyGenerator.generate();

/* Clubs */
const clubs = ClubLoader.load("data/clubs.json")

console.log(clubs.slice(0, 1))

for (const club of clubs) 
{
    club.size = 1
    graph.addNode(
        club.id, 
        {
            category: 'club',
            name: club.name,
            label: club.name,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 1,
            color: "#82ff69",
        }
    );
}

const clubMembershipGenerator = new ClubMembershipGenerator(
    graph,
    population,
    clubs
    );

clubMembershipGenerator.generate();

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