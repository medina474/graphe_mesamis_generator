import * as fs from 'fs';
import { parse } from 'csv/sync';
import { Book, Serie } from "../models/Book.js";

interface BookCSV {
  id: string;
  auteur: string; 
  titre: string;
  genres: string;
  serie?: string;
  tome?: number;
}

export class BooksLoader {
  static load(path: string, series: Serie[]): Book[] {
    const contenu = fs.readFileSync(path, 'utf-8');

    const records = parse(contenu, {
      columns: true,           
      skip_empty_lines: true 
    }) as BookCSV[];

    return records
      .map((record: BookCSV) => {
        const serie = series.find(s => record.serie == s.id);
        
        const book =  new Book(
          record.id, 
          record.auteur, 
          record.titre.trim(), 
          record.genres?.trim().split('|'),
          serie,
          Number(record.tome)
        )

        serie?.books.push(book)

        return book;
    }
  )
  }
}
