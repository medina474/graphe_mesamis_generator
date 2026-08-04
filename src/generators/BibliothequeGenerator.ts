import { listenerCount } from 'process';
import { LiteraryWork, Library } from '../models/Book.js';

export class BibliothequeGenerator {

  constructor(
    private readonly books: LiteraryWork[],
    private readonly libraries: Library[],
  ) {}

  generer(library: Library): LiteraryWork[] {

    // Au moins un des tags fait partie de la luste des tags de la bibliothèque
    const disponibles = this.books.filter(oeuvre =>
      oeuvre.tags.some(tag => library.tags.includes(tag))
    );

    console.log(`${library.id} ${library.tags} ${library.size}/${disponibles.length} `);

    const liste = this.tirerPondere(
      disponibles,
      library.tags,
      library.size,
    );

    console.log(liste);
    return liste;
  }

  private score(oeuvre: LiteraryWork, tags: string[]): number {
    return oeuvre.tags.filter(tag => tags.includes(tag)).length;
  }

  private tirerPondere(
    oeuvres: LiteraryWork[],
    tags: string[],
    nombre: number,
  ): LiteraryWork[] {

    const disponibles = [...oeuvres];
    const resultat: LiteraryWork[] = [];

    while (disponibles.length > 0 && resultat.length < nombre) {

      const poids = disponibles.map(oeuvre =>
        this.score(oeuvre, tags)
      );

      const total = poids.reduce(
        (somme, poids) => somme + poids,
        0,
      );

      let tirage = Math.random() * total;

      let index = 0;

      for (; index < disponibles.length; index++) {
        tirage -= poids[index];

        if (tirage < 0) {
          break;
        }
      }

      resultat.push(disponibles[index]);
      disponibles.splice(index, 1);
    }

    return resultat;
  }

  generateAll(): LiteraryWork[] {
    for (const bibliotheque of this.libraries) {
      this.generer(bibliotheque)
    }
    return[];
  }
}
