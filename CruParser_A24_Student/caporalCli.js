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

    });

cli.run(process.argv.slice(2));
