var CRS = require('./cours');

var CruParser = function(sTokenize, sParsedSymb){
	// The list of CRS parsed from the input file.
	this.parsedCru = [];
	this.symb = ["+","P=","H=","S=", "//"];
	this.showTokenize = sTokenize;
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
}

// Parser procedure

// tokenize : tranform the data input into a list
CruParser.prototype.tokenize = function(data){
	var separator = /(\r\n|: )/;
	data = data.split(separator);
	data = data.filter((val, idx) => !val.match(separator)); 					
	return data;
}

// parse : analyze data by calling the first non terminal rule of the grammar
// parseCru : parse CRU format
CruParser.prototype.parse = function(data){
	// Split by lines and filter empty lines and comments
	var lines = data.split(/\r\n|\n/);
	lines = lines.filter(line => line.trim() && !line.match(/^(EDT\.CRU|Vérifier|Comportement|Seance|Page|^$)/));
	
	var currentSection = null;
	var currentSessions = [];
	
	for(var i = 0; i < lines.length; i++){
		var line = lines[i].trim();
		
		// Check if line starts a new section
		if(line.match(/^\+[A-Z0-9]+/)){
			// Save previous section if exists
			if(currentSection){
				this.processCruSection(currentSection, currentSessions);
			}
			currentSection = line.substring(1); // Remove the '+'
			currentSessions = [];
		}else if(line.match(/^\d+,[A-Z]\d+/i)){
			// This is a session line
			currentSessions.push(line);
		}
	}
	
	// Don't forget the last section
	if(currentSection){
		this.processCruSection(currentSection, currentSessions);
	}
}

// processCruSection : process a CRU section with its sessions
CruParser.prototype.processCruSection = function(sectionName, sessions){
	/* 
		Récupère les informations de chaque cours (dans sessions)
		
	*/
	for(var i = 0; i < sessions.length; i++){
		var session = sessions[i];
		var parts = session.split(',').map(function(p){ return p.trim(); });
		// Build token stream expected by the prototype methods
		// tokens: [ index, type, (P=, value), (H=, "V 9:00-12:00"), (F1), (S=, value) ]
		var tokens = [];
		if(parts.length > 0) tokens.push(parts[0]); // index
		if(parts.length > 1) tokens.push(parts[1]); // type
		for(var j = 2; j < parts.length; j++){
			var part = parts[j];
			if(/^P=/.test(part)){
				tokens.push('P=');
				tokens.push(part.substring(2));
			}else if(/^H=/.test(part)){
				tokens.push('H=');
				tokens.push(part.substring(2).trim());
			}else if(/^F\d+/.test(part)){
				// semaine token like F1
				tokens.push(part);
			}else if(/^S=/.test(part)){
				tokens.push('S=');
				// remove trailing // if present
				tokens.push(part.substring(2).replace(/\/\/$/, ''));
			}else{
				// unknown part, push raw
				tokens.push(part);
			}
		}

		// Use the prototype recursive-descent helpers on the token array
		var args = this.body(tokens);
		var crs = new CRS(sectionName, args.index, args.type, args.capacite, args.horaire.substring(2), args.jour, args.heureDeb, args.heureFin, args.semaine, args.salle);
		crs.raw = session;
		crs.section = sectionName;
		this.parsedCru.push(crs);
	}
}

// Parser Operand

CruParser.prototype.errMsg = function(msg, input){
	this.errorCount++;
	console.log("Parsing Error ! on "+input+" -- msg : "+msg);
}

// Read and return a symbol from input
CruParser.prototype.next = function(input){
	var curS = input.shift();
	if(this.showParsedSymbols){
		console.log(curS);
	}
	return curS
}

// accept : verify if the arg s is part of the language symbols.
CruParser.prototype.accept = function(s){
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if(idx === -1){
		this.errMsg("symbol "+s+" unknown", [" "]);
		return false;
	}
	return idx;
}

// check : check whether the arg elt is on the head of the list
CruParser.prototype.check = function(s, input){
	if(this.accept(input[0]) == this.accept(s)){
		return true;	
	}
	return false;
}

