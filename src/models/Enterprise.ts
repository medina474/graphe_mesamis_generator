import { Education } from '../models/Person.js';

export interface PlageRichesse {
  min: number;
  max: number;
}

interface Poste {
  /**
   * Nombre de personnes recherchées pour ce poste.
   */
  effectif: number;

  /**
   * Nombre de personnes recherchées pour ce poste.
   */
  niveauEtude: Education | null;

  /**
   * Richesse associée au poste.
   * Un nombre = richesse fixe.
   * Une plage = richesse tirée aléatoirement.
   */
  richesse: number | PlageRichesse;

  /**
   * Description du poste.
   */
  commentaire?: string;
}

export class Enterprise {
    
    constructor(
      public readonly id: string, 
      public readonly name: string,
      public readonly postes: Poste[],
    ) {
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
