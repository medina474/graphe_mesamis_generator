import { Address } from "./Address.js";
import { Club } from "./Club.js";

export enum Gender {
    Male = "M",
    Female = "F",
    Unknown = "X"
}

export enum Education {
    None,
    CAP,
    Bac,
    Superior
}

export enum Wealth {
    Low,
    Medium,
    High,
    VeryHigh
}

export interface Person {

    id: string;

    firstname: string;
    lastname: string;

    gender: Gender;

    age: number;

    education: Education;
    wealth: Wealth;

    sport: number;
    reading: number;
    music: number;

    edges: number;

    spouse?: Person
    isMarried: boolean;
    isChild: boolean;

    address?: Address

    clubs: Club[];
    tags: Set<string>;
}
