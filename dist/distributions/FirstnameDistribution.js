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
        return Random.choice(pool.firstnames);
    }
}
