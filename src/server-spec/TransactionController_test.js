const {TransactionItems} = require('../model');

const seeder = require("../seed/seeder");
const TestUtil = require("./TestUtil");
const chai = require('chai');
let app = require('../app');
const moment = require("moment")
describe('TransactionController', () => {
    beforeEach(() => {
        return seeder.run();
    });
    it("keeps track of balance", async () => {
        let u1 = await TestUtil.getUserByEmail("c1@loco.net");
        u1.balance.should.equal(333.35)
        let u1Transactions = await TestUtil.listTransactionsForUserId(u1.id);
        u1Transactions[0].balance.should.equal(333.35);
        let product = await TestUtil.getProductByName("Vaisselle");
        product.quantity = 2;
        let newTransactionId = await TestUtil.addTransaction(
            u1,
            [
                product
            ]
        );
        u1 = await TestUtil.getUserByEmail("c1@loco.net");
        u1.balance.should.equal(322.85);
        u1Transactions = await TestUtil.listTransactionsForUserId(u1.id);
        u1Transactions[0].balance.should.equal(322.85);
    });
    it("has correct transaction item create date and not the date of the product", async () => {
        let product = await TestUtil.getProductByName("Vaisselle");
        product.createdAt = moment(
            "03/01/2021",
            'DD/MM/YYYY'
        ).toDate();
        await chai.request(app)
            .post('/api/transaction')
            .send({
                items: [product],
                paymentMethod: 'cash'
            });
        let transactions = await TransactionItems.findAll();
        let latestTransaction = transactions[transactions.length - 1];
        let transactionCreateDate = moment(latestTransaction.createdAt);
        transactionCreateDate.year().should.equal(moment().year());
    });
});
