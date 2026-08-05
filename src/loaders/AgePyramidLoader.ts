import { readFileSync } from "node:fs";

import { AgePyramidStat, AgePyramidEntry } from "../models/AgePyramidStat.js";

export class AgePyramidLoader {
  static load(path: string): AgePyramidStat {
    const json = readFileSync(path, "utf8");

    const entries = JSON.parse(json) as AgePyramidEntry[];

    return new AgePyramidStat(entries);
  }
}
