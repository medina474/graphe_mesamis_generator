import * as fs from 'fs/promises';
import { parse } from 'csv/sync';
import { LiteraryWork } from "../models/Book.js";

export class LiteraryWorkLoader {
  static async load(path: string): Promise<LiteraryWork[]> {
    const contenu = await fs.readFile(path, 'utf-8');

    const records = parse(contenu, {
      columns: true,           
      skip_empty_lines: true 
    });

    return records
      .map((record: any) => 
        new LiteraryWork(
          record.id, 
          record.Auteur, 
          record.Titre.trim(), 
          record.Genre?.trim().split('|')
        )
      )
  }
}
