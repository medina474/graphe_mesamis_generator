import { Person } from "../models/Person.js";

export interface Distribution<T> {

    sample(person:Partial<Person>):T;

}