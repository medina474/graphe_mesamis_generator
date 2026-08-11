import { DirectedGraph } from "graphology";
import {
  Serie,
  Book,
  Copy,
  Library,
  Author,
  Loan,
  GenreInfo,
  Award,
  AwardEdition
} from "../models/Book.js";

import { LibrariesGenerator } from "../generators/LibrariesGenerator.js";
import { BooksLoader } from "../loaders/BooksLoader.js";
import { SeriesLoader } from "../loaders/SeriesLoader.js";
import { AwardsLoader } from "../loaders/AwardsLoader.js";
import { AwardsEditionsLoader } from "../loaders/AwardsEditionsLoader.js";
import { JsonLoader } from "../loaders/JsonLoader.js";
import { Person } from "../models/Person.js";
import { LoanGenerator } from "../generators/LoanGenerator.js";

export class LibrariesRunner {
  private series: Serie[] = [];
  private books: Book[] = [];
  private libraries: Library[] = [];
  private authors: Author[] = [];
  private prets: Loan[] = [];
  private awards: Award[] = [];
  private awardsEditions: AwardEdition[] = [];

  private exemplaires: Copy[] = [];
  private genres: Record<string, GenreInfo> = {};

  constructor(
    private readonly graph: DirectedGraph,
    private readonly population: Person[],
  ) {}

  public load(
    seriesPath: string,
    booksPath: string,
    librariesPath: string,
    awardsPath: string,
    awardsEditionsPath: string,
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

    // importer la définition des bibliothèques
    this.awards = AwardsLoader.load(awardsPath);
    this.addNodesAwards();

    // importer la définition des bibliothèques
    this.awardsEditions = AwardsEditionsLoader.load(awardsEditionsPath, this.books, this.awards);
    this.addNodesAwardsEdition();

    // Extraire les tags depuis la liste des livres
    let index = 1;
    for (const b of this.books) {
      for (const genre of b.genres) {
        const info = this.genres[genre];

        if (info) {
          info.count++;
        } else {
          this.genres[genre] = {
            id: `T${index++}`,
            count: 1,
            countInLibrary: 0
          };
        }
      }
    }

    this.addNodesGenres(this.genres);

    for (const book of this.books) {
      for (const tag of book.genres) {
        this.addEdgeClassify(book, this.genres[tag]!.id);
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
      this.addEdgeWrite(author!, book);
      if (book.serie) {
        this.addEdgePartsOf(book);
      }
    }
  }

  public run(nb: number): void {
    const librariesGenerator = new LibrariesGenerator(
      this.books,
      this.libraries,
    );

    //Affecter les livres (oeuvres) aux bibliothèques
    librariesGenerator.generateAll();

    console.log(`Oeuvres sans exemplaire.`);
    console.log(`----------------------------------------`);
    for (const book of this.books) {
      let nb = this.libraries.reduce(
        (a: number, l) => a + (l.books.some((b) => b.id == book.id) ? 1 : 0),
        0,
      );
      if (nb == 0) console.log(`${book.title} : ${nb} (${book.genres})`);
    }

    console.log(`Genres sans copie.`);
    console.log(`----------------------------------------`);
    for (const [genre, info] of Object.entries(this.genres)) {
      let nb = this.libraries.reduce(
        (a: number, l) => a + (l.books.some((b) => b.genres.includes(genre)) ? 1 : 0),
        0,
      );
      info.countInLibrary = nb
      if (nb == 0) console.log(`${genre} : ${nb} (${genre})`);
    }

    // Affecter une personne à une bibliothèque
    const candidats = [
      ...this.population.sort((a, b) => b.reading - a.reading),
    ];

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

      this.addEdgeManage(candidat, library);

      for (const book of library.books) {
        candidat.books.push(book);
        for (const tag of book.genres) {
          candidat.interestTags[tag] = (candidat.interestTags[tag] ?? 0) + 1;
        }
      }

      for (const book of library.books) {
        const exemplaire = new Copy(`X${index++}`, book, candidat, candidat, new Date());
        this.addNodeCopy(exemplaire);
        this.exemplaires.push(exemplaire);
        this.addEdgeContain(library, exemplaire);
        this.addEdgeCopyOf(exemplaire, book);
      }
    }

    const loanGenerator = new LoanGenerator(
      this.population,
      this.exemplaires,
      this.genres,
    );
    this.prets = loanGenerator.generer(nb, new Date(2026, 0, 1));
    for (const pret of this.prets) {
      this.addLoan(pret);
    }

    /* Mettre à jour la propriété reading des personnes */
    let total = 0;
    for (const person of this.population) {
      person.emprunts = this.prets.filter((p) => p.emprunteur.id == person.id);
      total = Math.max(total, person.books.length + person.emprunts.length);
    }

    for (const person of this.population) {
      person.reading = (person.books.length + person.emprunts.length) / total;
    }
  }

  /* Noeuds */

  addNodesSeries() {
    for (const serie of this.series) {
      this.addNodeSerie(serie);
    }
  }

  addNodeSerie(serie: Serie): void {
    this.graph.addNode(serie.id, {
      category: "Serie",
      label: serie.label,
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
      category: "Book",
      label: book.title,
      color: "#ff3535",
    });
  }

  addNodeCopy(exemplaire: Copy): void {
    this.graph.addNode(exemplaire.id, {
      category: "Copy",
      label: `${exemplaire.book.title} ${exemplaire.id}`,
      color: "#77fffd",
    });
  }

  addNodesGenres(genres: Record<string, GenreInfo>) {
    for (const [cle, valeur] of Object.entries(genres)) {
      this.addNodeGenre(cle, valeur);
    }
  }

