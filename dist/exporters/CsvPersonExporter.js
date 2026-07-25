import { createObjectCsvWriter } from "csv-writer";
export class CsvPersonExporter {
    async export(persons, filename) {
        const writer = createObjectCsvWriter({
            path: filename,
            header: [
                { id: "id", title: "id" },
                { id: "firstname", title: "firstname" },
                { id: "lastname", title: "lastname" },
                { id: "gender", title: "gender" },
                { id: "age", title: "age" },
                { id: "education", title: "education" },
                { id: "wealth", title: "wealth" },
                { id: "sport", title: "sport" },
                { id: "reading", title: "reading" },
                { id: "music", title: "music" },
            ],
        });
        const records = persons.map((person) => ({
            id: person.id,
            firstname: person.firstname,
            gender: person.gender,
            age: person.age,
            education: person.education,
            wealth: person.wealth,
            sport: person.sport,
            reading: person.reading,
            music: person.music,
        }));
        await writer.writeRecords(records);
    }
}
