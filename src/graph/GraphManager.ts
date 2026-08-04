import { DirectedGraph } from "graphology";
import { Gender, Person } from "../models/Person.js";
import { Club } from "../models/Club.js";
import { Book } from "../models/Book.js";
import { Enterprise } from "../models/Enterprise.js";

export class GraphManager {

    constructor(
        private readonly graph: DirectedGraph
    ) {}

    addPerson(person: Person): void {
        this.graph.addNode(
            person.id,
            {
                category: "person",
                firstname: person.firstname,
                lastname: person.lastname,
                age: person.age,
                x: Math.random() * 100,
                y: Math.random() * 100,
                label: `${person.firstname} ${person.lastname} ${person.age}`,
                size: 3,
                color: person.gender === Gender.Male
                    ? "#4A90E2"
                    : "#FF69B4",
            }
        );
    }

    addClub(club: Club): void {
        this.graph.addNode(
            club.id,
            {
                category: "club",
                name: club.name,
                label: club.name,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 1,
                color: "#82ff69",
            }
        );
    }

    addEnterprise(enterprise: Enterprise): void {
        this.graph.addNode(
            enterprise.id,
            {
                category: "enterprise",
                name: enterprise.name,
                label: enterprise.name,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 1,
                color: "#ffd035",
            }
        );
    }

    addBook(book: Book): void {
        this.graph.addNode(
            book.id,
            {
                category: "book",
                name: book.title,
                label: book.title,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 1,
                color: "#bc35ff",
            }
        );
    }

    addPersons(persons: Person[]): void {
        for (const person of persons) {
            this.addPerson(person);
        }
    }

    addClubs(clubs: Club[]): void {
        for (const club of clubs) {
            this.addClub(club);
        }
    }

    addEnterprises(enterprises: Enterprise[]): void {
        for (const enterprise of enterprises) {
            this.addEnterprise(enterprise);
        }
    }

    updateClubs(clubs: Club[]): void {
        for (const club of clubs) {
            this.graph.mergeNodeAttributes(club.id, {
                size: Math.ceil(club.size / 3.0),
            });
        }
    }

    updateEnterprises(enterprises: Enterprise[]): void {
        for (const enterprise of enterprises) {
            this.graph.mergeNodeAttributes(enterprise.id, {
                size: Math.ceil(enterprise.effectif / 3.0),
            });
        }
    }

    
}