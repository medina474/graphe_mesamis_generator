import { readFileSync } from "node:fs";
import { AgePyramid } from "../AgePyramid.js";
export class AgePyramidLoader {
    static load(path) {
        const json = readFileSync(path, "utf8");
        const entries = JSON.parse(json);
        return new AgePyramid(entries);
    }
}
