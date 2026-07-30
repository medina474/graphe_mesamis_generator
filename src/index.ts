import { PersonGenerator } from "./generators/PersonGenerator.js";
import { AgePyramidLoader } from "./stats/loaders/AgePyramidLoader.js";
import { FirstnameLoader } from "./stats/loaders/FirstnameLoader.js";
import { CsvPersonExporter } from "./exporters/CsvPersonExporter.js";

const pyramid = AgePyramidLoader.load("data/age-pyramid-guadeloupe.json");
const firstnames = FirstnameLoader.load("data/prenoms.json");

const generator = new PersonGenerator(pyramid, firstnames, 18, 79);

const population = generator.generateMany(5000);

console.log(population.slice(0, 10));

const exporter = new CsvPersonExporter();

await exporter.export(
    population,
    "output/persons.csv"
);

