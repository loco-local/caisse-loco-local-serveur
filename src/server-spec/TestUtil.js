const config = require('../config');
config.setEnvironment('test');
const {Users, Transactions, Products} = require('../model');
const jwt = require('jsonwebtoken');
const chai = require('chai');
require('chai').should();
chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.use(require('chai-string'));

let app = require('../app');

function jwtSignUser(user) {
    const ONE_WEEK = 60 * 60 * 24 * 7;
    return jwt.sign(user, config.getConfig().authentication.jwtSecret, {
        expiresIn: ONE_WEEK
    })
}

const TestUtil = {};

TestUtil.signIn = async function (email) {
    email = typeof email === "string" ? email : "u@sel.org";
    const user = await TestUtil.getUserByEmail(email)
    user.token = jwtSignUser(user.toJSON());
    return user;
};

TestUtil.getUserByEmail = function (email) {
    return Users.findOne({
        where: {
            email: email
        }
    });
}

TestUtil.listTransactionsForUserId = function (userId, sortType) {
    if (!sortType) {
        sortType = "DESC";
    }
    return Transactions.findAll({
        include: [
            Users
        ],
        where: {
            UserId: userId
        },
        order: [['createdAt', sortType]]
    });
};

TestUtil.addTransaction = async function (user, items) {
    let res = await chai.request(app)
        .post('/api/' + user.id + '/transaction')
        .send({
            items: items,
            paymentMethod: 'cash'
        });
    return res.body.transactionId;
};

TestUtil.getProductByName = async function (name) {
    const product = await Products.findOne({
        where: {
            name: name
        }
    });
    return product.dataValues;
};

module.exports = TestUtil;
