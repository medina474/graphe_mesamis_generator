import * as fs from 'fs';
import { parse } from 'csv/sync';
import { Book } from "../models/Book.js";

export class BooksLoader {
  static load(path: string): Book[] {
    const contenu = fs.readFileSync(path, 'utf-8');

    const records = parse(contenu, {
      columns: true,           
      skip_empty_lines: true 
    });

    return records
      .map((record: any) => 
        new Book(
          record.id, 
          record.auteur, 
          record.titre.trim(), 
          record.genres?.trim().split('|')
        )
      )
  }
}
