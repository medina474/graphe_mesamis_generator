import { ClubPool } from "../stats/ClubPool.js";

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

    id: number;

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
    married: boolean;
    child: boolean;

    clubs: ClubPool[];
}
