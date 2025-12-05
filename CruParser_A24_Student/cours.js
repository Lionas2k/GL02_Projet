var cours = function(cours, index, type, capacite, horaire, jour, heureDeb, heureFin, semaine, salle){
    this.cours = cours;
	this.index = index;
	this.type = type;
	this.capacite = capacite;
	this.horaire = horaire;
    this.jour = jour;
    this.heureDeb = heureDeb;
    this.heureFin = heureFin;
    this.semaine = semaine;
    this.salle = salle;
}

module.exports = cours;
