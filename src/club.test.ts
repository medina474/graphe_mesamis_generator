import { describe, expect, it } from "vitest";
import { DirectedGraph } from "graphology";
import { Person, Gender } from "./models/Person.js"
import { Club } from "./models/Club.js"
import { ClubMembershipGenerator } from "./generators/ClubMembershipGenerator.js"
import { Random } from "./stats/Random.js";

describe("Club", () => {
  it("exclut les personnes ayant une catégorie du club", () => {
    const graph = new DirectedGraph()

    const person = {
          id: "1",
          edges: 0,
          isMarried: false,
          isChild: false,
          clubs: [],
          tags: new Set<string>(),
          firstname: 'Marc',
          lastname: 'Machin',
          gender: Gender.Male,
          education: 0,
          wealth: 0,
          sport: 1,
          music: 0,
          reading: 0,
          age: 0,
          isHoused: false,
        } as Person;
    
    person.tags.add("sport")
    const persons: Person[] = [person];

    const club = new Club("club-test", "Test", 1, [], [],
      {
          male:1, female: 0
      }
      ,{
          sport: 1
      }
    );

    const clubs: Club[] = [club];
    
    const clubMembershipGenerator = new ClubMembershipGenerator(graph, persons , clubs);
    clubMembershipGenerator.generate();
    expect(club.capacity).toEqual(1);
  });
});

describe("Random", () => {
  it("Next [0-1)", () => {
    expect(Random.next()).toBeLessThan(1)
  });
  it("Next [0-1)", () => {
    expect(Random.int(2, 3)).toBeLessThanOrEqual(3)
    expect(Random.int(2, 3)).toBeGreaterThanOrEqual(2)
  });
  it("Next [0-1)", () => {
    expect(Random.int(2, 3)).toBeLessThanOrEqual(3)
    expect(Random.int(2, 3)).toBeGreaterThanOrEqual(2)
  });
});