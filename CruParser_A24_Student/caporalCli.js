const fs = require('fs');
const colors = require('colors');
const CruParser = require('./CruParser.js');
const cours = require('./cours.js');
const cli = require("@caporal/core").default;
const path = require('path');


cli
    .version('cru-parser-cli')
    .version('0.1')

    .command('check', 'Check if <file> is a valid Cru file')
    .argument('<file>', 'The file to check with Cru parser')
    .option('-s, --showSymbols', 'log the analyzed symbol at each step', { validator: cli.BOOLEAN, default: false })
    .option('-t, --showTokenize', 'log thenode  tokenization results', { validator: cli.BOOLEAN, default: false })
    .action(({ args, options, logger }) => {

        fs.readFile(args.file, 'utf8', function (err, data) {
            if (err) {
                return logger.warn(err);
            }

            var analyzer = new CruParser(options.showTokenize, options.showSymbols);
            analyzer.parse(data);

            if (analyzer.errorCount === 0) {
                logger.info("The .cru file is a valid cru file".green);
                // Check how many entries were parsed
                var parsed = analyzer.parsedCru || [];
                logger.info('Parsed entries: ' + parsed.length);
            } else {
                logger.info("The .cru file contains error".red);
            }

            logger.debug(analyzer.parsedCru);

        });

    })

    .command('search', 'search for entries in a CRU file')
    .argument('<file>', 'The CRU file to test')
    .option('-n, --needle <needle>', 'Search a needle in parsed lines', { validator: cli.STRING })
    .option('-d, --day <day>', 'Filter by day (L, MA, ME, J, V)', { validator: cli.STRING })
    .action(({ args, options, logger }) => {
        fs.readFile(args.file, 'utf8', function (err, data) {
            if (err) {
                return logger.warn(err);
            }

            // If a needle is provided, filter by it and print matching raw lines, whatever the needle is.
            const searchNeedle = options.needle || null;
            // If a date is provided, filter by it.
            const searchDay = options.day || null;

            var analyzer = new CruParser();
            analyzer.parse(data);
            var parsed = analyzer.parsedCru || [];



            var N = Math.min(10, parsed.length);
            // If a needle is provided, filter by it and print matching raw lines
            if (searchNeedle && searchNeedle != null) {
                console.log("Searching for needle: " + searchNeedle);
                var needle = searchNeedle.toLowerCase();
                var matches = parsed.filter(function (c) {
                    var searchBy = (c.cours || '') + ' ' + (c.raw || '') + ' ' + (c.section || '') + ' ' + (c.index || '') + ' ' + (c.type || '') + ' ' + (c.capacite || '') + ' ' + (c.horaire || '') + ' ' + (c.jour || '') + ' ' + (c.semaine || '') + ' ' + (c.salle || '');
                    return searchBy.toLowerCase().includes(needle);
                });
                if (matches.length === 0) {
                    logger.info('No matches found for needle: ' + searchNeedle);
                } else {
                    logger.info('Found ' + matches.length + ' matching lines:');
                    var lines = matches.map(function (x) {
                        return {
                            cours: x.cours,
                            index: x.index,
                            type: x.type,
                            capacite: x.capacite,
                            horaire: x.horaire,
                            jour: x.jour,
                            semaine: x.semaine,
                            salle: x.salle
                        }
                    });
                    logger.info('%s', JSON.stringify(lines, null, 2));
                }
            } else if (searchDay && searchDay != null) {
                console.log("Filtering by day: " + searchDay);
                var dayNeedle = searchDay.toLowerCase();
                var matches = parsed.filter(function (c) {
                    var searchBy = (c.jour || '');
                    return searchBy.toLowerCase().includes(dayNeedle);
                });
                if (matches.length === 0) {
                    logger.info('No matches found for day: ' + searchDay);
                } else {
                    logger.info('Found ' + matches.length + ' matching lines for day ' + searchDay + ':');
                    var lines = matches.map(function (x) {
                        return {
                            cours: x.cours,
                            index: x.index,
                            type: x.type,
                            capacite: x.capacite,
                            horaire: x.horaire,
                            jour: x.jour,
                            semaine: x.semaine,
                            salle: x.salle
                        }
                    });
                    logger.info('%s', JSON.stringify(lines, null, 2));
                }
            } else {
                console.log("No needle provided, showing preview of parsed entries");
                var preview = parsed.slice(0, N).map(function (x) {
                    return {
                        cours: x.cours,
                        index: x.index,
                        type: x.type,
                        capacite: x.capacite,
                        horaire: x.horaire,
                        jour: x.jour,
                        semaine: x.semaine,
                        salle: x.salle
                    };
                });
                logger.info('Preview (first ' + N + '):');
                logger.info('%s', JSON.stringify(preview, null, 2));
            }
        });
    })
    .command('maxcap', 'Check the maximum capacity of a room')
    .argument('<room>', 'Room identifier')
    .action(({ args, logger }) => {
        const roomId = args.room;

        // Check if identifier is empty
        if (!roomId || roomId.trim() === '') {
            return logger.error("The room identifier cannot be empty.");
        }

        const rootFolder = 'SujetA_data';
        let allCourses = [];

        // Read all subfolders
        fs.readdir(rootFolder, { withFileTypes: true }, (err, files) => {
            if (err) return logger.error(err);

            files.forEach(dirent => {
                if (dirent.isDirectory()) {
                    const filePath = path.join(rootFolder, dirent.name, 'edt.cru');

                    if (fs.existsSync(filePath)) {
                        const data = fs.readFileSync(filePath, 'utf8');
                        const parser = new CruParser();
                        parser.parse(data);

                        allCourses = allCourses.concat(parser.parsedCru);
                    }
                }
            });

            // Filter the courses of the requested room
            const roomCourses = allCourses.filter(c => c.salle === roomId);

            if (roomCourses.length === 0) {
                return logger.error("This room does not exist.");
            }

            // Get the maximum capacity
            const maxCap = Math.max(...roomCourses.map(c => parseInt(c.capacite, 10)));
            logger.info(`Maximum capacity of room ${roomId}: ${maxCap}`);
        });
    })

    .command('freeroom', 'Check available time slots for a room')
    .argument('<room>', 'Room identifier')
    .action(({ args, logger }) => {
        const roomId = args.room;

        // Check if identifier is empty
        if (!roomId || roomId.trim() === '') {
            return logger.error("The room identifier cannot be empty.");
        }

        const fs = require('fs');
        const path = require('path');
        const CruParser = require('./CruParser.js');

        const rootFolder = path.join(__dirname, "SujetA_data");

        fs.readdir(rootFolder, { withFileTypes: true }, (err, entries) => {
            if (err) return logger.error("Cannot read SujetA_data: " + err);

            const allCourses = [];
            let filesToRead = 0;

            // Read all subfolders
            entries.forEach(dirent => {
                if (dirent.isDirectory()) {
                    const filePath = path.join(rootFolder, dirent.name, "edt.cru");
                    filesToRead++;

                    fs.readFile(filePath, 'utf8', (err, data) => {
                        filesToRead--;

                        if (!err) {
                            const parser = new CruParser();
                            parser.parse(data);
                            allCourses.push(...(parser.parsedCru || []));
                        }

                        // When all files are processed
                        if (filesToRead === 0) {

                            // Filter courses for the requested room
                            const roomCourses = allCourses.filter(c => c.salle === roomId);

                            if (roomCourses.length === 0) {
                                return logger.error("This room does not exist.");
                            }

                            // Occupied time slots by day
                            const days = ["L", "MA", "ME", "J", "V"];
                            const hours = Array.from({ length: 12 }, (_, i) => 8 + i); // 8h → 19h

                            // Prepare structure: for each day, list all free hours
                            const freeSlots = {};
                            days.forEach(d => freeSlots[d] = [...hours]);

                            // Remove occupied hours
                            roomCourses.forEach(c => {
                                const day = c.jour;
                                if (!days.includes(day)) return;

                                const [start, end] = c.horaire.split('-').map(h => parseInt(h, 10));

                                for (let h = start; h < end; h++) {
                                    const index = freeSlots[day].indexOf(h);
                                    if (index !== -1) freeSlots[day].splice(index, 1);
                                }
                            });

                            // Final output
                            logger.info(`Available time slots for room ${roomId}:`);
                            logger.info(JSON.stringify(freeSlots, null, 2));
                        }
                    });
                }
            });
        });

    })

    .command('tauxSalles', 'Gives a graphical representation of classroom occupation rate in a time frame')
    // The specifications declare input as 'BeginningDate' and 'EndingDate', and since our data are .cru files, the following arguments are the ones described by the ABNF of the aforementioned files
    .argument('<firstDay>', 'Starting day of the time period : "L", "MA", "ME", "J", "V"')
    .argument('<firstHour>', 'Starting hour of the time period, from 8:00 to 19:00 : examples -> 8:00, 10:30')
    .argument('<firstWeek>', 'Starting week of the time period : "F0" to "F9"')
    .argument('<lastDay>', 'Ending day of the time period : "L", "MA", "ME", "J", "V"')
    .argument('<lastHour>', 'Ending hour of the time period, from 9:00 to 20:00 : examples -> 9:30, 20:00')
    .argument('<lastWeek>', 'Ending week of the time period : "F0" to "F9"')
    .action(({ args, logger }) => {

        const arrDays = ["L", "MA", "ME", "J", "V"];
        // Checks if days are properly written, else informs the user of an error
        if ((!arrDays.includes(args.firstDay)) || (!arrDays.includes(args.lastDay))) {
            logger.error("Période invalide (Jours)");
        }
        // Checks if hours are properly written, else informs the user of an error
        const ruleHours = /^((0?8|0?9|1\d):[0-5]\d|20:00)$/;
        if ((!ruleHours.test(args.firstHour)) || (!ruleHours.test(args.lastHour))) {
            logger.error("Période invalide (Heures)");
        }
        // Checks if weeks are properly written, else informs the user of an error
        // The specifications of .cru files indicate weeks having only 1DIGIT, thus not going through the whole year?
        const ruleWeeks = /^F\d$/;
        if ((!ruleWeeks.test(args.firstWeek)) || (!ruleWeeks.test(args.lastWeek))) {
            logger.error("Période invalide (Semaine)");
        }

        // Very useful to compare dates by using total time passed from F0 8:00
        // Need of parseInt, since values are considered as strings initially
        // Remember that a school day is from 8:00 to 20:00, hence 12 hours per day max, for 5 days

        // Example of call: convertHoursToReference(parseInt(args.lastWeek.substring(1)), arrDays.indexOf(args.lastDay), parseInt(args.lastHour.split(":")[0]), parseInt(args.lastHour.split(":")[1]))
        // Following function takes in the NUMBER values associated with each concept
        // VERY IMPORTANT, CruParser gives cours.semaine as numbers directly
        // could be done better sorry
        function convertHoursToReference(week, day, hours, minutes) {
            return week * 5 * 12 + day * 12 + hours + minutes / 60;
        }

        // Calculation of the total hours in the timeframe
        const hoursLastDayToReference = convertHoursToReference(parseInt(args.lastWeek.substring(1)), arrDays.indexOf(args.lastDay), parseInt(args.lastHour.split(":")[0]), parseInt(args.lastHour.split(":")[1]));
        const hoursFirstDayToReference = convertHoursToReference(parseInt(args.firstWeek.substring(1)), arrDays.indexOf(args.firstDay), parseInt(args.firstHour.split(":")[0]), parseInt(args.firstHour.split(":")[1]));

        const hoursTotal = hoursLastDayToReference - hoursFirstDayToReference;
        // Checks if time period is logical, relative to the starting and ending input
        if (hoursTotal <= 0) {
            logger.error("Période invalide (Date de début>=Date de fin)")
        }

        // Path is important here, check if you've got the data at the right place and that you're placed in the CruParser_A24_Student folder. If you're placed in the overall project folder, you should probably change the following string with "CruParser_A24_Student/SujetA_data"
        const data_dir = "SujetA_data";
        let arrayCours = [];

        try {
            // Reads the data directory
            const elements = fs.readdirSync(data_dir, { withFileTypes: true });

            elements.forEach(element => {
                // If it's a file, will just read the file
                if (element.isFile()) {
                    const filepath = path.join(data_dir, element.name);
                    try {
                        const data = fs.readFileSync(filepath, 'utf8');
                        // Parses the sub file
                        const analyzer = new CruParser();
                        analyzer.parse(data);
                        // Filters the classes happening outside the timeframe
                        analyzer.parsedCru.forEach(Cru => {
                            const classStartToReference = convertHoursToReference(parseInt(Cru.semaine), arrDays.indexOf(Cru.jour), parseInt(Cru.heureDeb.split(":")[0]), parseInt(Cru.heureDeb.split(":")[1]));

                            const classEndToReference = convertHoursToReference(parseInt(Cru.semaine), arrDays.indexOf(Cru.jour), parseInt(Cru.heureFin.split(":")[0]), parseInt(Cru.heureFin.split(":")[1]));

                            if (classEndToReference >= hoursFirstDayToReference && classStartToReference <= hoursLastDayToReference) {
                                // Appends classes in the array of selected classes
                                arrayCours.push(Cru);
                            }
                        })

                    } catch (err) {
                        logger.warn(`Impossible de lire ${filepath} : ${err.message}`);
                    }
                }
                // If encounters a sub directory, will read the files inside them
                else if (element.isDirectory()) {
                    const sub_dir = path.join(data_dir, element.name);
                    try {
                        const sub_files = fs.readdirSync(sub_dir, { withFileTypes: true });
                        // Reads the files in the sub folder
                        sub_files.forEach(file => {
                            if (file.isFile()) {
                                const filepath = path.join(sub_dir, file.name);
                                try {
                                    const data = fs.readFileSync(filepath, 'utf8');
                                    // Parses the sub file
                                    const analyzer = new CruParser();
                                    analyzer.parse(data);
                                    // Filters the classes happening outside the timeframe

                                    analyzer.parsedCru.forEach(Cru => {
                                        const classStartToReference = convertHoursToReference(parseInt(Cru.semaine), arrDays.indexOf(Cru.jour), parseInt(Cru.heureDeb.split(":")[0]), parseInt(Cru.heureDeb.split(":")[1]));

                                        const classEndToReference = convertHoursToReference(parseInt(Cru.semaine), arrDays.indexOf(Cru.jour), parseInt(Cru.heureFin.split(":")[0]), parseInt(Cru.heureFin.split(":")[1]));

                                        if (classEndToReference >= hoursFirstDayToReference && classStartToReference <= hoursLastDayToReference) {
                                            // Appends classes in the array of selected classes
                                            arrayCours.push(Cru);
                                        }
                                    })

                                } catch (err) {
                                    logger.warn(`Impossible de lire ${filepath} : ${err.message}`);
                                }
                            }
                        });
                    } catch (err) {
                        logger.warn(`Impossible de lire le sous-dossier ${sub_dir} : ${err.message}`);
                    }
                }
            });

        } catch (err) {
            logger.error(`Impossible de lire le dossier ${data_dir} : ${err.message}`);
        }
        // Groups cours objects by classroom
        let arrayGroupBySalle = [];

        arrayCours.forEach(cours => {
            // Looks for matching group
            let group = arrayGroupBySalle.find(g => g[0].salle === cours.salle);

            if (group) {
                group.push(cours); // If exists, push into group
            } else {
                arrayGroupBySalle.push([cours]); // Else, create a new group with the class
            }
        });

        // Calculates duration of classroom being used in hours and compares it to total hours possible within the time period
        // Hypothesis of classes not overlapping very important here
        let json_tauxSalles = {};
        arrayGroupBySalle.forEach(group => {
            let hoursUsed = 0;
            group.forEach(cours => {
                // Convert all in minutes, then back in hours
                const hourClassStart = convertHoursToReference(parseInt(cours.semaine), arrDays.indexOf(cours.jour), parseInt(cours.heureDeb.split(":")[0]), parseInt(cours.heureDeb.split(":")[1]));
                const hourClassEnd = convertHoursToReference(parseInt(cours.semaine), arrDays.indexOf(cours.jour), parseInt(cours.heureFin.split(":")[0]), parseInt(cours.heureFin.split(":")[1]));
                const classDuration = hourClassEnd - hourClassStart;
                hoursUsed += classDuration;
            })
            // The most important value that we want to express
            let rate = hoursUsed / hoursTotal;
            // Conversion to whole percentage
            rate = Math.floor(rate * 100);
            // Extract it into json, ie. associating room with rate
            const salleName = group[0].salle;
            json_tauxSalles[salleName] = rate;
        })


        //Vegalite part
        //json_tauxSalles = JSON.stringify(json_tauxSalles, null, 2);

        async function printGraph() {

            // Import dynamique → compatible CJS
            const vega = await import("vega");
            const vegaLite = await import("vega-lite");

            const data = Object.entries(json_tauxSalles).map(([Salle, Rate]) => ({ Salle, Rate }));
            const vlSpec = {
                $schema: "https://vega.github.io/schema/vega-lite/v5.json",
                data: { values: data },
                mark: "bar",
                encoding: {
                    y: { field: "Salle", type: "nominal" },
                    x: { field: "Rate", type: "quantitative" }
                }
            };

            const vegaSpec = vegaLite.compile(vlSpec).spec;

            const view = new vega.View(vega.parse(vegaSpec), { renderer: "svg" });

            const svg = await view.toSVG();
            fs.writeFileSync("chart.svg", svg);
            console.log("✔ chart.svg généré !");
        }

        printGraph();
        
    })


cli.run(process.argv.slice(2));
