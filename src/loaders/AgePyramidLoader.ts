import { readFileSync } from "node:fs";

import { AgePyramid } from "../stats/AgePyramid.js";
import { AgePyramidEntry } from "../models/AgePyramidEntry.js";

export class AgePyramidLoader {
  static load(path: string): AgePyramid {
    const json = readFileSync(path, "utf8");

    const entries = JSON.parse(json) as AgePyramidEntry[];

    return new AgePyramid(entries);
  }
}
