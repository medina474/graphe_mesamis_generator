import * as fs from 'fs/promises';
import { parse } from 'csv/sync';

import { Lastname } from "../models/Family.js";
import { NOMEM } from 'dns';

export class LastnameLoader {
  static async load(path: string): Promise<Lastname[]> {
    const contenu = await fs.readFile(path, 'utf-8');
    
    const records = parse(contenu, {
      columns: true,           
      skip_empty_lines: true 
    });

    return records
      .map((record: any) => 
        new Lastname(
          record.Nom?.trim(), 
          Number(record.Nombre?.replace(/\s/g, ""))
        )
      );
  }
}
