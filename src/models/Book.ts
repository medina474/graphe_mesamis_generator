export class Book {
    constructor(
        public readonly id:string,
        public readonly author:string,
        public readonly title:string,
        public readonly tags:string[],
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