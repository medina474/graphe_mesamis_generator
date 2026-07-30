import { readFileSync } from "node:fs";

import { FirstnamePool } from "../FirstnamePool.js";

export class FirstnameLoader {
  static load(path: string): FirstnamePool[] {
    const json = readFileSync(path, "utf8");
    return JSON.parse(json) as FirstnamePool[];
  }
}