// expect : expect the next symbol to be s.
CruParser.prototype.expect = function(s, input){
	if(s == this.next(input)){
		//console.log("Reckognized! "+s)
		return true;
	}else{
		this.errMsg("symbol "+s+" doesn't match", input);
	}
	return false;
}

// Parser rules

// <FichierCRU> = 1*(Cours)
CruParser.prototype.listCru = function(input){
	this.cru(input);
	this.expect('//', input);
}

CruParser.prototype.cru = function(input){

	if(this.check("1", input)){
		this.expect("1", input);
		var args = this.body(input);
		var p = new CRS(args.index, args.type, args.capacite, args.horaire, args.jour, args.heureDeb, args.heureFin, args.semaine, args.salle);
		this.expect("//",input);
		this.parsedCru.push(p);
		if(input.length > 0){
			this.cru(input);
		}
		return true;
	}else{
		return false;
	}

}
// <Creneau> = <Index> "," <Type> "," <Capacite> "," <Horaire> "," <Jour> "," <HeureDeb> "," <HeureFin> "," <Semaine> "," <Salle>
CruParser.prototype.body = function(input){
	var index = this.index(input);
	var type = this.type(input);
	var capacite = this.capacite(input);
	// horaire returns an object { raw, jour, heureDeb, heureFin }
	var horaireObj = this.horaire(input);
	var horaire = horaireObj ? horaireObj.raw : null;
	var jour = horaireObj ? horaireObj.jour : null;
	var heureDeb = horaireObj ? horaireObj.heureDeb : null;
	var heureFin = horaireObj ? horaireObj.heureFin : null;
	var semaine = this.semaine(input);
	var salle = this.salle(input);
	return {index : index, type : type, capacite : capacite, horaire : horaire, jour : jour, heureDeb : heureDeb, heureFin : heureFin, semaine : semaine, salle : salle };
}

// <Index> = 1*DIGIT
CruParser.prototype.index = function(input){
	var idx = this.next(input);
	return idx;
}

// <Type> = ("C", "T", "D") 1*DIGIT
CruParser.prototype.type = function(input){
	var tp = this.next(input);
	return tp;
}

// <Capacite> = "P=" 1*DIGIT
CruParser.prototype.capacite = function(input){
	this.expect("P=", input);
	var cap = this.next(input);
	return cap;
}

// <Horaire> = "H=" Jour WSP HeureDeb "-" HeureFin
CruParser.prototype.horaire = function(input){
	this.expect("H=", input);
	var cur = this.next(input); // e.g. "V 9:00-12:00" or "MA 14:00-16:00"
	if(!cur) return { raw: null, jour: null, heureDeb: null, heureFin: null };
	var hm = cur.match(/^([A-Z]{1,2})\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
	if(hm){
		return { raw: cur, jour: hm[1], heureDeb: hm[2], heureFin: hm[3] };
	}
	return { raw: cur, jour: null, heureDeb: null, heureFin: null };
}

// <Jour> = ("L", "MA", "ME", "J", "V", "S", "D")
CruParser.prototype.jour = function(input){
	var jr = this.next(input);
	return jr;
}

// <HeureDeb> = 2DIGIT ":" 2DIGIT
CruParser.prototype.heureDeb = function(input){
	var hd = this.next(input);
	return hd;
}

// <HeureFin> = 2DIGIT ":" 2DIGIT
CruParser.prototype.heureFin = function(input){
	var hf = this.next(input);
	return hf;
}

// <Semaine> = "F" 1*DIGIT
CruParser.prototype.semaine = function(input){
	// expecting a token like 'F1'
	var cur = input[0];
	if(cur && /^F\d+/.test(cur)){
		this.next(input);
		var fm = cur.match(/^F(\d+)/);
		return fm ? fm[1] : cur;
	}
	return null;
}

// <Salle> = "S=" 1*(ALNUM / "_" / "-")
CruParser.prototype.salle = function(input){
	this.expect("S=", input);
	var sl = this.next(input);
	return sl;
}

module.exports = CruParser;
