import { readFileSync } from "node:fs";

import { FirstnameGeneration } from "../../models/Family.js";

export class FirstnameLoader {
  static load(path: string): FirstnameGeneration[] {
    const json = readFileSync(path, "utf8");
    return JSON.parse(json) as FirstnameGeneration[];
  }
}
