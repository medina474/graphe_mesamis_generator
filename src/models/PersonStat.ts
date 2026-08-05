class FirstnameCount {
    constructor(
        public readonly firstname: string,
        public readonly count: number
    ) {}
}

export class FirstnameStat {

    constructor(
        public readonly maxAge: number,
        public readonly genre: string,
        public readonly firstnames: FirstnameCount[]
    ) {}
}

export class LastnameStat {

    constructor(
        public readonly name: string,
        public readonly count: number
    ) {}
}
