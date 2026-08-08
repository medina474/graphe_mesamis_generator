import { DirectedGraph } from "graphology";
import {
  Serie,
  Book,
  Exemplaire,
  Library,
  Author,
  Pret,
} from "../models/Book.js";
import { LibrariesGenerator } from "../generators/LibrariesGenerator.js";
import { BooksLoader } from "../loaders/BooksLoader.js";
import { SeriesLoader } from "../loaders/SeriesLoader.js";
import { JsonLoader } from "../loaders/JsonLoader.js";
import { Person } from "../models/Person.js";
import { BorrowGenerator } from "../generators/BorrowGenerator.js";

interface TagInfo {
  id: string;
  count: number;
}

export class LibrariesRunner {
  private series: Serie[] = [];
  private books: Book[] = [];
  private libraries: Library[] = [];
  private authors: Author[] = [];
  private prets: Pret[] = [];

  private exemplaires: Exemplaire[] = [];

  constructor(private readonly graph: DirectedGraph) {}

  public load(
    seriesPath: string,
    booksPath: string,
    librariesPath: string,
  ): void {
    // Importer les séries
    this.series = SeriesLoader.load(seriesPath);
    this.addNodesSeries();

    // Importer les livres (oeuvres)
    this.books = BooksLoader.load(booksPath, this.series);
    this.addNodesBooks();

    // importer la définition des bibliothèques
    this.libraries = JsonLoader.load(librariesPath, Library);
    this.addNodesLibraries();

    // Extraire les tags depuis la liste des livres
    const uniqueTags = new Map<string, TagInfo>();
    let index = 1;
    for (const b of this.books) {
      for (const tag of b.genres) {
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

    this.addNodesTags(uniqueTags);

    for (const book of this.books) {
      for (const tag of book.genres) {
        this.tagBook(book.id, uniqueTags.get(tag)!.id);
      }
    }

    // Extraire les auteurs depuis la liste des livres
    const uniqueAuthors = new Map<string, string>();
    let authorIndex = 1;
    for (const book of this.books) {
      if (!uniqueAuthors.has(book.author)) {
        uniqueAuthors.set(book.author, `A${authorIndex++}`);
      }
    }

    for (const [author, authorId] of uniqueAuthors) {
      this.addNodeAuthor(author, authorId);
      this.authors.push(new Author(authorId, author));
    }

    for (const book of this.books) {
      const author = this.authors.find(
        (a) => a.id == uniqueAuthors.get(book.author)!,
      );
      author?.books.push(book);
      this.addEdgeWrite(book, author!);
      if (book.serie) {
        this.addEdgePartsOf(book);
      }
    }
  }

  public run(nb: number, population: Person[]): void {
    const librariesGenerator = new LibrariesGenerator(
      this.books,
      this.libraries,
    );

    //Affecter les livres (oeuvres) aux bibliothèques
    librariesGenerator.generateAll();

    /*
    for (const l of this.libraries) {
      console.log(`${l.id}`)
      for (const b of l.books)
      {
        console.log(`${b.title} ${b.serie?.label ?? ''} ${b.ordre}`)
      }
    }
    */

    console.log(`Oeuvres sans exemplaire.`);
    console.log(`----------------------------------------`);
    for (const book of this.books) {
      let nb = this.libraries.reduce(
        (a: number, l) => a + (l.books.some((b) => b.id == book.id) ? 1 : 0),
        0,
      );
      if (nb == 0) console.log(`${book.title} : ${nb} (${book.genres})`);
    }

    // Affecter une personne à une bibliothèque
    const candidats = [...population.sort((a, b) => b.reading - a.reading)];

    let index = 1;
    for (const library of this.libraries.sort((a, b) => b.size - a.size)) {
      const candidat = candidats.splice(0, 1)[0];

      if (!candidat) {
        console.log(
          `Plus de candidat disponible: destruction de la bibliothèque ${library.id}`,
        );
        library.books.splice(0);
        continue;
      }

      this.addManage(candidat, library);

      for (const book of library.books) {
        candidat.books.push(book)
        for (const tag of book.genres) {
          candidat.interestTags[tag] =
            (candidat.interestTags[tag] ?? 0) + 1;
        }
      }

      for (const book of library.books) {
        //this.addOwnership(book, candidat); // Redondant
        const exemplaire = new Exemplaire(`X${index++}`, book, candidat);
        this.addNodeExemplaire(exemplaire);
        this.exemplaires.push(exemplaire);
        this.addBelongsTo(exemplaire, library);
        this.addPublication(exemplaire, book);
      }
    }

    const borrowGenerator = new BorrowGenerator(population, this.exemplaires);
    this.prets = borrowGenerator.generer(nb, new Date(2026, 0, 1));
    for (const pret of this.prets) {
      this.addHold(pret);
    }

    /* Mettre à jour la propriété reading des personnes */
    let total = 0;
    for (const person of population) {
      person.emprunts = this.prets.filter(p => p.emprunteur.id == person.id)
      total = Math.max(total, person.books.length + person.emprunts.length)
    }

    for (const person of population) {
      person.reading = total / person.books.length;
    }
  }

  public update() {
    this.updateNodesLibraries();
    this.updateNodesSeries();
    this.updateNodesAuthors();
    this.updateNodesExemplaires();
  }

  /**
   * La taille est proportionnelle au nombre de livres écrits par l'auteur
   */
  private updateNodesAuthors() {
    for (const author of this.authors) {
      this.graph.mergeNodeAttributes(author.id, {
        size: Math.ceil(author.books.length / 3.0),
      });
    }
  }

  /**
   * La taille est proportionnelle au nombre de livres contenues dans la bibliothèque
   */
  private updateNodesLibraries() {
    for (const library of this.libraries) {
      this.graph.mergeNodeAttributes(library.id, {
        size: Math.ceil(library.books.length / 3.0),
      });
    }
  }

  /**
   * La taille est proportionnelle au nombre de livres contenues dans la série
   */
  private updateNodesSeries() {
    for (const serie of this.series) {
      this.graph.mergeNodeAttributes(serie.id, {
        size: Math.ceil(serie.books.length / 3.0),
      });
    }
  }

  /**
   * La taille est proportionnelle au nombre de prêts de l'exemplaire
   */
  private updateNodesExemplaires() {
    for (const exemplaire of this.exemplaires) {
      const nb = this.prets.filter(
        (p) => p.exemplaire.id == exemplaire.id,
      ).length;
      this.graph.mergeNodeAttributes(exemplaire.id, {
        nbPrets: nb,
        size: Math.ceil(nb / 3.0),
      });
    }
  }

  addNodesSeries() {
    for (const serie of this.series) {
      this.addNodeSerie(serie);
    }
  }

  addNodeSerie(serie: Serie): void {
    this.graph.addNode(serie.id, {
      category: "serie",
      label: serie.label,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1,
      color: "#765959",
    });
  }

  addNodesBooks() {
    for (const book of this.books) {
      this.addNodeBook(book);
    }
  }

  addNodeBook(book: Book): void {
    this.graph.addNode(book.id, {
      category: "book",
      label: book.title,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1,
      color: "#ff3535",
    });
  }

  addNodeExemplaire(exemplaire: Exemplaire): void {
    this.graph.addNode(exemplaire.id, {
      category: "exemplaire",
      label: `${exemplaire.oeuvre.title} ${exemplaire.id}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1,
      color: "#77fffd",
    });
  }

  addNodesTags(tags: Map<string, TagInfo>) {
    for (let tag of tags) {
      this.addNodeTag(tag);
    }
  }

  addNodeTag(tag: [string, TagInfo]): void {
    this.graph.addNode(tag[1].id, {
      category: "tag",
      label: tag[0],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.ceil(tag[1].count / 3.0),
      color: "#940b0b",
    });
  }

  addNodeAuthor(author: string, authorId: string): void {
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

  /* (Author) -- WRITE --> (Book) */
  addEdgeWrite(book: Book, author: Author): void {
    this.graph.addEdge(author.id, book.id, {
      relation: "WRITE",
      category: "book",
      weight: 2,
    });
  }

  /* (Book) -- PARTS-OF --> (Serie) */
  addEdgePartsOf(book: Book): void {
    this.graph.addEdge(book.id, book.serie!.id, {
      relation: "parts-of",
      category: "book",
      weight: 3,
    });
  }

  addNodesLibraries() {
    for (const library of this.libraries) {
      this.addNodeLibrary(library);
    }
  }

  addNodeLibrary(library: Library): void {
    this.graph.addNode(library.id, {
      category: "library",
      label: library.id,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1,
      color: "#fff235",
    });
  }

  /* (Person) -- OWN --> (Book) 
  Plutôt un exemplaire
  */
  addOwnership(book: Book, person: Person): void {
    this.graph.addEdge(book.id, person.id, {
      relation: "OWN",
      category: "book",
      weight: 3,
    });
  }

  addHold(pret: Pret): void {
    this.graph.addEdge(pret.exemplaire.id, pret.emprunteur.id, {
      relation: "emprunte",
      dateDebut: pret.debut,
      dateFin: pret.fin,
      category: "book",
      weight: 3,
    });

    this.graph.addEdge(pret.exemplaire.id, pret.preteur.id, {
      relation: "prete",
      dateDebut: pret.debut,
      dateFin: pret.fin,
      category: "book",
      weight: 3,
    });
  }

  addPublication(exemplaire: Exemplaire, book: Book): void {
    this.graph.addEdge(exemplaire.id, book.id, {
      relation: "publication",
      category: "book",
      weight: 3,
    });
  }

  /* (Exemplaire) -- -−> (Library) */
  addBelongsTo(exemplaire: Exemplaire, library: Library): void {
    this.graph.addEdge(exemplaire.id, library.id, {
      relation: "belongs-to",
      category: "book",
      weight: 3,
    });
  }

  /* (Person) -- -−> (Library) */
  addManage(person: Person, library: Library): void {
    this.graph.addEdge(person.id, library.id, {
      relation: "MANAGE",
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
