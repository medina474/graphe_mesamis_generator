import { DirectedGraph } from "graphology";
import { Book, Library } from "../models/Book.js";
import { LibrariesGenerator } from "../generators/LibrariesGenerator.js";
import { BooksLoader } from "../loaders/BooksLoader.js"
import { JsonLoader } from "../loaders/JsonLoader.js";

export class LibrariesRunner {

    constructor(
        private readonly graph: DirectedGraph
    ) {}

    async run() {
        console.log(`----------------------------------------`);
        const books = await BooksLoader.load("data/books.csv")
        
        for (const book of books) {
            this.addBook(book)
        }

        const uniqueTags = new Map<string, number>();

        for (const b of books) {
            for (const tag of b.tags) {
                uniqueTags.set(tag, (uniqueTags.get(tag) ?? 0) + 1);
            }
        }

        for(let tag of uniqueTags) {
            this.addTag(tag)
        }

        const libraries = JsonLoader.load("data/libraries.json", Library);

        for (const library of libraries) {
            this.addLibrary(library)
        }

        const librariesGenerator = new LibrariesGenerator(this.graph, books, libraries);
        librariesGenerator.generateAll();

        for (const library of libraries) {
            for (const book of books) {
                this.addOwnership(book, library)
                for (const tag of book.tags) {
                    
                }
            }
        }
    }

    addBook(book: Book): void {
        this.graph.addNode(
            book.id,
            {
                category: "book",
                label: book.title,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 1,
                color: "#ff3535",
            }
        );
    }

    addTag(tag: [string, number]): void {
        this.graph.addNode(
            `T${tag[0]}}`,
            {
                category: "tag",
                label: tag[1],
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 1,
                color: "#940b0b",
            }
        );
    }

    addLibrary(library: Library): void {
        this.graph.addNode(
            library.id,
            {
                category: "library",
                label: library.id,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 1,
                color: "#fff235",
            }
        );
    }

    addOwnership(book: Book, library: Library): void {
        this.graph.addEdge(book.id, library.id, {
            relation: "own",
            category: "book",
            weight: 3,
        });
        console.log(`${book.id} -> ${library.id}`)
    }
}