const crs = require('../cours')
describe('CruParser A24 Student Semantic Tests', () => {
    beforeAll(function() {
        this.p = new crs('LOG210', '01', 'Cours', 100, '18:00-20:00', 'Lundi', '18:00', '20:00', '1-12', 'H-201');
    })

    it("can create a new crs", function(){
		expect(this.p).toBeDefined();
		// toBe is === on simple values
		expect(this.p.cours).toBe("LOG210");
        expect(this.p.index).toBe("01");
        expect(this.p.type).toBe("Cours");
        expect(this.p.capacite).toBe(100);
        expect(this.p.horaire).toBe("18:00-20:00");
        expect(this.p.jour).toBe("Lundi");
        expect(this.p.heureDeb).toBe("18:00");
        expect(this.p.heureFin).toBe("20:00");
        expect(this.p.semaine).toBe("1-12");
        expect(this.p.salle).toBe("H-201");
		expect(this.p).toEqual(jasmine.objectContaining({cours: "LOG210"}));
        expect(this.p).toEqual(jasmine.objectContaining({index: "01"}));
        expect(this.p).toEqual(jasmine.objectContaining({type: "Cours"}));
        expect(this.p).toEqual(jasmine.objectContaining({capacite: 100}));
        expect(this.p).toEqual(jasmine.objectContaining({horaire: "18:00-20:00"}));
        expect(this.p).toEqual(jasmine.objectContaining({jour: "Lundi"}));
        expect(this.p).toEqual(jasmine.objectContaining({heureDeb: "18:00"}));
        expect(this.p).toEqual(jasmine.objectContaining({heureFin: "20:00"}));
        expect(this.p).toEqual(jasmine.objectContaining({semaine: "1-12"}));
        expect(this.p).toEqual(jasmine.objectContaining({salle: "H-201"}));
		
	});
});