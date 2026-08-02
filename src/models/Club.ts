export class Club {
    id: string;
    name: string;
    capacity: number;
    tags: string[];
    exclusive?: string[];  
    size: number;

    // Contraintes / biais
    gender?: {
        male?: number;
        female?: number;
    };

    criteria?: {
        sport?: number;
        wealth?: number;
        education?: number;
        music?: number;
    };

    constructor(id: string, name: string, capacity: number) {
        this.id = id
        this.name = name
        this.capacity = capacity
        this.tags = []
        this.size = 1;
    }
}
