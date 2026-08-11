import { Gender, Person } from "../models/Person.js";
import { DirectedGraph } from "graphology";

export class FamilyGenerator {
  private hommes: Person[];
  private femmes: Person[];

  constructor(
    private graph: DirectedGraph,
    private individus: Person[],
  ) {
    this.hommes = individus.filter((i) => i.gender === Gender.Male);
    this.femmes = individus.filter((i) => i.gender === Gender.Female);
  }

  private getPartner(person: Person): Person {
    const edge = this.graph
      .edges(person.id)
      .find(
        (edge) => this.graph.getEdgeAttribute(edge, "relation") === "marriage",
      );

    if (!edge) {
      throw new Error(`Aucun conjoint pour ${person.id}`);
    }

    const [source, target] = this.graph.extremities(edge);

    const partnerId = source === person.id.toString() ? target : source;

    return this.individus.find((i) => i.id.toString() === partnerId)!;
  }

  private getParents(personId: string): string[] {
    return this.graph
      .edges(personId)
      .filter((edge) => {
        const attributes = this.graph.getEdgeAttributes(edge);
        return attributes.relation === "parent";
      })
      .map((edge) => {
        const [source, target] = this.graph.extremities(edge);
        return source === personId.toString() ? target : source;
      });
  }

  private sontApparentes(personne1: Person, personne2: Person): boolean {
    const parents1 = this.getParents(personne1.id);
    const parents2 = this.getParents(personne2.id);

    return parents1.some((parent) => parents2.includes(parent));
  }

  private tirageNombreEnfants(
    fertilite: number,
    nombreMaxEnfants: number,
  ): number {
    if (fertilite < 0) {
      throw new Error(
        `La fertilité ${fertilite} doit être comprise entre 0 et ${nombreMaxEnfants}`,
      );
    }

    if (fertilite > nombreMaxEnfants) {
      fertilite = nombreMaxEnfants;
    }

    // Distribution triangulaire centrée sur la fertilité.
    const poids: number[] = [];

    for (let i = 0; i <= nombreMaxEnfants; i++) {
      // Plus on est proche de la fertilité cible,
      // plus le poids est important.
      poids.push(Math.max(0, 1 - Math.abs(i - fertilite) / nombreMaxEnfants));
    }

    // Normalisation
    const total = poids.reduce((sum, p) => sum + p, 0);

    const probabilites = poids.map((p) => p / total);

    // Tirage
    const r = Math.random();
    let seuil = 0;

    for (let i = 0; i <= nombreMaxEnfants; i++) {
      seuil += probabilites[i];

      if (r < seuil) {
        return i;
      }
    }

    return nombreMaxEnfants;
  }

