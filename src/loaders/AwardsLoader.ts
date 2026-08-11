import * as fs from 'fs';
import { parse } from 'csv/sync';
import { Award } from "../models/Book.js";

export class AwardsLoader {
  static load(path: string): Award[] {
    const contenu = fs.readFileSync(path, 'utf-8');

    const records = parse(contenu, {
      columns: true,           
      skip_empty_lines: true 
    }) as Award[];

    return records;
  }
}
