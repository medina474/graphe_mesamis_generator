import { Distribution } from "./Distribution.js";
import { Person } from "../models/Person.js";
import { Random } from "../stats/Random.js";
import { FirstnameStat } from "../models/PersonStat.js";

/**
 * https://www.insee.fr/fr/statistiques/3532172
 */
export class FirstnameDistribution
    implements Distribution<string>{

    private readonly firstnames: FirstnameStat[];

    constructor (firstnames: FirstnameStat[]) {
        this.firstnames = firstnames
    }

    sample(person:Partial<Person>):string {

        const pool = this.firstnames.find(p => person.age! <= p.maxAge && person.gender == p.genre);
        if (typeof pool == 'undefined') return 'Inconnu';

        const values = pool.firstnames.map((e) => e.firstname);
        const weights = pool.firstnames.map((e) => e.count);

        //console.log(pool);
        return Random.weightedChoice(values, weights);
    }
}