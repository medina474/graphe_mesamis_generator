export class Book {
    constructor(
        public readonly id:string,
        public readonly author:string,
        public readonly title:string,
        public readonly tags:string[],
    ) {
    }
}

export class Bibliotheque {
    constructor(
        public readonly id:string,
        public readonly size:string,
        public readonly tags:string[],
    ) {
    }

    static fromJson(json: any): Bibliotheque {
    return new Bibliotheque(
      json.id,
      json.taille,
      json.tags
    );
  }
}