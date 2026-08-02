import { readFileSync } from "node:fs";

import { Lastname } from "../../models/Family.js";

export class LastnameLoader {
  static load(path: string): Lastname[] {
    const csv = readFileSync(path, "utf8");

    return csv
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [rawName, rawCount] = line.split(",");
        const name = rawName?.trim();
        const count = Number(rawCount?.replace(/\s/g, ""));

        if (!name || Number.isNaN(count)) {
          return null;
        }

        return new Lastname(name, count);
      })
      .filter((item): item is Lastname => item !== null);
  }
}
