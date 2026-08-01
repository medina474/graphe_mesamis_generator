export class FirstnamePool {

    constructor(
        public readonly maxAge: number,
        public readonly genre: string,
        public readonly firstnames: Firstname[]
    ) {}
}

class Firstname {
    constructor(
        public readonly firstname: string,
        public readonly count: number
    ) {}
}
