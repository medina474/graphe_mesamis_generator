import { Distribution } from "./Distribution.js";
import { Gender, Person } from "../models/Person.js";
import { Random } from "../stats/Random.js";
import { FirstnamePool } from "../stats/FirstnamePool.js";

/**
 * https://www.insee.fr/fr/statistiques/3532172
 */
export class FirstnameDistribution
    implements Distribution<string>{

    private readonly firstnames: FirstnamePool[];

    constructor (firstnames: FirstnamePool[]) {
        this.firstnames = firstnames
    }

    sample(person:Partial<Person>):string {

        const pool = this.firstnames.find(p => person.age! <= p.maxAge && person.gender == p.genre);
        if (typeof pool == 'undefined') return 'Inconnu';

        return Random.choice(pool.firstnames);
    }
}