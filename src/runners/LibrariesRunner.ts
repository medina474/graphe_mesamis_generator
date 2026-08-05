import { DirectedGraph } from "graphology";
import { Book, Library } from "../models/Book.js";
import { LibrariesGenerator } from "../generators/LibrariesGenerator.js";
import { BooksLoader } from "../loaders/BooksLoader.js";
import { JsonLoader } from "../loaders/JsonLoader.js";

export class LibrariesRunner {
  private books: Book[] = [];

  constructor(private readonly graph: DirectedGraph) {}

  public async load(booksPath: string): Promise<void> {
    this.books = await BooksLoader.load(booksPath);
    this.addBooks();
  }

  public run(): void {
    console.log(`----------------------------------------`);

    const uniqueTags = new Map<string, [string, number]>();
    let index = 1;
    for (const b of this.books) {
      for (const tag of b.tags) {
        if (uniqueTags.has(tag)) {
          uniqueTags.set(tag, [
            uniqueTags.get(tag)![0],
            (uniqueTags.get(tag)![1] ?? 0) + 1,
          ]);
        } else {
          uniqueTags.set(tag, [`T${index++}`, 1]);
        }
      }
    }

    for (let tag of uniqueTags) {
      this.addTag(tag);
    }

    for (const book of this.books) {
      for (const tag of book.tags) {
        this.tagBook(book.id, uniqueTags.get(tag)![0]);
      }
    }

    const uniqueAuthors = new Map<string, string>();
    let authorIndex = 1;
    for (const book of this.books) {
      if (!uniqueAuthors.has(book.author)) {
        uniqueAuthors.set(book.author, `A${authorIndex++}`);
      }
    }

    for (const [author, authorId] of uniqueAuthors) {
      this.addAuthor(author, authorId);
    }

    for (const book of this.books) {
      this.writeBook(book, uniqueAuthors.get(book.author)!);
    }

    const libraries = JsonLoader.load("data/libraries.json", Library);

    for (const library of libraries) {
      this.addLibrary(library);
    }

    const librariesGenerator = new LibrariesGenerator(
      this.graph,
      this.books,
      libraries,
    );
    librariesGenerator.generateAll();

    for (const library of libraries) {
      for (const book of library.books) {
        this.addOwnership(book, library);
      }
    }
  }

  addBooks() {
    for (const book of this.books) {
      this.addBook(book);
    }
  }

  addBook(book: Book): void {
    this.graph.addNode(book.id, {
      category: "book",
      label: book.title,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1,
      color: "#ff3535",
    });
  }

  addTag(tag: [string, [string, number]]): void {
    this.graph.addNode(tag[1][0], {
      category: "tag",
      label: tag[0],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.ceil(tag[1][1] / 3.0),
      color: "#940b0b",
    });
  }

  addAuthor(author: string, authorId: string): void {
    this.graph.addNode(authorId, {
      category: "author",
      label: author,
      name: author,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1,
      color: "#35a8ff",
    });
  }

  writeBook(book: Book, authorId: string): void {
    this.graph.addEdge(authorId, book.id, {
      relation: "write",
      category: "book",
      weight: 2,
    });
  }

  addLibrary(library: Library): void {
    this.graph.addNode(library.id, {
      category: "library",
      label: library.id,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1,
      color: "#fff235",
    });
  }

  addOwnership(book: Book, library: Library): void {
    this.graph.addEdge(book.id, library.id, {
      relation: "own",
      category: "book",
      weight: 3,
    });
  }

  tagBook(bookId: string, tagId: string): void {
    this.graph.addEdge(bookId, tagId, {
      relation: "tag",
      category: "book",
      weight: 1,
    });
  }
}
