class Firstname {
    constructor(
        public readonly firstname: string,
        public readonly count: number
    ) {}
}

export class FirstnameGeneration {

    constructor(
        public readonly maxAge: number,
        public readonly genre: string,
        public readonly firstnames: Firstname[]
    ) {}
}

export class Lastname {

    constructor(
        public readonly name: string,
        public readonly count: number
    ) {}
}
