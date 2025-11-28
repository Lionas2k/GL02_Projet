const fs = require('fs');
const colors = require('colors');
const CruParser = require('./CruParser.js');
const cli = require("@caporal/core").default;

cli
    .version('cru-parser-cli')
    .version('0.1')
    
    .command('check', 'Check if <file> is a valid Cru file')
    .argument('<file>', 'The file to check with Cru parser')
    .option('-s, --showSymbols', 'log the analyzed symbol at each step', { validator : cli.BOOLEAN, default: false })
    .option('-t, --showTokenize', 'log thenode  tokenization results', { validator: cli.BOOLEAN, default: false })
    .action(({args, options, logger}) => {

        fs.readFile(args.file, 'utf8', function (err,data) {
            if (err) {
                return logger.warn(err);
            }

            var analyzer = new CruParser(options.showTokenize, options.showSymbols);
            analyzer.parse(data);

            if(analyzer.errorCount === 0){
                logger.info("The .cru file is a valid cru file".green);
                // Check how many entries were parsed
                var parsed = analyzer.parsedCru || [];
                logger.info('Parsed entries: ' + parsed.length);
            }else{
                logger.info("The .cru file contains error".red);
            }

            logger.debug(analyzer.parsedCru);

        });

    })

    .command('search', 'search for entries in a CRU file')
    .argument('<file>', 'The CRU file to test')
    .option('-n, --needle <needle>', 'Search a needle in parsed lines', {validator : cli.STRING})
    .option('-d, --day <day>', 'Filter by day (L, MA, ME, J, V)', {validator : cli.STRING})
    .action(({args, options, logger}) => {
        fs.readFile(args.file, 'utf8', function (err,data) {
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
            if(searchNeedle && searchNeedle != null){
                console.log("Searching for needle: "+searchNeedle);
                var needle = searchNeedle.toLowerCase();
                var matches = parsed.filter(function(c){
                    var searcBy = (c.raw || '') + ' ' + (c.section || '') + ' ' + (c.index||'') + ' ' + (c.type||'') + ' ' + (c.capacite||'') + ' ' + (c.horaire||'') + ' ' + (c.jour||'') + ' ' + (c.semaine||'') + ' ' + (c.salle||'');
                    return searcBy.toLowerCase().includes(needle);
                });
                if(matches.length === 0){
                    logger.info('No matches found for needle: ' + searchNeedle);
                }else{
                    logger.info('Found ' + matches.length + ' matching lines:');
                    var lines = matches.map(function(m){ return m.raw; });
                    logger.info('%s', JSON.stringify(lines, null, 2));
                }
            } else if(searchDay && searchDay != null){
                console.log("Filtering by day: "+searchDay);
                    var dayNeedle = searchDay.toLowerCase();
                    var matches = parsed.filter(function(c){
                        var searcBy = (c.jour || '');
                        return searcBy.toLowerCase().includes(dayNeedle);
                    });
                if(matches.length === 0){
                    logger.info('No matches found for day: ' + searchDay);
                }else{
                    logger.info('Found ' + matches.length + ' matching lines for day ' + searchDay + ':');
                    var lines = matches.map(function(m){ return m.raw; });
                    logger.info('%s', JSON.stringify(lines, null, 2));
                }
            } else {
                console.log("No needle provided, showing preview of parsed entries");
                var preview = parsed.slice(0, N).map(function(x){
                    return {
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
    });

cli.run(process.argv.slice(2));
