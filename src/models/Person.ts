import { Address } from "./Address.js";
import { Club } from "./Club.js";
import { Enterprise } from "./Enterprise.js";

export enum Gender {
  Male = "M",
  Female = "F",
  Unknown = "X",
}

export enum Education {
  None,
  CAP,
  Bac,
  Superior,
}

export enum Wealth {
  Low,
  Medium,
  High,
  VeryHigh,
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

  borrowedByGenre: Record<string, number>;

  edges: number;

  spouse?: Person;
  isMarried: boolean;
  isChild: boolean;
  father?: Person;
  mother?: Person;
  children: Person[];

  address?: Address;
  work?: Enterprise;

  clubs: Club[];
  tags: Set<string>; /* tag pour les type de clubs auxquels la psonne est déja membre */

}
