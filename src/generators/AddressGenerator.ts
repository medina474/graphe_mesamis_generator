import { DirectedGraph } from "graphology";
import { Person } from "../models/Person.js";
import { Address } from "../models/Address.js";

export class AddressGenerator {
    
    private addressesDisponibles: Address[]

    constructor(
        private graph: DirectedGraph,
        private addresses: Address[]
    ) {
        this.addressesDisponibles = [...this.addresses];
    }

    public generate(person: Person) {
        // Si marié faire habiter aussi le conjoint et les enfants de -21ans
        // Dans x% des cas les personnes sont séparées
        // Si c'est le cas traiter le cas des enfants

        const address = this.addressesDisponibles.splice(0, 1)[0];
        person.address = address;
    
        if (person.spouse) {
            person.spouse.address = address
        }
    }

    public generateAll(persons: Person[]) {
        for (const person of persons.sort((a, b) => b.age - a.age)) {
            this.generate(person)
        }
    }
}
