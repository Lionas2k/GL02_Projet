const cli = require('../caporalCli');
const CruParser = require('../CruParser');
const fs = require('fs');

describe("CLI tests", () => {

  it("should print valid when parser has no errors", () => {
    spyOn(fs, 'readFile').and.callFake((file, enc, cb) => {
      cb(null, "mock content");
    });

    let parser = new CruParser();
    spyOn(parser, 'parse');
    parser.errorCount = 0;

    // simulate CLI call
    // expect logger.info to have been called with...
  });

});