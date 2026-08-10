import { Person } from './Person.js';

export class Serie {
    public readonly books: Book[] = [];

    constructor(
        public readonly id:string,
        public readonly label:string,
        public readonly isOrdered:boolean, /* L'ordre des tomes est important */
    ) {
    }
}

export class Author {
    public readonly books: Book[] = [];

    constructor(
        public readonly id:string,
        public readonly name:string
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
        public readonly order?: number,
    ) {
    }
}

export class Copy {
    constructor(
        public readonly id: string,
        public readonly book: Book,
        public readonly owner: Person,
        public holder: Person,
        public availableAt: Date,
    ) {
    }
}

export class Loan {
    constructor(
        public readonly id: string,
        public readonly copy: Copy,
        public readonly preteur: Person,
        public readonly emprunteur: Person,
        public readonly start: Date,
        public readonly end: Date,
        public readonly previous?: Loan,
        public returnedDate?: Date,
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