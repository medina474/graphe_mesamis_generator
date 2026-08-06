export class Address {

    public isOccuped: boolean = false;
    
    constructor(
        public readonly id:string,
        public readonly numero:string,
        public readonly label:string,
        public readonly voie: Voie,
        public readonly lat: number,
        public readonly lon: number,
    ) {
    }
}

export class Voie {

    constructor(
        public readonly id:string,
        public readonly voie:string,
        public readonly numeros:string[],
    ) {
    }

    static fromJson(json: any): Voie {
        return new Voie(
            json.id,
            json.voie,
            json.numeros
        );
    }
}
