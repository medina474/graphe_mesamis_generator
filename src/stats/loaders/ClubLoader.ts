import { readFileSync } from "node:fs";

import { ClubPool } from "../ClubPool.js";

export class ClubLoader {
  static load(path: string): ClubPool[] {
    const json = readFileSync(path, "utf8");
    return JSON.parse(json) as ClubPool[];
  }
}
