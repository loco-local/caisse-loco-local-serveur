const config = require('../config');
config.setEnvironment('development');
const Promise = require('bluebird');

const {
    sequelize,
    Users,
    Products,
    Categories
} = require('../model')

const users = require('./Users.json')
const products = require('./Products.json')
const categories = require('./Categories.json')

module.exports = {
    run: function () {
        return sequelize.sync({force: true})
            .then(() => {
                return Promise.all(
                    users.map(user => {
                        return Users.create(user)
                    })
                )
            })
            .then(() => {
                return Promise.all(
                    categories.map(category => {
                        return Categories.create(category)
                    })
                )
            })
            .then(() => {
                return Promise.all(
                    products.map(product => {
                        product.isAvailable = true;
                        return Products.create(product)
                    })
                )
            })
            .catch(function (err) {
                console.log(err)
            })
    }
}
