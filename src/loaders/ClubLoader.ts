import { readFileSync } from "node:fs";

import { Club } from "../models/Club.js";

export class ClubLoader {
  static load(path: string): Club[] {
    const json = readFileSync(path, "utf8");
    return JSON.parse(json) as Club[];
  }
}
