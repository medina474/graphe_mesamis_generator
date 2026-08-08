import { Random } from "../stats/Random.js";
/**
 * https://www.insee.fr/fr/statistiques/3532172
 */
export class FirstnameDistribution {
    firstnames;
    constructor(firstnames) {
        this.firstnames = firstnames;
    }
    sample(person) {
        const pool = this.firstnames.find(p => person.age <= p.maxAge && person.gender == p.genre);
        if (typeof pool == 'undefined')
            return 'Inconnu';
        const values = pool.firstnames.map((e) => e.firstname);
        const weights = pool.firstnames.map((e) => e.count);
        //console.log(pool);
        return Random.weightedChoice(values, weights);
    }
}
//# sourceMappingURL=FirstnameDistribution.js.map