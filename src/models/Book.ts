import { Person } from './Person.js';

export class Serie {
    public readonly books: Book[] = [];

    constructor(
        public readonly id:string,
        public readonly label:string,
        public readonly ordre:boolean, /* L'ordre des tomes est important */
    ) {
    }
}

export class Author {
    public readonly books: Book[] = [];

    constructor(
        public readonly id:string,
        public readonly label:string
    ) {
    }
}

export class Book {
    constructor(
        public readonly id:string,
        public readonly author:string,
        public readonly title:string,
        public readonly genres:string[],
        public readonly serie?: Serie,
        public readonly ordre?: number,
    ) {
    }
}

export class Exemplaire {
    constructor(
        public readonly id: string,
        public readonly oeuvre: Book,
        public readonly proprietaire: Person,
    ) {
    }
}

export class Pret {
    constructor(
        public readonly exemplaire: Exemplaire,
        public readonly preteur: Person,
        public readonly emprunteur: Person,
        public readonly debut: Date,
        public readonly fin: Date,
    ) { }
}

export class Library {

    public books: Book[]

    constructor(
        public readonly id:string,
        public readonly size:number,
        public readonly genres:string[],
    ) {
        this.books = []
    }

    static fromJson(json: any): Library {
    return new Library(
      json.id,
      json.taille,
      json.tags
    );
  }
}