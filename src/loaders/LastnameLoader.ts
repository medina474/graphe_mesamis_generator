import * as fs from 'fs';
import { parse } from 'csv/sync';

import { LastnameStat } from "../models/PersonStat.js";

export class LastnameLoader {
  static load(path: string): LastnameStat[] {
    const contenu = fs.readFileSync(path, 'utf-8');
    
    const records = parse(contenu, {
      columns: true,           
      skip_empty_lines: true 
    });

    return records
      .map((record: any) => 
        new LastnameStat(
          record.Nom?.trim(), 
          Number(record.Nombre?.replace(/\s/g, ""))
        )
      );
  }
}
