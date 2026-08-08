import { Book, Library } from "../models/Book.js";

export class LibrariesGenerator {
  constructor(
    private readonly books: Book[],
    private readonly libraries: Library[],
  ) {}

  generate(library: Library): Book[] {
    // Au moins un des tags fait partie de la liste des tags de la bibliothèque
    const disponibles = this.books.filter((oeuvre) =>
      oeuvre.tags.some((tag) => library.tags.includes(tag)),
    );

    return this.tirerPondere(disponibles, library.tags, library.size);
  }

  private peutAjouter(oeuvre: Book, resultat: Book[]): boolean {
    const ordre = oeuvre.ordre;

    // L'oeuvre ne fait pas partie d'une série où l'ordre est important.
    if (!oeuvre.serie || !oeuvre.serie.ordre || typeof ordre !== "number") {
      return true;
    }

    const nbTomesPrecedents = resultat.filter(
      (livre) => livre.serie?.id === oeuvre.serie!.id,
    ).length;

    return ordre === nbTomesPrecedents + 1;
  }

  private score(oeuvre: Book, tags: string[]): number {
    return oeuvre.tags.filter((tag) => tags.includes(tag)).length;
  }

  private tirerPondere(
    oeuvres: Book[],
    tags: string[],
    nombre: number,
  ): Book[] {
    const disponibles = [...oeuvres];
    const resultat: Book[] = [];

    while (disponibles.length > 0 && resultat.length < nombre) {
      const poids = disponibles.map((oeuvre) => this.score(oeuvre, tags));

      const total = poids.reduce((somme, poids) => somme + poids, 0);

      let tirage = Math.random() * total;
      let index = 0;

      for (; index < disponibles.length; index++) {
        tirage -= poids[index];

        if (tirage < 0) {
          break;
        }
      }

      const choix = disponibles[index];
      if (!this.peutAjouter(choix, resultat)) {
        disponibles.splice(index, 1);
        continue;
      }

      resultat.push(choix);
      disponibles.splice(index, 1);
    }

    return resultat;
  }

  generateAll() {
    for (const library of this.libraries) {
      library.books = this.generate(library);
    }
  }
}
