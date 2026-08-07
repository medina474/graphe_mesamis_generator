import * as fs from "fs";
import { parse } from "csv/sync";

import { Address, Voie } from "../models/Address.js";

interface Record {
  numero: string;
  id_voie: string;
  lon: number;
  lat: number;
  appartement: number;
}

export class AddressLoader {
  static load(path: string, voies: Voie[]): Address[] {
    const contenu = fs.readFileSync(path, "utf-8");

    const records = parse(contenu, {
      columns: true,
      skip_empty_lines: true,
    }) as Record[];

    const result: Address[] = [];

    for (const r of records) {
      const voie = voies.find((v) => v.id == r.id_voie);

      if (r.appartement == 1) {
        const id = `${r.id_voie}_${r.numero.padStart(5, "0")}`;
        result.push(
          new Address(
            id,
            r.numero?.trim(),
            `${r.numero} ${voie?.voie}`,
            voie!,
            r.lon,
            r.lat,
          )
        );
      } else if (r.appartement > 1) {
        for (let k = 1 ; k <= r.appartement ; k++) {
            const id = `${r.id_voie}_${r.numero.padStart(5, "0")}_${k}`;
            result.push(
                new Address(
                    id,
                    r.numero?.trim(),
                    `${r.numero} ${voie?.voie} - ${k}`,
                    voie!,
                    r.lon,
                    r.lat,
                )
            );
        }
      }
    }

    return result;
  }
}
