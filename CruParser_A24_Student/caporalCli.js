const fs = require('fs');
const colors = require('colors');
const CruParser = require('./CruParser.js');
const cours = require('./cours.js');
const cli = require("@caporal/core").default;
const path = require('path');

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

function generateICalendar(allCourses, requestedCourses, startDate, endDate, outputFile, logger) {
    // Filter courses matching requested course codes
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