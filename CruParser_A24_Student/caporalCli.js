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
                    var searchBy = (c.cours || '') + ' ' + (c.raw || '') + ' ' + (c.section || '') + ' ' + (c.index||'') + ' ' + (c.type||'') + ' ' + (c.capacite||'') + ' ' + (c.horaire||'') + ' ' + (c.jour||'') + ' ' + (c.semaine||'') + ' ' + (c.salle||'');
                    return searchBy.toLowerCase().includes(needle);
                });
                if(matches.length === 0){
                    logger.info('No matches found for needle: ' + searchNeedle);
                }else{
                    logger.info('Found ' + matches.length + ' matching lines:');
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
                    logger.info('No matches found for day: ' + searchDay);
                }else{
                    logger.info('Found ' + matches.length + ' matching lines for day ' + searchDay + ':');
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
            } else {
                console.log("No needle provided, showing preview of parsed entries");
                var preview = parsed.slice(0, N).map(function(x){
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


cli.run(process.argv.slice(2));
