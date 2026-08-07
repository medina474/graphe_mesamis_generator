import { SerializedError } from 'vitest';
import { Person } from './Person.js';

export class Serie {
    constructor(
        public readonly id:string,
        public readonly label:string,
        public readonly ordre:boolean,
    ) {
    }
}

export class Book {
    constructor(
        public readonly id:string,
        public readonly author:string,
        public readonly title:string,
        public readonly tags:string[],
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

export class Library {

    public books: Book[]

    constructor(
        public readonly id:string,
        public readonly size:number,
        public readonly tags:string[],
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