  generateCouple(
    minAge: number,
    maxAge: number,
    celibacyRate: number,
    fecondityRate: number,
  ) {
    console.log("");
    console.log(`----------------------------------------`);
    console.log(`Génération : ${minAge} - ${maxAge} ans`);
    console.log(`Taux de célibat attendu   : ${celibacyRate * 100} %`);
    console.log(
      `Taux de fécondité attendu : ${fecondityRate} enfants par femme`,
    );

    // Chercher des femmes non mariées
    const femmes = this.femmes.filter(
      (f) => f.isMarried() === false && f.age >= minAge && f.age < maxAge,
    );

    console.log(`Nombre de femmes dans la population : ${femmes.length}`);

    const nombreCouplesCible = Math.ceil(femmes.length * (1 - celibacyRate));

    let nombreCouples = 0;
    console.log(`Nombre de couples à atteindre       : ${nombreCouplesCible}`);
    console.log(`----------------------------------------`);

    for (const femme of femmes) {
      console.log(
        `- Femme ${femme.firstname} ${femme.lastname} (${femme.age} ans)`,
      );

      if (nombreCouples >= nombreCouplesCible) {
        console.log(`Le nombre de couples est atteint.`);
        break;
      }

      // Recherche des hommes compatibles. Hommes non mariés pas moins de 5 ans de moins
      // que la femme et au plus 10 ans de plus
      // Trier par écart d'age
      // ToDo : ajouter le niveau d'étude qui est très déterminant.
      const candidats = this.hommes
        .filter(
          (h) => !h.isMarried() && !this.sontApparentes(femme, h) && h.age > 20,
        )
        .map((homme) => ({
          homme,
          ecartAge: Math.abs(femme.age - homme.age),
          ecartEducation:
            homme.education - femme.education >= 0
              ? homme.education - femme.education
              : 10 + femme.education - homme.education,
        }))
        .filter(
          (c) => c.homme.age > femme.age - 5 && c.homme.age < femme.age + 10,
        )
        .sort(
          (a, b) =>
            a.ecartAge - b.ecartAge || a.ecartEducation - b.ecartEducation,
        );

      console.log(`Nombre de candidats pour le mariage : ${candidats.length}`);
      if (candidats.length === 0) {
        continue;
      }

      // Pour l'instant : choisir aléatoirement parmi
      // les cinq meilleurs candidats
      const nb = Math.min(5, candidats.length);
      const candidat = candidats[Math.floor(Math.random() * nb)];

      const epoux = candidat.homme;

      this.graph.addEdge(femme.id, epoux.id, {
        relation: "marriage",
        type: "line",
        size: 0.5,
        category: "family",
        weight: 3,
      });

      // Une personne ne peut être marié qu'une fois
      epoux.spouse = femme
      femme.spouse = epoux
      nombreCouples++;
    }

    const celibataires = femmes.filter((f) => !f.isMarried()).length;

    const tauxCelibataires = celibataires / femmes.length;

    const feconditeCouples = fecondityRate / (1 - tauxCelibataires);

    console.log(`----------------------------------------`);
    console.log(`Nombre de mariages : ${nombreCouples}`);
    console.log(
      `Taux de célibat réel : ${(tauxCelibataires * 100).toFixed(2)} % / ${((celibacyRate - tauxCelibataires) * 100).toFixed(2)} %`,
    );
    console.log(
      `Taux de fécondité des couples : ${feconditeCouples.toFixed(2)} enfants par femme`,
    );
    console.log(`----------------------------------------`);

    const femmesMariees = femmes.filter((femme) => femme.isMarried());

    let indexCouple = 1;
    let nbEnfants = 0;

    for (const femme of femmesMariees) {
      const epoux = this.getPartner(femme);

      console.log(
        `- Couple ${indexCouple} : ${femme.firstname} ${femme.lastname} (${femme.age} ans) / ${epoux.firstname} ${epoux.lastname} (${epoux.age} ans)`,
      );

      // Pas déja enfant d'une autre femme et age compatible
      const candidatsEnfants = this.individus.filter(
        (c) => !c.isChild() && c.age >= femme.age - 40 && c.age <= femme.age - 22,
      );

      console.log(
        `Population d'enfants potentiels : ${candidatsEnfants.length}`,
      );

      // Les enfants du couple 1.95 par femme max 5
      const nombreEnfants = Math.min(
        this.tirageNombreEnfants(feconditeCouples, 5),
        candidatsEnfants.length,
      );

      console.log(`nombre d'enfants pour ce couple : ${nombreEnfants}`);

      const enfants = candidatsEnfants
        .sort(() => Math.random() - 0.5)
        .slice(0, nombreEnfants);

      for (const enfant of enfants) {
        console.log(`* ${enfant.firstname} (${enfant.age} ans)`);

        enfant.lastname = epoux.lastname;
        enfant.father = epoux
        enfant.mother = femme;

        femme.children.push(enfant);
        epoux.children.push(enfant);

        this.graph.addEdge(femme.id, enfant.id, {
          type: "arrow",
          size: 0.5,
          relation: "mother",
          category: "family",
          weight: 2,
        });

        this.graph.addEdge(enfant.id, femme.id, {
          relation: "child",
          type: "arrow",
          size: 0.5,
          category: "family",
          weight: 2,
        });

        this.graph.addEdge(epoux.id, enfant.id, {
          relation: "father",
          type: "arrow",
          size: 0.5,
          category: "family",
          weight: 2,
        });

        this.graph.addEdge(enfant.id, epoux.id, {
          relation: "child",
          type: "arrow",
          size: 0.5,
          category: "family",
          weight: 2,
        });

        this.graph.mergeNodeAttributes(enfant.id, {
          lastname: enfant.lastname,
          label: `${enfant.firstname} ${enfant.lastname} (${enfant.age})`,
        });

        nbEnfants++;
      }

      indexCouple++;
    }

    console.log("");
    console.log(`----------------------------------------`);
    console.log(
      `Fécondité générale : ${(nbEnfants / femmes.length).toFixed(2)} / ${fecondityRate}`,
    );
    console.log(
      `Fécondité par couple : ${(nbEnfants / femmesMariees.length).toFixed(2)} / ${feconditeCouples.toFixed(2)}`,
    );
  }

  generate(): void {
    this.generateCouple(65, 120, 0.2, 3);
    this.generateCouple(55, 65, 0.2, 2.0);
    this.generateCouple(45, 55, 0.15, 1.9);
    this.generateCouple(35, 45, 0.1, 1.9);
    this.generateCouple(30, 35, 0.15, 1.9);
    this.generateCouple(25, 30, 0.3, 1);
    this.generateCouple(18, 25, 0.5, 0.4);
  }
}
