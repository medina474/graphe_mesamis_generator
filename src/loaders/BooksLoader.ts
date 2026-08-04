import * as fs from 'fs/promises';
import { parse } from 'csv/sync';
import { Book } from "../models/Book.js";

export class BooksLoader {
  static async load(path: string): Promise<Book[]> {
    const contenu = await fs.readFile(path, 'utf-8');

    const records = parse(contenu, {
      columns: true,           
      skip_empty_lines: true 
    });

    return records
      .map((record: any) => 
        new Book(
          record.id, 
          record.Auteur, 
          record.Titre.trim(), 
          record.Genre?.trim().split('|')
        )
      )
  }
}
