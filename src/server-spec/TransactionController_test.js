const seeder = require("../seed/seeder");
const TestUtil = require("./TestUtil");
const chai = require('chai');
let app = require('../app');

describe('TransactionController', () => {
    beforeEach(() => {
        return seeder.run();
    });
    it("dummyTest", async () => {
        let dummy = true;
        dummy.should.equal(true);
    });
});
