export var Gender;
(function (Gender) {
    Gender["Male"] = "M";
    Gender["Female"] = "F";
    Gender["Unknown"] = "X";
})(Gender || (Gender = {}));
export var Education;
(function (Education) {
    Education[Education["None"] = 0] = "None";
    Education[Education["CAP"] = 1] = "CAP";
    Education[Education["Bac"] = 2] = "Bac";
    Education[Education["Superior"] = 3] = "Superior";
})(Education || (Education = {}));
export var Wealth;
(function (Wealth) {
    Wealth[Wealth["Low"] = 0] = "Low";
    Wealth[Wealth["Medium"] = 1] = "Medium";
    Wealth[Wealth["High"] = 2] = "High";
    Wealth[Wealth["VeryHigh"] = 3] = "VeryHigh";
})(Wealth || (Wealth = {}));
export class Person {
    id;
    firstname = "";
    lastname = "";
    gender = Gender.Unknown;
    age = 0;
    education = 0;
    wealth = 0;
    sport = 0;
    reading = 0;
    music = 0;
    books = [];
    emprunts = [];
    interestTags;
    edges = 0;
    spouse;
    father;
    mother;
    children = [];
    address;
    work;
    clubs = [];
    tags; /* tag pour les type de clubs auxquels la psonne est déja membre */
    constructor(id) {
        this.id = id;
        this.tags = new Set();
        this.interestTags = {};
    }
    isMarried() {
        return this.spouse != null;
    }
    isChild() {
        return this.mother != null;
    }
}
//# sourceMappingURL=Person.js.map