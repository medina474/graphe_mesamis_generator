export class ClubPool {

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly tags: string[],
        public capacite: number,
        public size: number,
    ) { }
}

