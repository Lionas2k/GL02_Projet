const fs = require('fs');
const colors = require('colors');
const CruParser = require('./CruParser.js');
const cours = require('./cours.js');
const cli = require("@caporal/core").default;

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
<<<<<<< HEAD
                var matches = parsed.filter(function (c) {
                    var searcBy = (c.raw || '') + ' ' + (c.section || '') + ' ' + (c.index || '') + ' ' + (c.type || '') + ' ' + (c.capacite || '') + ' ' + (c.horaire || '') + ' ' + (c.jour || '') + ' ' + (c.semaine || '') + ' ' + (c.salle || '');
                    return searcBy.toLowerCase().includes(needle);
=======
                var matches = parsed.filter(function(c){
                    var searchBy = (c.cours || '') + ' ' + (c.raw || '') + ' ' + (c.section || '') + ' ' + (c.index||'') + ' ' + (c.type||'') + ' ' + (c.capacite||'') + ' ' + (c.horaire||'') + ' ' + (c.jour||'') + ' ' + (c.semaine||'') + ' ' + (c.salle||'');
                    return searchBy.toLowerCase().includes(needle);
>>>>>>> 6e3286daa207c92dad519af87b8a75613995e935
                });
                if (matches.length === 0) {
                    logger.info('No matches found for needle: ' + searchNeedle);
                } else {
                    logger.info('Found ' + matches.length + ' matching lines:');
<<<<<<< HEAD
                    var lines = matches.map(function (m) { return m.raw; });
                    logger.info('%s', JSON.stringify(lines, null, 2));
                }
            } else if (searchDay && searchDay != null) {
                console.log("Filtering by day: " + searchDay);
                var dayNeedle = searchDay.toLowerCase();
                var matches = parsed.filter(function (c) {
                    var searcBy = (c.jour || '');
                    return searcBy.toLowerCase().includes(dayNeedle);
                });
                if (matches.length === 0) {
=======
                    var lines = matches.map(function(x){ return {
                        cours: x.cours,
                        index: x.index, 
                        type: x.type, 
                        capacite: x.capacite,
                        horaire: x.horaire,
                        jour: x.jour,
                        semaine: x.semaine,
                        salle: x.salle
                    } });
                    logger.info('%s', JSON.stringify(lines, null, 2));
                }
            } else if(searchDay && searchDay != null){
                console.log("Filtering by day: "+searchDay);
                    var dayNeedle = searchDay.toLowerCase();
                    var matches = parsed.filter(function(c){
                        var searchBy = (c.jour || '');
                        return searchBy.toLowerCase().includes(dayNeedle);
                    });
                if(matches.length === 0){
>>>>>>> 6e3286daa207c92dad519af87b8a75613995e935
                    logger.info('No matches found for day: ' + searchDay);
                } else {
                    logger.info('Found ' + matches.length + ' matching lines for day ' + searchDay + ':');
<<<<<<< HEAD
                    var lines = matches.map(function (m) { return m.raw; });
=======
                    var lines = matches.map(function(x){ return {
                        cours: x.cours, 
                        index: x.index, 
                        type: x.type, 
                        capacite: x.capacite, 
                        horaire: x.horaire, 
                        jour: x.jour, 
                        semaine: x.semaine, 
                        salle: x.salle
                    } });
>>>>>>> 6e3286daa207c92dad519af87b8a75613995e935
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
    // Need the parser to be able to retrieve classes names
    .argument('<name>', 'The name of the class (cf. cours.js)')
    .action(({ args, logger }) => {
        logger.info("The classrooms in which class " + args.name + " is present are the following :");
        // How to make it work?
        // Read all the cru files in all directories
        // Check if parsed courses' names equals the argument specified by the user when calling salleCours
        // If it's the same name, log the classroom associated
        // Prob do it all with loops like ForEach?
        let data_dir = "../SujetA_data";
        // Hypothesis for what's coming next : added cru files are well organised in the following sub-directories, and no class begins with UV WX YZ? can be easily implemented though
        // ie. Classes with names starting with A or B are in the cru files located in the sub-directory "AB", albeit non-obligatory for the code to actually work. In fact we only need cru files to be in the sub-directories.
        // This system can also manage having multiple cru files in the sub-directory, to let users add cru files instead of rewriting existing files
        let alpha_dir = ["AB", "CD", "EF", "GH", "IJ", "KL", "MN", "OP", "QR", "ST"]
        alpha_dir.forEach(function (alpha) {
            let sub_dir = data_dir + alpha_dir;
            fs.readdir(sub_dir, (err, files) => {
                if (err)
                    console.log(err);
                else {
                    //console.log("\nCurrent directory filenames:");
                    files.forEach(file => {
                        //console.log(file);
                        fs.readFile(file, 'utf8', function (err, data) {
                            if (err) {
                                return logger.warn(err);
                            }
                            var analyzer = new CruParser();
                            analyzer.parse(data);
                            let arrayCours = [];
                            analyzer.parsedCru.forEach(Cru => {
                                if (Cru.cours === args.name) {
                                    arrayCours.push(Cru.salle);
                                }
                            })
                            // if arrayCours.length===0, logger error else logger array
                            logger.info(arrayCours);
                            // je sais pas comment le parser marche donc je sais pas comment les cours sont récupérés 
                            // analyzer.parsedCru; ?
                            // if(???===name){
                            // logger.info(salle)
                            //}
                            // Faire la bonne gestion des cas d'erreur relatif au cahier des charges
                        });
                    })
                }
            })

        })

    })

cli.run(process.argv.slice(2));
