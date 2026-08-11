import * as fs from 'fs';
import { parse } from 'csv/sync';
import { Book, Serie, Award, AwardEdition } from "../models/Book.js";

interface NomineeCSV {
  book: string; 
  award: string;
  year: string;
  place: string;
  categorie: string;
}

export class AwardsEditionsLoader {
  static load(path: string, books: Book[], awards: Award[]): AwardEdition[] {
    const contenu = fs.readFileSync(path, 'utf-8');

    const records = parse(contenu, {
      columns: true,           
      skip_empty_lines: true 
    }) as NomineeCSV[];

    let index = 1;

    return records
      .map((record: NomineeCSV) => {
        const book = books.find(b => record.book == b.id);
        const award = awards.find(a => record.award == a.id);

        const nominee =  new AwardEdition(
          `nominee_${index++}`, 
          book!, 
          award!, 
          Number(record.year),
          Number(record.place),
          record.categorie
        )

        book?.awards.push(nominee)

        return nominee;
    }
  )
  }
}
