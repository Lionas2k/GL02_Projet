describe('Program Syntactic testing of CruParser', () => {
    beforeAll(function() {
        const cours = require('../cours');

		const CruParser = require('../CruParser');
		this.analyzer = new CruParser();
		
		this.pEmptyRating = new cours("LOG210", "01", "Cours", 100, "18:00-20:00", "Lundi", "18:00", "20:00", "1-12", "H-201");
    })

    it("can read an index from a simulated input", function(){
        let input = ['01'];
        expect(this.analyzer.index(input)).toBe("01");
    });

    it("can read a type from a simulated input", function(){
        let input = ['Cours'];
        expect(this.analyzer.type(input)).toBe("Cours");
    });

    it("can read a capacity from a simulated input", function(){
        let input = ['P=', 100];
        expect(this.analyzer.capacite(input)).toBe(100);
    });

    it("can read a time slot from a simulated input", function(){
        let input = ['H=', '18:00-20:00'];
        expect(this.analyzer.horaire(input).raw).toBe("18:00-20:00");
    });

    it("can read a day from a simulated input", function(){
        let input = ['L'];
        expect(this.analyzer.jour(input)).toBe("L");
    });

    it("can read a start time from a simulated input", function(){
        let input = ['18:00'];
        expect(this.analyzer.heureDeb(input)).toBe("18:00");
    });

    it("can read an end time from a simulated input", function(){
        let input = ['20:00'];
        expect(this.analyzer.heureFin(input)).toBe("20:00");
    });

    it("can read weeks from a simulated input", function(){
        let input = ['F1'];
        expect(this.analyzer.semaine(input)).toBe("1");
    });

    it("can read a location from a simulated input", function(){
        let input = ['S=', 'H-201'];
        expect(this.analyzer.salle(input)).toBe("H-201");
    });

});

