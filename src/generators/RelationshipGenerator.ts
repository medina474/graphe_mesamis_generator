import { Console } from "console";
import { CsvPersonExporter } from "../exporters/CsvPersonExporter.js";
import { Gender, Person } from "../models/Person.js";
import { UndirectedGraph } from "graphology";
import { Club } from "../stats/ClubPool.js";
import { exit } from "process";
import { nodeCrypto } from "random-js";

export class RelationshipGenerator {
  private p_pref = 0.45; // 0.45
  private p_triadic = 0.45; // 0.40
  private p_similitude = 1 - this.p_pref - this.p_triadic;

  private graph: UndirectedGraph;

  private hommes: Person[];
  private femmes: Person[];

  constructor(
    private individus: Person[],
    private clubs: Club[]
  ) {
    this.graph = new UndirectedGraph();

    for (let k = 0; k < this.individus.length; k++) {
      const p = this.individus[k];
      this.graph.addNode(p.id, {
        category: 'person',
        firstname: p.firstname,
        lastname: p.lastname,
        age: p.age,
        x: Math.random() * 100,
        y: Math.random() * 100,
        label: `${p.firstname} ${p.lastname} ${p.age}`,
        size: 3,
        color: p.gender === Gender.Male ? "#4A90E2" : "#FF69B4",
      });
    }

    this.hommes = individus.filter((i) => i.gender === Gender.Male);
    this.femmes = individus.filter((i) => i.gender === Gender.Female);

    for (const club of this.clubs) {
      club.size = 1;
      this.graph.addNode(club.id, {
        category: 'club',
        name: club.name,
        label: club.name,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1,
        color: "#82ff69",
      });
    }
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  generateFriends() {
    const N = this.individus.length;

    for (let k = 0; k < N * 15; k++) {
      const i = Math.floor(Math.random() * N);
      const j = Math.floor(Math.random() * N);

      if (i === j) {
        continue;
      }

      if (this.graph.hasEdge(String(i), String(j))) {
        continue;
      }

      const a = this.individus[i];
      const b = this.individus[j];

      // Homophilie
      const diffSexe = +(a.gender == b.gender);
      const diffAge = Math.abs(a.age - b.age) / 60;
      const diffLecture = Math.abs(a.reading - b.reading);
      const diffMusique = Math.abs(a.music - b.music);
      const diffSport =
        (1 - Math.abs(a.sport - b.sport)) *
        Math.pow((a.sport + b.sport) / 2, 2);

      const diffEtudes = Math.abs(a.education - b.education) / 3;
      const diffRichesse = Math.abs(a.wealth - b.wealth) / 3;
      const similitude =
        1 -
        (diffSexe * 2 +
          diffAge * 2 +
          diffLecture +
          diffMusique +
          diffSport * 4 +
          diffEtudes +
          diffRichesse) /
          12;

      // Attachement préférentiel
      const degreeA = this.graph.degree(String(i)) + 1;
      const degreeB = this.graph.degree(String(j)) + 1;
      const pref = (degreeA + degreeB) / (2 * this.individus.length);

      // Fermeture triadique
      const neighborsA = new Set(this.graph.neighbors(String(i)));
      const neighborsB = new Set(this.graph.neighbors(String(j)));
      const common = [...neighborsA].filter((n) => neighborsB.has(n)).length;
      const triadic = Math.min(common / 3, 0.5);

      // Probabilité globale
      const p =
        this.p_similitude * similitude +
        this.p_pref * pref +
        this.p_triadic * triadic;
      const r = Math.random();

      //console.log(`${similitude} ${pref} ${triadic} ${p} (>${r})`);

      if (r < p) {
        this.individus[i].edges++;
        this.individus[j].edges++;
        this.graph.addEdge(String(i), String(j),{
          relation: "friends",
          category: "friends",
          weight: 3,
        });
      }
    }
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

  private getParents(personId: number): string[] {
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

  private getClubs(personId: number): string[] {
    return this.graph
      .edges(personId)
      .filter((edge) => {
        const attributes = this.graph.getEdgeAttributes(edge);
        return attributes.relation === "club";
      })
      .map((edge) => {
        const [source, target] = this.graph.extremities(edge);
        return source === personId.toString() ? target : source;
      });
  }

  private isAffiliate(personne: Person, club: Club): boolean {
    return this.getClubs(personne.id).includes(club.id);
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

  generateCouple(
    minAge: number,
    maxAge: number,
    celibacyRate: number,
    fecondityRate: number,
  ) {
    console.log(`----------------------------------------`);
    console.log(`Génération : ${minAge} - ${maxAge} ans`);
    console.log(`Taux de célibat attendu   : ${celibacyRate * 100} %`);
    console.log(`Taux de fécondité attendu : ${fecondityRate} enfants par femme`);

    // Chercher des femmes non mariées
    const femmes = this.femmes.filter(
      (f) => f.married === false && f.age >= minAge && f.age < maxAge,
    );

    console.log(`Nombre de femmes dans la population : ${femmes.length}`);

    const nombreCouplesCible = Math.ceil(femmes.length * (1 - celibacyRate));

    let nombreCouples = 0;
    console.log(`Nombre de couples à atteindre       : ${nombreCouplesCible}`);
    console.log(`**********`);

    for (const femme of femmes) {
      console.log(`- Femme ${femme.firstname} ${femme.lastname} (${femme.age} ans)`);

      if (nombreCouples >= nombreCouplesCible) {
        console.log(`Le nombre de couples est atteint.`);
        break;
      }

      // Recherche des hommes compatibles. Hommes non mariés pas moins de 5 ans de moins
      // que la femme et au plus 10 ans de plus
      // Trier par écart d'age
      // ToDo : ajouter le niveau d'étude qui est très déterminant.
      const candidats = this.hommes
        .filter((h) => !h.married && !this.sontApparentes(femme, h) && h.age > 20)
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
        category: "family",
        weight: 3,
      });

      // Une personne ne peut être marié qu'une fois
      epoux.married = true;
      femme.married = true;
      nombreCouples++;
    }

    const celibataires = femmes.filter((f) => !f.married).length;

    const tauxCelibataires = celibataires / femmes.length;

    const feconditeCouples = fecondityRate / (1 - tauxCelibataires);

    console.log(`**********`);
    console.log(`Nombre de mariages : ${nombreCouples}`);
    console.log(
      `Taux de célibat réel : ${(tauxCelibataires * 100).toFixed(2)} % / ${celibacyRate * 100} %`,
    );
    console.log(
      `Taux de fécondité des couples : ${feconditeCouples.toFixed(2)} enfants par femme`,
    );
    console.log(`**********`);

    const femmesMariees = femmes.filter((femme) => femme.married);

    let indexCouple = 1;
    let nbEnfants = 0;

    for (const femme of femmesMariees) {
      const epoux = this.getPartner(femme);

      console.log(
        `- Couple ${indexCouple} : ${femme.firstname} ${femme.lastname} (${femme.age} ans) / ${epoux.firstname} ${epoux.lastname} (${epoux.age} ans)`,
      );

      // Pas déja enfant d'une autre femme et age compatible
      const candidatsEnfants = this.individus.filter(
        (c) => !c.child && c.age >= femme.age - 40 && c.age <= femme.age - 22,
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

        enfant.child = true;
        enfant.lastname = epoux.lastname;

        this.graph.addEdge(femme.id, enfant.id, {
          relation: "parent",
          category: "family",
          weight: 2,
        });

        this.graph.addEdge(epoux.id, enfant.id, {
          relation: "parent",
          category: "family",
          weight: 2,
        });

        this.graph.mergeNodeAttributes(enfant.id, {
          lastname: enfant.lastname,
          label: `${enfant.firstname} ${enfant.lastname} ${enfant.age}`,
        });

        nbEnfants++;
      }

      indexCouple++;
    }

    console.log("**********")
    console.log(`Fécondité générale : ${(nbEnfants / femmes.length).toFixed(2)} / ${fecondityRate}`)
    console.log(`Fécondité par couple : ${(nbEnfants / femmesMariees.length).toFixed(2)} / ${feconditeCouples.toFixed(2)}`)
  }

  /**
   * Club
   */
  private scoreClub(
    personne: Person,
    club: Club
): number {

    let score;

    if (club.tags.includes("sport")) {
      // Les clubs de sport sont exclusifs. Une personne ne peut pas adhérer à deux clubs de sport
      score = (personne.clubs.some(c => c.tags.includes("sport"))) ?
      0 :
      personne.sport;
    }
    else if (club.tags.includes("musique")) {
      score = personne.music
    }
    else {
      score = Math.random();
    }

    return score;
}

  clubAffiliate() {

    for (const club of this.clubs) {

      // Les clubs ont une capacité maximale. 
      // Calculons la capacité réelle
      const capacite_reelle = Math.floor(club.capacite * (Math.random() / 3 + 0.7)) 

      // Choisir les candidats :
      // - Ils ne doivent pas déja appartenir au club
      let candidats: Person[] = this.individus.filter(i => !i.clubs.includes(club));
      
      // Trier les candidats suivant le score Club 
      // Sélectionner une population 5 fois plus grande.
      // Les trier aléatoirement
      let retenus = this.shuffle(
        candidats
          .map(i => ({
            personne: i,
            score: this.scoreClub(i, club)
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, club.capacite * 5)
      )

      // Finalement ne garder que le nombre corresopndant à la capacité
      for (let r of retenus.slice(0, capacite_reelle - 1))
      {
        r.personne.clubs.push(club)

        this.graph.addEdge(r.personne.id, club.id, {
            relation: "club",
            category: "club",
            weight: 1,
          });

        this.graph.mergeNodeAttributes(club.id, {
            size: club.size,
          });

        club.size++;
      }

      console.log(`${club.name} : ${club.size} adhérents`)
    }
  }

  generateMany(): UndirectedGraph {
    this.generateCouple(65, 120, 0.2, 2.2);
    this.generateCouple(55, 65, 0.2, 2.0);
    this.generateCouple(45, 55, 0.15, 1.9);
    this.generateCouple(35, 45, 0.1, 1.9);
    this.generateCouple(30, 35, 0.15, 1.9);
    this.generateCouple(25, 30, 0.3, 1);
    this.generateCouple(18, 25, 0.5, 0.4);

    this.clubAffiliate();

    return this.graph;
  }

  
  export(): object {
    return this.graph.export();
  }
}