  addNodeGenre(genre: string, info: GenreInfo): void {
    this.graph.addNode(info.id, {
      category: "Genre",
      label: genre,
      color: "#940b0b",
    });
  }

  addNodeAuthor(author: string, authorId: string): void {
    this.graph.addNode(authorId, {
      category: "Author",
      label: author,
      name: author,
      color: "#35a8ff",
    });
  }

  addNodesLibraries() {
    for (const library of this.libraries) {
      this.addNodeLibrary(library);
    }
  }

  addNodeAward(award: Award): void {
    this.graph.addNode(award.id, {
      category: "Award",
      label: award.award,
      color: "#093455",
    });
  }

  addNodesAwards() {
    for (const award of this.awards) {
      this.addNodeAward(award);
    }
  }

  addNodeAwardEdition(awardEdition: AwardEdition): void {
    this.graph.addNode(awardEdition.id, {
      category: "AwardEdition",
      label: ` ${awardEdition.award.award} ${awardEdition.year}`,
      color: "#35a8ff",
    });

    this.addEdgeBelong(awardEdition, awardEdition.award);
    this.addEdgeAwardEdition(awardEdition, awardEdition.book);
  }

  addNodesAwardsEdition() {
    for (const awardEdition of this.awardsEditions) {
      this.addNodeAwardEdition(awardEdition);
    }
  }

  addNodeLibrary(library: Library): void {
    this.graph.addNode(library.id, {
      category: "Library",
      label: library.id,
      color: "#fff235",
    });
  }

  /**
   * (:Person)-[:REPRESENT]->(:Book)
   * @param exemplaire
   * @param book
   */
  addLoan(pret: Loan): void {

    this.graph.addNode(pret.id, {
      category: "Loan",
      label: "Prêt",
      color: "#503177",
    });

    this.addEdgeBorrow(pret.emprunteur, pret)
    this.addEdgeLend(pret.preteur, pret)
    this.addEdgeConcern(pret, pret.copy)
    
    if (pret.previous) {
      this.addEdgeFollow(pret, pret.previous)
    }

    if (pret.returnedDate) {
      this.addEdgeReturnTo(pret)
    }
  }

  /*
   * Relations
   */

  /* (Author) -- WRITE --> (Book) */
  addEdgeWrite(author: Author, book: Book): void {
    this.graph.addEdge(author.id, book.id, {
      relation: "WRITE",
      weight: 1,
    });
  }

  /**
   * (:Book)-[:CLASSIFY-AS]->(:Genre)
   * @param book
   * @param genreId
   */
  addEdgeClassify(book: Book, genreId: string): void {
    this.graph.addEdge(book.id, genreId, {
      relation: "CLASSIFY-AS",
      weight: 1,
    });
  }

  /**
   * (:Book)-[:PARTS-OF]->(:Serie)
   * @param book
   */
  addEdgePartsOf(book: Book): void {
    this.graph.addEdge(book.id, book.serie!.id, {
      relation: "PARTS-OF",
      weight: 1,
    });
  }

  /**
   * (:Copy)-[:COPY-OF]->(:Book)
   * @param exemplaire
   * @param book
   */
  addEdgeCopyOf(exemplaire: Copy, book: Book): void {
    this.graph.addEdge(exemplaire.id, book.id, {
      relation: "COPY-OF",
      weight: 1,
    });
  }

  /**
   * (:Library)-[:CONTAIN]->(:Copy)
   * @param library
   * @param exemplaire
   */
  addEdgeContain(library: Library, exemplaire: Copy): void {
    this.graph.addEdge(library.id, exemplaire.id, {
      relation: "CONTAIN",
      weight: 1,
    });
  }

  /**
   * (:Person)-[:MANAGE]->(:Library)
   * @param person
   * @param library
   */
  addEdgeManage(person: Person, library: Library): void {
    this.graph.addEdge(person.id, library.id, {
      relation: "MANAGE",
      weight: 1,
    });
  }

  addEdgeConcern(pret: Loan, exemplaire: Copy) {
    this.graph.addEdge(pret.id, exemplaire.id, {
      relation: "CONCERN",
      weight: 1,
    });
  }

  addEdgeLend(person: Person, pret: Loan) {
    this.graph.addEdge(person.id, pret.id, {
      relation: "LEND",
      dateDebut: pret.start,
      dateFin: pret.end,
      weight: 1,
    });
  }

  addEdgeBorrow(person: Person, pret: Loan) {
    this.graph.addEdge(person.id, pret.id, {
      relation: "BORROW",
      dateDebut: pret.start,
      dateFin: pret.end,
      weight: 1,
    });
  }

  addEdgeFollow(pret1: Loan, pret2: Loan) {
    this.graph.addEdge(pret1.id, pret2.id, {
      relation: "FOLLOW",
      weight: 1,
    });
  }

  addEdgeReturnTo(pret: Loan) {
    this.graph.addEdge(pret.id, pret.copy.owner.id, {
      relation: "RETURN-TO",
      weight: 1,
    });
  }

  addEdgeBelong(awardEdition: AwardEdition, award: Award): void {
    this.graph.addEdge(awardEdition.id, award.id, {
      relation: "BELONG",
      weight: 1,
    });
  }

  addEdgeAwardEdition(awardEdition: AwardEdition, book: Book): void {
    this.graph.addEdge(awardEdition.id, book.id, {
      relation: (awardEdition.place == 1) ? "REWARD" : "NOMINATE",
      categorie: awardEdition.categorie,
      weight: 1,
    });
  }
}
