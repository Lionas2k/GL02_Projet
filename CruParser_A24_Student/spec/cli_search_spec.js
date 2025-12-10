const fs = require('fs');
const caporalCli = require('../caporalCli');
const CruParser = require('../CruParser');

describe("CLI search command", () => {

    let loggerMock;

    beforeEach(() => {
        loggerMock = {
            info: jasmine.createSpy('info'),
            warn: jasmine.createSpy('warn'),
            debug: jasmine.createSpy('debug')
        };

        spyOn(CruParser.prototype, 'parse').and.callFake(function(data) {
            this.parsedCours = [
                {
                    cours: "Introduction à l'Informatique",
                    index: "INF101",
                    type: "Théorie",
                    capacite: 60,
                    horaire: "Automne 2025",
                    jour: "Lundi",
                    heureDeb: "09:00",
                    heureFin: "11:00",
                    semaine: "A",
                    salle: "C-301"
                },
                {
                    cours: "Algorithmes et Structures de Données",
                    index: "INF210",
                    type: "Laboratoire",
                    capacite: 30,
                    horaire: "Automne 2025",
                    jour: "Mercredi",
                    heureDeb: "13:30",
                    heureFin: "16:30",
                    semaine: "B",
                    salle: "A-405"
                },
                {
                    cours: "Réseaux Informatiques",
                    index: "INF330",
                    type: "Théorie",
                    capacite: 55,
                    horaire: "Hiver 2026",
                    jour: "Mardi",
                    heureDeb: "14:00",
                    heureFin: "17:00",
                    semaine: "A et B",
                    salle: "B-112"
                }
            ];
            this.errorCount = 0;
        });

        spyOn(fs, 'readFile').and.callFake((file, enc, cb) => {
            cb(null, "mock crs file content");
        });
    });

    // ---------------------------------------------------------
    // 1) Test: search finds matching CRSs
    // ---------------------------------------------------------
    it("should return CRSs whose name contains the search needle", async () => {
        
        const searchCommand = caporalCli.commands.find(cmd => cmd.name === 'search');

        await searchCommand.action({
            args: { file: "mock.crs", needle: "informatique" },
            options: {},
            logger: loggerMock
        });

        const printed = loggerMock.info.calls.mostRecent().args[1];
        const json = JSON.parse(printed);
        expect(json.length).toBe(2);
        expect(json[0].cours.cours).toBe("Introduction à l'Informatique");
        expect(json[1].cours.cours).toBe("Réseaux Informatiques");
    });

    // ---------------------------------------------------------
    // 2) Test: search returns empty list when no match exists
    // ---------------------------------------------------------
    it("should return empty array when no POI matches", async () => {

        await caporalCli.commands.search.action({
            args: { file: "mock.crs", needle: "NothingHere" },
            options: {},
            logger: loggerMock
        });

        const printed = loggerMock.info.calls.mostRecent().args[1];
        const json = JSON.parse(printed);

        expect(json.length).toBe(0);
    });

});