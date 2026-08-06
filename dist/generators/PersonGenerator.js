import { Gender } from "../models/Person.js";
import { AgeDistribution } from "../distributions/AgeDistribution.js";
import { GenderDistribution } from "../distributions/GenderDistribution.js";
import { FirstnameDistribution } from "../distributions/FirstnameDistribution.js";
import { LastnameDistribution } from "../distributions/LastnameDistribution.js";
import { EducationDistribution } from "../distributions/EducationDistribution.js";
import { WealthDistribution } from "../distributions/WealthDistribution.js";
import { SportDistribution } from "../distributions/SportDistribution.js";
import { ReadingDistribution } from "../distributions/ReadingDistribution.js";
import { MusicDistribution } from "../distributions/MusicDistribution.js";
export class PersonGenerator {
    pyramid;
    firstnames;
    lastnames;
    ageDistribution;
    genderDistribution;
    firstnameDistribution;
    lastnameDistribution;
    educationDistribution;
    wealthDistribution;
    sportDistribution;
    readingDistribution;
    musicDistribution;
    constructor(pyramid, firstnames, lastnames, minAge = 18, maxAge = Number.MAX_SAFE_INTEGER) {
        this.pyramid = pyramid;
        this.firstnames = firstnames;
        this.lastnames = lastnames;
        this.ageDistribution = new AgeDistribution(pyramid, minAge);
        this.genderDistribution = new GenderDistribution(pyramid);
        this.firstnameDistribution = new FirstnameDistribution(firstnames);
        this.lastnameDistribution = new LastnameDistribution(lastnames);
        this.educationDistribution = new EducationDistribution();
        this.wealthDistribution = new WealthDistribution();
        this.sportDistribution = new SportDistribution();
        this.readingDistribution = new ReadingDistribution();
        this.musicDistribution = new MusicDistribution();
    }
    /**
     * Génère un individu complet
     */
    generate(id) {
        /*
         * On construit progressivement l'individu (interface + partial plutôt que class).
         *
         * Les distributions peuvent utiliser
         * les propriétés déjà présentes.
         */
        const person = {
            id,
            edges: 0,
            isMarried: false,
            isChild: false,
            clubs: [],
            tags: new Set(),
            firstname: "",
            lastname: "",
            gender: Gender.Unknown,
            age: 0,
            education: 0,
            wealth: 0,
            sport: 0,
            music: 0,
            reading: 0,
            isHoused: false
        };
        // Caractéristiques démographiques
        person.age = this.ageDistribution.sample(person);
        person.gender = this.genderDistribution.sample(person);
        person.firstname = this.firstnameDistribution.sample(person);
        person.lastname = this.lastnameDistribution.sample(person);
        if (person.age < 18)
            return person;
        // Caractéristiques sociales
        person.education = this.educationDistribution.sample(person);
        person.wealth = this.wealthDistribution.sample(person);
        // Centres d'intérêt
        person.sport = this.sportDistribution.sample(person);
        person.reading = this.readingDistribution.sample(person);
        person.music = this.musicDistribution.sample(person);
        return person;
    }
    /**
     * Génère une population complète
     */
    generateMany(count) {
        const persons = [];
        for (let i = 1; i <= count; i++) {
            persons.push(this.generate(i.toString()));
        }
        return persons;
    }
}
