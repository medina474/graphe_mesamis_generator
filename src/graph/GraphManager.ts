import { DirectedGraph } from "graphology";
import { Gender, Person } from "../models/Person.js";
import { Club } from "../models/Club.js";
import { Book } from "../models/Book.js";
import { Enterprise } from "../models/Enterprise.js";

export class GraphManager {

    constructor(
        private readonly graph: DirectedGraph
    ) {}

    
    
}