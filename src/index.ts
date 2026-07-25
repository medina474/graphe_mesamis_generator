import { PersonGenerator } from "./generators/PersonGenerator.js";
import { AgePyramidLoader } from "./stats/loaders/AgePyramidLoader.js";
import { CsvPersonExporter } from "./exporters/CsvPersonExporter.js";

const pyramid = AgePyramidLoader.load("data/age-pyramid-guadeloupe.json");

const generator = new PersonGenerator(pyramid, );

const population = generator.generateMany(100);

console.log(population.slice(0, 10));

const exporter = new CsvPersonExporter();

await exporter.export(
    population,
    "output/persons.csv"
);

