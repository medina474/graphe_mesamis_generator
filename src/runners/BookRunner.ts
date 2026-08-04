import { LiteraryWork, Library } from "../models/Book.js";
import { BibliothequeGenerator } from "../generators/BibliothequeGenerator.js";
import { LiteraryWorkLoader } from "../loaders/LiteraryWork.js"
import { JsonLoader } from "../loaders/JsonLoader.js";

export class BookRunner {

    static async run() {
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

        const bibliotheque = JsonLoader.load("data/bibliotheques.json", Library)
        const bibliothequeGenerator = new BibliothequeGenerator(literaryWorks, bibliotheque);
        bibliothequeGenerator.generateAll();
    }
}