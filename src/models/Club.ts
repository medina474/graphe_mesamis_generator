export class Club {

    public size: number;

    constructor(
        public readonly id: string, 
        public readonly name: string, 
        public readonly capacity: number,
        public readonly tags: string[],
        public readonly exclusive?: string[],
        public readonly gender?: {
            male?: number;
            female?: number;
        },
        public readonly criteria?: {
            sport?: number;
            wealth?: number;
            education?: number;
            music?: number;
        },
     ) {
        this.size = 1;
    }

    static fromJson(json: any): Club {
        return new Club(
            json.id,
            json.name,
            json.capacity,
            json.tags,
            json.exclusive,
            json.gender,
            json.criteria
        );
    }
}
