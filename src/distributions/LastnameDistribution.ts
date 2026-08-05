import { Distribution } from "./Distribution.js";
import { Person } from "../models/Person.js";
import { Random } from "../stats/Random.js";
import { LastnameStat } from "../models/PersonStat.js";

export class LastnameDistribution
    implements Distribution<string>{

    private values: string[];
    private weights: number[];

    constructor (lastnames: LastnameStat[]) {
        this.values = lastnames.map((e) => e.name);
        this.weights = lastnames.map((e) => e.count);
    }

    sample(person:Partial<Person>):string{
        return Random.weightedChoice(this.values, this.weights);
    }
}
