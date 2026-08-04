import { Library } from "../models/Book.js";
import { LibrariesGenerator } from "../generators/LibrariesGenerator.js";
import { BooksLoader } from "../loaders/BooksLoader.js"
import { JsonLoader } from "../loaders/JsonLoader.js";

export class LibrariesRunner {

    static async run() {
        const books = await BooksLoader.load("data/books.csv")
        //console.log(books.slice(0, 1));

        /*
        const uniqueTags = new Map<string, number>();

        for (const w of books) {
            for (const tag of w.tags) {
                uniqueTags.set(tag, (uniqueTags.get(tag) ?? 0) + 1);
            }
        }

        for(let tag of uniqueTags) {
            console.log(tag)
        }
        */

        const libraries = JsonLoader.load("data/libraries.json", Library)
        const librariesGenerator = new LibrariesGenerator(books, libraries);
        librariesGenerator.generateAll();
        
    }
}