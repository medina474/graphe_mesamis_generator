import * as fs from 'fs/promises';
import { parse } from 'csv/sync';

import { LastnameStat } from "../models/PersonStat.js";
import { NOMEM } from 'dns';

export class LastnameLoader {
  static async load(path: string): Promise<LastnameStat[]> {
    const contenu = await fs.readFile(path, 'utf-8');
    
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
