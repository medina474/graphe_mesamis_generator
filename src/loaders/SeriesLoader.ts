import * as fs from 'fs/promises';
import { parse } from 'csv/sync';
import { Serie } from "../models/Book.js";

export class SeriesLoader {
  static async load(path: string): Promise<Serie[]> {
    const contenu = await fs.readFile(path, 'utf-8');

    const records = parse(contenu, {
      columns: true,           
      skip_empty_lines: true 
    });

    return records
      .map((record: any) => 
        new Serie(
          record.id, 
          record.serie, 
          record.ordre.trim(), 
        )
      )
  }
}
