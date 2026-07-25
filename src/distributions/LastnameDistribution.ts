import { Distribution } from "./Distribution.js";
import { Person } from "../models/Person.js";

export class LastnameDistribution
    implements Distribution<string>{

    sample(person:Partial<Person>):string{

        return ""

    }
}