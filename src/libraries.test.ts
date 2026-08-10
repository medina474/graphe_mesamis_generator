import { describe, expect, it } from "vitest";
import { LibrariesGenerator } from "./generators/LibrariesGenerator.js";
import { Book, Library, Serie } from "./models/Book.js";

describe("LibrariesGenerator", () => {
  it("n'ajoute pas un tome d'une série ordonnée avant les précédents", () => {
    const serie = new Serie("S1", "Saga", true);
    const tome1 = new Book("B1", "Auteur", "Tome 1", ["fantasy"], serie, 1);
    const tome2 = new Book("B2", "Auteur", "Tome 2", ["fantasy"], serie, 2);
    const books = [tome1, tome2];

    const library = new Library("L1", 1, ["fantasy"]);
    const generator = new LibrariesGenerator(books, [library]);

    const resultat = generator.generate(library);

    expect(resultat).toHaveLength(1);
    expect(resultat[0].order).toBe(1);
    expect(resultat[0].id).toBe("B1");
  });

  it("sélectionne uniquement le tome n+1 dans une série ordonnée", () => {
    const serie = new Serie("S1", "Saga", true);
    const tome1 = new Book("B1", "Auteur", "Tome 1", ["fantasy"], serie, 1);
    const tome2 = new Book("B2", "Auteur", "Tome 2", ["fantasy"], serie, 2);
    const tome3 = new Book("B3", "Auteur", "Tome 3", ["fantasy"], serie, 3);
    const books = [tome1, tome2, tome3];

    const library = new Library("L1", 2, ["fantasy"]);
    const generator = new LibrariesGenerator(books, [library]);

    const resultat = generator.generate(library);

    expect(resultat).toHaveLength(2);
    expect(resultat.map((book) => book.id)).toEqual(["B1", "B2"]);
  });
});
