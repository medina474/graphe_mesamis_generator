import fs from 'fs';
import { Club } from "./models/Club.js";
import { Enterprise } from "./models/Enterprise.js";
import { LiteraryWork, Bibliotheque } from "./models/Book.js";
import { PersonGenerator } from "./generators/PersonGenerator.js";
import { ClubMembershipGenerator } from "./generators/ClubMembershipGenerator.js";
import { BibliothequeGenerator } from "./generators/BibliothequeGenerator.js";
import { AgePyramidLoader } from "./loaders/AgePyramidLoader.js";
import { FirstnameLoader } from "./loaders/FirstnameLoader.js";
import { LastnameLoader } from "./loaders/LastnameLoader.js";
import { LiteraryWorkLoader } from "./loaders/LiteraryWork.js";
import { CsvPersonExporter } from "./exporters/CsvPersonExporter.js";
import { JsonLoader } from "./loaders/JsonLoader.js";
import { DirectedGraph } from "graphology";
import { FamilyGenerator } from "./generators/FamilyGenerator.js";
import { WorkGenerator } from "./generators/WorkGenerator.js";
import { GraphManager } from "./graph/GraphManager.js";
import { FriendsGenerator } from "./generators/FriendsGenerator.js";

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

function runFriendship() {
    const friendsGenerator = new FriendsGenerator(graph, population);
    friendsGenerator.generate();
    graphManager.updatePersons(population);
}

async function runBookExchange() {
    const literaryWorks = await LiteraryWorkLoader.load("data/livres.csv")
    console.log(literaryWorks.slice(0, 1));

    const uniqueTags = new Map<string, number>();

    for (const w of literaryWorks) {
        for (const tag of w.tags) {
            uniqueTags.set(tag, (uniqueTags.get(tag) ?? 0) + 1);
        }
    }

    for(let tag of uniqueTags) {
        console.log(tag)
    }

    const bibliotheque = JsonLoader.load("data/bibliotheques.json", Bibliotheque)
    const bibliothequeGenerator = new BibliothequeGenerator(literaryWorks, bibliotheque);
    bibliothequeGenerator.generateAll();
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

/* Entreprises 
const enterprises = JsonLoader.load("data/entreprises.json", Enterprise);

graphManager.addEnterprises(enterprises);

const workGenerator = new WorkGenerator(graph, population, enterprises);

workGenerator.generate();
graphManager.updateEnterprises(enterprises);
*/

runBookExchange();


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
