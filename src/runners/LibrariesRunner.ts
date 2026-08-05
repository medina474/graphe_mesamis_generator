import { DirectedGraph } from "graphology";
import { Book, Library } from "../models/Book.js";
import { LibrariesGenerator } from "../generators/LibrariesGenerator.js";
import { BooksLoader } from "../loaders/BooksLoader.js";
import { JsonLoader } from "../loaders/JsonLoader.js";
import { Person } from "../models/Person.js";

interface TagInfo {
  id: string;
  count: number;
}

export class LibrariesRunner {
  private books: Book[] = [];
  private libraries: Library[] = [];

  constructor(private readonly graph: DirectedGraph) {}

  public async load(booksPath: string, librariesPath: string): Promise<void> {
    this.books = await BooksLoader.load(booksPath);
    this.addBooks();

    this.libraries = JsonLoader.load(librariesPath, Library);

    const uniqueTags = new Map<string, TagInfo>();
    let index = 1;
    for (const b of this.books) {
      for (const tag of b.tags) {
        const info = uniqueTags.get(tag);

        if (info) {
          info.count++;
        } else {
          uniqueTags.set(tag, {
            id: `T${index++}`,
            count: 1,
          });
        }
      }
    }

    this.addTags(uniqueTags);

    for (const book of this.books) {
      for (const tag of book.tags) {
        this.tagBook(book.id, uniqueTags.get(tag)!.id);
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
  }

  public run(population: Person[]): void {
    console.log(`----------------------------------------`);

    const candidats = population.sort((a, b) => a.reading - b.reading)

    const librariesGenerator = new LibrariesGenerator(
      this.books,
      this.libraries,
    );
    librariesGenerator.generateAll();

    for (const library of this.libraries.sort((a, b) => a.size - b.size)) {
      const candidat = candidats.splice(0, 1)[0];
      for (const book of library.books) {
        this.addOwnership(book, candidat);
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

  addTags(tags: Map<string, TagInfo>) {
    for (let tag of tags) {
      this.addTag(tag);
    }
  }

  addTag(tag: [string, TagInfo]): void {
    this.graph.addNode(tag[1].id, {
      category: "tag",
      label: tag[0],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.ceil(tag[1].count / 3.0),
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

  addOwnership(book: Book, person: Person): void {
    this.graph.addEdge(book.id, person.id, {
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
