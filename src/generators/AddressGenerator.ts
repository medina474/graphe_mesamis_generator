import { DirectedGraph } from "graphology";
import { Person } from "../models/Person.js";
import { Address } from "../models/Address.js";
import { Random } from "../stats/Random.js";

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

        if (this.addressesDisponibles.length == 0) {
            console.log('Aucune adresse disponible pour cette personne')
            return;
        }

        const index = Random.int(0, this.addressesDisponibles.length)
        const address = this.addressesDisponibles.splice(index, 1)[0];
        person.address = address;
    
        if (person.spouse) {
            person.spouse.address = address
        }

        if (person.children) {
            for (const child of person.children.filter(c => c.age < 21)) {
                child.address = address
            }
        }
    }

    public generateAll(persons: Person[]) {
        for (const person of persons.sort((a, b) => b.age - a.age)) {
            if (!person.address) {
                this.generate(person)
            }
        }
    }
}
