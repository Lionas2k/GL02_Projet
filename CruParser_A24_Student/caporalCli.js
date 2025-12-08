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

    .command('salleCours', 'Output the classrooms associated to the class associated with <name>')
    .argument('<name>', 'The name of the class')
    // Only one arg, if 0 or 2+ will print an error automatically
    .action(({ args, logger }) => {
        // Path is important here, check if you've got the data at the right place and that you're placed in the CruParser_A24_Student folder. If you're placed in the overall project folder, you should probably change the following string with "CruParser_A24_Student/SujetA_data"
        const data_dir = "SujetA_data";
        let arraySalleCours = [];

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
                        // Checks if the name is the same as what the user has chosen
                        analyzer.parsedCru.forEach(Cru => {
                            // Adds it to array
                            if (Cru.cours === args.name) arraySalleCours.push(Cru.salle);
                        });
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
                                    // Checks if the name is the same as what the user has chosen
                                    analyzer.parsedCru.forEach(Cru => {
                                        // Adds it to array
                                        if (Cru.cours === args.name) arraySalleCours.push(Cru.salle);
                                    });
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
            // A set can't have duplicates (useful math!), but can't be printed as easily as an array, so we need to cast it back as an array
            arraySalleCours = [...new Set(arraySalleCours)];

            if (arraySalleCours.length === 0) {
                logger.error("Aucune correspondance trouvée.");
            } else {
                logger.info("Voici la liste des salles associées au cours " + args.name + ":\n" + arraySalleCours);
            }

        } catch (err) {
            logger.error(`Impossible de lire le dossier ${data_dir} : ${err.message}`);
        }

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
    .command('ical', 'Generate an iCalendar file for specified courses')
    .argument('<start>', 'Start date (YYYY-MM-DD)')
    .argument('<end>', 'End date (YYYY-MM-DD)')
    .argument('<courses...>', 'Course codes (e.g., SY02 MT09)')
    .option('-o, --output <filename>', 'Output filename', { validator: cli.STRING, default: 'calendar.ics' })
    .action(({ args, options, logger }) => {
        const startDate = new Date(args.start);
        const endDate = new Date(args.end);
        const courses = args.courses;
        const outputFile = options.output;

        // Verifie le format de dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return logger.error("Le format de date n'est pas valide. Utilisez ce format : YYYY-MM-DD");
        }

        if (startDate > endDate) {
            return logger.error("La date de début doit être avant la date de fin");
        }

        const rootFolder = 'SujetA_data';
        let allCourses = [];

        // Lis tous les sous-dossiers
        fs.readdir(rootFolder, { withFileTypes: true }, (err, files) => {
            if (err) return logger.error(err);

            let filesToRead = 0;

            files.forEach(dirent => {
                if (dirent.isDirectory()) {
                    const filePath = path.join(rootFolder, dirent.name, 'edt.cru');

                    if (fs.existsSync(filePath)) {
                        filesToRead++;
                        fs.readFile(filePath, 'utf8', (err, data) => {
                            filesToRead--;

                            if (!err) {
                                const parser = new CruParser();
                                parser.parse(data);
                                allCourses = allCourses.concat(parser.parsedCru);
                            }

                            // Après avoir recuperé tous les cours
                            if (filesToRead === 0) {
                                generateICalendar(allCourses, courses, startDate, endDate, outputFile, logger);
                            }
                        });
                    }
                }
            });

            if (filesToRead === 0) {
                return logger.error("No .cru files found");
            }
        });
    })
    .command('checkconflicts', 'Check for scheduling conflicts in CRU files')
    .option('-d, --detailed', 'Show detailed conflict information', { validator: cli.BOOLEAN, default: false })
    .action(({ options, logger }) => {
        const rootFolder = 'SujetA_data';
        let allCourses = [];

        // Lis tous les sous-dossiers
        fs.readdir(rootFolder, { withFileTypes: true }, (err, files) => {
            if (err) return logger.error(err);

            let filesToRead = 0;

            files.forEach(dirent => {
                if (dirent.isDirectory()) {
                    const filePath = path.join(rootFolder, dirent.name, 'edt.cru');

                    if (fs.existsSync(filePath)) {
                        filesToRead++;
                        fs.readFile(filePath, 'utf8', (err, data) => {
                            filesToRead--;

                            if (!err) {
                                const parser = new CruParser();
                                parser.parse(data);
                                allCourses = allCourses.concat(parser.parsedCru);
                            }

                            // Après avoir recuperé tous les cours
                            if (filesToRead === 0) {
                                checkSchedulingConflicts(allCourses, options.detailed, logger);
                            }
                        });
                    }
                }
            });

            if (filesToRead === 0) {
                return logger.error("No .cru files found");
            }
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
    .option('-c, --filtercm', 'Filters only by the CM classes, use only one filter at a time', { validator: cli.BOOLEAN, default: false })
    .option('-d, --filtertd', 'Filters only by the TD classes, use only one filter at a time', { validator: cli.BOOLEAN, default: false })
    .option('-t, --filtertp', 'Filters only by the TP classes, use only one filter at a time', { validator: cli.BOOLEAN, default: false })
    .option('-e, --export', 'Exports the rooms with their associated rates in a .csv file', { validator: cli.BOOLEAN, default: false })
    .action(({ args, options, logger }) => {

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


        // Following function takes in the NUMBER values associated with each concept
        // See examples of calls
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
                            // Check filters

                            if (!options.c && !options.d && !options.t) {

                                if (classEndToReference >= hoursFirstDayToReference && classStartToReference <= hoursLastDayToReference) {
                                    // Appends classes in the array of selected classes
                                    arrayCours.push(Cru);
                                }
                            }
                            if (options.c) {
                                if (classEndToReference >= hoursFirstDayToReference && classStartToReference <= hoursLastDayToReference && Cru.type[0] === "C") {
                                    // Appends classes in the array of selected classes
                                    arrayCours.push(Cru);
                                }
                            }
                            if (options.t) {
                                if (classEndToReference >= hoursFirstDayToReference && classStartToReference <= hoursLastDayToReference && Cru.type[0] === "T") {
                                    // Appends classes in the array of selected classes
                                    arrayCours.push(Cru);
                                }
                            }
                            if (options.d) {
                                if (classEndToReference >= hoursFirstDayToReference && classStartToReference <= hoursLastDayToReference && Cru.type[0] === "D") {
                                    // Appends classes in the array of selected classes
                                    arrayCours.push(Cru);
                                }
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
                                        // Check filters

                                        if (!options.c && !options.d && !options.t) {

                                            if (classEndToReference >= hoursFirstDayToReference && classStartToReference <= hoursLastDayToReference) {
                                                // Appends classes in the array of selected classes
                                                arrayCours.push(Cru);
                                            }
                                        }
                                        if (options.c) {
                                            if (classEndToReference >= hoursFirstDayToReference && classStartToReference <= hoursLastDayToReference && Cru.type[0] === "C") {
                                                // Appends classes in the array of selected classes
                                                arrayCours.push(Cru);
                                            }
                                        }
                                        if (options.t) {
                                            if (classEndToReference >= hoursFirstDayToReference && classStartToReference <= hoursLastDayToReference && Cru.type[0] === "T") {
                                                // Appends classes in the array of selected classes
                                                arrayCours.push(Cru);
                                            }
                                        }
                                        if (options.d) {
                                            if (classEndToReference >= hoursFirstDayToReference && classStartToReference <= hoursLastDayToReference && Cru.type[0] === "D") {
                                                // Appends classes in the array of selected classes
                                                arrayCours.push(Cru);
                                            }
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
        if (options.e) {
            let csvExport = "Salle,Taux\n";
            Object.entries(json_tauxSalles).forEach(row => {
                csvExport = csvExport + row[0] + ',' + row[1] + "\n";
            })
            fs.writeFile('rates.csv', csvExport, 'utf-8', err => {
                if (err) {
                    logger.error("Erreur d'écriture: " + err);
                } else {
                    logger.info(`Fichier csv disponible: ${outputFile}`);
                }
            });
        }
        //Vegalite part

        async function printGraph() {

            // Imports of Vega here, need async function because of conflicts with other imports
            const vega = await import("vega");
            const vegaLite = await import("vega-lite");
            // Transforms our json to a proper format for vega
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
            // Creates the image containing the graph
            const svg = await view.toSVG();
            fs.writeFileSync("graph.svg", svg);
            logger.info("Fichier généré dans le dossier, veuillez le consulter.");
        }

        printGraph();

    })


function checkSchedulingConflicts(allCourses, detailed, logger) {
    const conflicts = [];

    const roomSchedule = {};

    allCourses.forEach(course => {
        if (!course.salle || !course.jour || !course.heureDeb || !course.heureFin) return;

        const key = `${course.salle}-${course.jour}`;

        if (!roomSchedule[key]) {
            roomSchedule[key] = [];
        }

        roomSchedule[key].push({
            cours: course.cours,
            index: course.index,
            type: course.type,
            salle: course.salle,
            jour: course.jour,
            heureDeb: course.heureDeb,
            heureFin: course.heureFin,
            semaine: course.semaine,
            raw: course.raw
        });
    });

    const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // vérifie si il y a un conflit entre 2 cours
    Object.keys(roomSchedule).forEach(key => {
        const courses = roomSchedule[key];
        const [room, day] = key.split('-');


        for (let i = 0; i < courses.length; i++) {
            for (let j = i + 1; j < courses.length; j++) {
                const c1 = courses[i];
                const c2 = courses[j];

                const semaine1 = c1.semaine;
                const semaine2 = c2.semaine;

                if (semaine1 && semaine2 && semaine1 !== semaine2) {
                    continue;
                }

                const start1 = timeToMinutes(c1.heureDeb);
                const end1 = timeToMinutes(c1.heureFin);
                const start2 = timeToMinutes(c2.heureDeb);
                const end2 = timeToMinutes(c2.heureFin);

                if (start1 < end2 && start2 < end1) {
                    conflicts.push({
                        room: room,
                        day: day,
                        course1: {
                            name: c1.cours,
                            index: c1.index,
                            type: c1.type,
                            horaire: `${c1.heureDeb} - ${c1.heureFin}`,
                            semaine: c1.semaine
                        },
                        course2: {
                            name: c2.cours,
                            index: c2.index,
                            type: c2.type,
                            horaire: `${c2.heureDeb} - ${c2.heureFin}`,
                            semaine: c2.semaine
                        }
                    });
                }
            }
        }
    });

    if (conflicts.length === 0) {
        logger.info("✓ Aucun conflit détecté ! Tous les créneaux sont cohérents.".green);
    } else {
        logger.info(`✗ ${conflicts.length} conflit(s) détecté(s) :`.red);
        logger.info('');

        const dayNames = {
            'L': 'Lundi',
            'MA': 'Mardi',
            'ME': 'Mercredi',
            'J': 'Jeudi',
            'V': 'Vendredi',
            'S': 'Samedi',
            'D': 'Dimanche'
        };

        conflicts.forEach((conflict, index) => {
            logger.info(`Conflit #${index + 1}:`.yellow);
            logger.info(`  Salle: ${conflict.room}`);
            logger.info(`  Jour: ${dayNames[conflict.day] || conflict.day}`);
            logger.info(`  Cours 1: ${conflict.course1.name} ${conflict.course1.type} (${conflict.course1.horaire})${conflict.course1.semaine ? ' - Semaine ' + conflict.course1.semaine : ''}`);
            logger.info(`  Cours 2: ${conflict.course2.name} ${conflict.course2.type} (${conflict.course2.horaire})${conflict.course2.semaine ? ' - Semaine ' + conflict.course2.semaine : ''}`);

            if (detailed) {
                logger.info(`  Index cours 1: ${conflict.course1.index}`);
                logger.info(`  Index cours 2: ${conflict.course2.index}`);
            }

            logger.info('');
        });

        const conflictsByRoom = {};
        conflicts.forEach(c => {
            conflictsByRoom[c.room] = (conflictsByRoom[c.room] || 0) + 1;
        });

        logger.info('Résumé par salle:'.cyan);
        Object.keys(conflictsByRoom).sort().forEach(room => {
            logger.info(`  ${room}: ${conflictsByRoom[room]} conflit(s)`);
        });
    }
}

function generateICalendar(allCourses, requestedCourses, startDate, endDate, outputFile, logger) {
    const filteredCourses = allCourses.filter(c =>
        requestedCourses.some(rc => c.cours === rc || c.section === rc)
    );

    if (filteredCourses.length === 0) {
        return logger.error("Aucun cours correspondant : " + requestedCourses.join(', '));
    }

    const dayMap = {
        'L': 1,   // Lundi
        'MA': 2,  // Mardi
        'ME': 3,  // Mercredi
        'J': 4,   // Jeudi
        'V': 5,   // Vendredi
        'S': 6,   // Samedi
        'D': 0    // Dimanche
    };

    // Genère la base du fichier Icalendar
    let icalContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CRU Parser//Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ];

    // Ajoute les evenements pour chaque cours
    filteredCourses.forEach(course => {
        if (!course.jour || !course.heureDeb || !course.heureFin) return;

        const targetDay = dayMap[course.jour];
        if (targetDay === undefined) return;

        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            if (currentDate.getDay() === targetDay) {
                const [startHour, startMin] = course.heureDeb.split(':').map(Number);
                const [endHour, endMin] = course.heureFin.split(':').map(Number);

                const eventStart = new Date(currentDate);
                eventStart.setHours(startHour, startMin, 0);

                const eventEnd = new Date(currentDate);
                eventEnd.setHours(endHour, endMin, 0);

                // formate les dates pour le ical (YYYYMMDDTHHMMSS)
                const formatDate = (date) => {
                    return date.getFullYear() +
                        String(date.getMonth() + 1).padStart(2, '0') +
                        String(date.getDate()).padStart(2, '0') +
                        'T' +
                        String(date.getHours()).padStart(2, '0') +
                        String(date.getMinutes()).padStart(2, '0') +
                        String(date.getSeconds()).padStart(2, '0');
                };

                // creer les evenements
                const uid = `${course.cours}-${course.index}-${formatDate(eventStart)}@cruparser`;
                const summary = `${course.cours} - ${course.type}`;
                const description = `Cours: ${course.cours}\\nType: ${course.type}\\nCapacité: ${course.capacite}\\nHoraire: ${course.heureDeb.replace(':', 'h')} - ${course.heureFin.replace(':', 'h')}\\nSemaine: ${course.semaine || 'N/A'}`;
                const location = course.salle || 'Non spécifié';

                icalContent.push('BEGIN:VEVENT');
                icalContent.push(`UID:${uid}`);
                icalContent.push(`DTSTAMP:${formatDate(new Date())}`);
                icalContent.push(`DTSTART:${formatDate(eventStart)}`);
                icalContent.push(`DTEND:${formatDate(eventEnd)}`);
                icalContent.push(`SUMMARY:${summary}`);
                icalContent.push(`DESCRIPTION:${description}`);
                icalContent.push(`LOCATION:${location}`);
                icalContent.push('STATUS:CONFIRMED');
                icalContent.push('END:VEVENT');
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });

    icalContent.push('END:VCALENDAR');

    // remplie le fichier
    fs.writeFile(outputFile, icalContent.join('\r\n'), 'utf8', (err) => {
        if (err) {
            return logger.error("Error writing file: " + err);
        }
        logger.info(`iCalendar file generated successfully: ${outputFile}`.green);
        logger.info(`Generated ${filteredCourses.length} course entries for ${requestedCourses.join(', ')}`);
    });


}


cli.run(process.argv.slice(2));