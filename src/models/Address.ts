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
