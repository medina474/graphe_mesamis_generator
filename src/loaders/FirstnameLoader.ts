import { readFileSync } from "node:fs";

import { FirstnameStat } from "../models/PersonStat.js";

export class FirstnameLoader {
  static load(path: string): FirstnameStat[] {
    const json = readFileSync(path, "utf8");
    return JSON.parse(json) as FirstnameStat[];
  }
}
