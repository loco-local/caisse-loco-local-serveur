const config = require('../config');
config.setEnvironment('test');
const {Users} = require('../model');
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

module.exports = TestUtil;
