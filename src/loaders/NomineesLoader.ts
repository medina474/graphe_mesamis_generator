import * as fs from 'fs';
import { parse } from 'csv/sync';
import { Book, Serie, Award, Nominee } from "../models/Book.js";

interface BookCSV {
  id: string;
  book: string; 
  award: string;
  genres: string;
  serie?: string;
  tome?: number;
}

export class NomineeLoader {
  static load(path: string, books: Book[], awards: Award[]): Nominee[] {
    const contenu = fs.readFileSync(path, 'utf-8');

    const records = parse(contenu, {
      columns: true,           
      skip_empty_lines: true 
    }) as BookCSV[];

    return records
      .map((record: BookCSV) => {
        const book = books.find(b => record.book == b.id);
        const award = awards.find(a => record.award == a.id);

        const nominee =  new Nominee(
          record.id, 
          book!, 
          award!, 
          record.genres?.trim().split('|'),
          serie,
          Number(record.tome)
        )

        book?.awards.push(book)

        return book;
    }
  )
  }
}
