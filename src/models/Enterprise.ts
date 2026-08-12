import { Education } from "../models/Person.js";

export interface PlageRichesse {
  min: number;
  max: number;
}

export class Poste {
  constructor(
    public readonly effectif: number,
    public readonly niveauEtude: Education | null,
    public readonly richesse: number | PlageRichesse,
    public readonly ageMin?: number,
    public readonly ageMax?: number,
    public readonly name?: string,
  ) {}

  static fromJson(json: any): Poste {
    return new Poste(
      json.effectif,
      json.niveauEtude,
      json.richesse,
      json.ageMin,
      json.ageMax,
      json.name,
    );
  }
}

export class Enterprise {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly postes: Poste[],
  ) {}

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
    return this.postes.reduce((total, poste) => total + poste.effectif, 0);
  }
}

export class Facture {
  constructor(
    public readonly id: string,
    public readonly date: Date,
    public readonly fournisseur: Enterprise,
    public readonly client: Enterprise,
    public readonly lignes: LigneFacture[],
    public readonly montant_ht: Number,
    public readonly taux_tva: Number,
    public readonly montant_tva: Number,
    public readonly montant_ttc: Number,
  ) {}

  static fromJson(json: any): Facture {
    return new Facture(
      json.id,
      json.date,
      json.fournisseur_id,
      json.client_id,
      json.lignes.map((l: any) => LigneFacture.fromJson(l)),
      json.montant_ht,
      json.taux_tva,
      json.montant_tva,
      json.montant_ttc,
    );
  }
}

export class LigneFacture {
  constructor(
    public readonly designation: string,
    public readonly quantite: Number,
    public readonly unite: string,
    public readonly prix_unitaire: Number,
    public readonly montant_ht: Number,
  ) {}

  static fromJson(json: any): LigneFacture {
    return new LigneFacture(
      json.designation,
      json.quantite,
      json.unite,
      json.prix_unitaire_ht,
      json.montant_ht,
    );
  }
}
