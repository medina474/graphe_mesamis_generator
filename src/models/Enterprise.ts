import { Education } from '../models/Person.js';

export interface PlageRichesse {
  min: number;
  max: number;
}

class Poste {
  
  constructor(
    public readonly effectif: number,
    public readonly niveauEtude: Education | null,
    public readonly richesse: number | PlageRichesse,
    ageMin?: number,
    ageMax?: number,
    public readonly commentaire?: string,
  ) {
  }

  static fromJson(json: any): Poste {
    return new Poste(
            json.effectif,
            json.niveauEtude,
            json.richesse,
            json.ageMin,
            json.ageMax,
        );
  }
}

export class Enterprise {
    
    constructor(
      public readonly id: string, 
      public readonly name: string,
      public readonly postes: Poste[],
    ) {
    }

    static fromJson(json: any): Enterprise {
        return new Enterprise(
            json.id,
            json.name,
            json.postes.map((p: any) => Poste.fromJson(p)),
        );
    }

    /**
     * Effectif total prévu de l'entreprise.
     */
    get effectif(): number {
      return this.postes.reduce(
        (total, poste) => total + poste.effectif,
        0,
      );
    }
}
