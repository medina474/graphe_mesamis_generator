import { LiteraryWork, Bibliotheque } from '../models/Book.js';

export class BibliothequeGenerator {

  constructor(
    private readonly oeuvres: LiteraryWork[],
    private readonly bibliotheque: Bibliotheque[],
  ) {}

  generer(bibliotheque: Bibliotheque): LiteraryWork[] {

    const disponibles = this.oeuvres.filter(oeuvre =>
      oeuvre.tags.some(tag => bibliotheque.tags.includes(tag))
    );

    console.log(`${bibliotheque.tags} ${bibliotheque.size}/${disponibles.length} `);

    return this.tirerPondere(
      disponibles,
      bibliotheque.tags,
      bibliotheque.size,
    );
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
    for (const bibliotheque of this.bibliotheque) {
      this.generer(bibliotheque)
    }
    return[];
  }
}
