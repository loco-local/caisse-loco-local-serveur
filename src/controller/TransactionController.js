const BASKET_PRODUCT_ID = 1
const PENALTY_PRODUCT_ID = 2
const adminOnlyProducts = [
    BASKET_PRODUCT_ID,
    PENALTY_PRODUCT_ID
]
const models = require('../model')
const {
    Transactions,
    TransactionItems,
    Users,
    Products
} = models

const {Op} = require('sequelize')

const SUBSCRIBER_REBATE_CODE = 'subscriber'
const REBATE_RATIO = 0.1

const TransactionController = {
    list(req, res) {
        const subscriberId = parseInt(req.params['ownerId'])
        return Transactions.findAll({
            where: {
                UserId: subscriberId
            }
        }).then(function (transactions) {
            res.send(transactions)
        })
    },
    listAllDetails(req, res) {
        const year = parseInt(req.params['year'])
        const beginningOfYear = new Date();
        beginningOfYear.setFullYear(year);
        beginningOfYear.setMonth(0);
        beginningOfYear.setDate(1);
        beginningOfYear.setHours(0, 0, 0);


        const endOfYear = new Date();
        endOfYear.setFullYear(year);
        endOfYear.setMonth(11);
        endOfYear.setDate(31);
        endOfYear.setHours(23, 59, 59);

        return TransactionItems.findAll({
            include: [
                Products,
                {
                    model: Transactions,
                    attributes: ['id', 'UserId']
                }],
            where: {
                'updatedAt': {
                    [Op.between]: [beginningOfYear, endOfYear],
                }
            }
        }).then(function (transactionItems) {
            res.send(transactionItems)
        })
    },
    async removeTransaction(req, res) {
        const transactionId = parseInt(req.params['transactionId'])
        const transaction = await Transactions.findOne({
            where: {
                id: transactionId
            }
        });
        if (transaction.UserId === null) {
            await TransactionItems.destroy({
                where: {
                    TransactionId: transactionId
                }
            })
            await transaction.destroy();
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }
    },
    subscriberTransaction(req, res) {
        let user
        const userId = parseInt(req.params['ownerId'])
        let items
        return Users.findOne({
            where: {
                id: userId
            }
        }).then(function (_user) {
            user = _user
            return TransactionController._setItemPrices(
                req.body
            )
        }).then(function (_items) {
            items = _items.map(function (item) {
                // if (user.hasRebate) {
                // const rebate = parseFloat(item.totalPrice * REBATE_RATIO)
                // item.totalPriceAfterRebate = parseFloat(item.totalPrice - rebate)
                // item.rebates = [{
                //   amount: rebate,
                //   code: SUBSCRIBER_REBATE_CODE
                // }]
                // } else {
                item.totalPriceAfterRebate = parseFloat(item.totalPrice)
                // }
                return item
            })
            return TransactionController._getUserLatestTransaction(
                user
            )
        }).then(function (latestTransaction) {
            return TransactionController._transaction(
                items, user, latestTransaction
            )
        }).then(function (transaction) {
            res.send(transaction)
        })
    },
    transactionDetails(req, res) {
        const transactionId = parseInt(req.params['transactionId'])
        TransactionItems.findAll({
            where: {
                TransactionId: transactionId
            },
            include: [{
                model: Products,
                attributes: ['name', 'format']
            }]
        }).then(function (transactionItems) {
            res.send(transactionItems)
        })
    },
    anonymousTransaction(req, res) {
        TransactionController._setItemPrices(
            req.body
        ).then(function (items) {
            items = items.map(function (item) {
                item.totalPriceAfterRebate = parseFloat(item.totalPrice)
                return item
            })
            return TransactionController._transaction(
                items
            ).then(function (transaction) {
                res.send(transaction)
            })
        })
    },
    addFund(req, res) {
        const amount = req.body.amount
        const subscriberId = req.body.subscriberId
        if (!amount || !subscriberId) {
            return res.sendStatus(400)
        }
        let user
        Users.findOne({
            where: {
                id: subscriberId
            }
        }).then(function (_user) {
            user = _user
            return TransactionController._getUserLatestTransaction(
                user
            )
        }).then(function (latestTransaction) {
            return TransactionController._transaction(
                [{
                    ProductId: BASKET_PRODUCT_ID,
                    quantity: 1,
                    unitPrice: amount * -1,
                    totalPrice: amount * -1,
                    totalPriceAfterRebate: amount * -1
                }],
                user,
                latestTransaction
            )
        }).then(function (transaction) {
            res.send(transaction)
        })
    },
    addPenaltyFee(req, res) {
        const amount = req.body.amount
        const subscriberId = req.body.subscriberId
        if (!amount || !subscriberId) {
            return res.sendStatus(400)
        }
        let user
        Users.findOne({
            where: {
                id: subscriberId
            }
        }).then(function (_user) {
            user = _user
            return TransactionController._getUserLatestTransaction(
                user
            )
        }).then(function (latestTransaction) {
            return TransactionController._transaction(
                [{
                    ProductId: PENALTY_PRODUCT_ID,
                    quantity: 1,
                    unitPrice: amount,
                    totalPrice: amount,
                    totalPriceAfterRebate: amount
                }],
                user,
                latestTransaction
            )
        }).then(function (transaction) {
            res.send(transaction)
        })
    },
    _transaction(items, user, latestUserTransaction) {
        let transaction
        let totalPrice = items.reduce(function (sum, item) {
            return (sum) + (item.totalPriceAfterRebate)
        }, 0)
        return models.sequelize.transaction(function (t) {
            const newTransaction = {
                totalPrice: parseFloat(totalPrice).toFixed(2)
            }
            if (latestUserTransaction) {
                newTransaction.balance = parseFloat(
                    latestUserTransaction.balance - totalPrice
                ).toFixed(2)
            }
            let promise
            if (user) {
                newTransaction.UserId = user.id
                user.balance = newTransaction.balance
                console.log('items')
                console.log(items)
                console.log('TransactionController._areItemsAdminOnly(items)')
                console.log(TransactionController._areItemsAdminOnly(items))
                if (!TransactionController._areItemsAdminOnly(items)) {
                    user.latestTransaction = new Date()
                }
                promise = user.save()
            } else {
                promise = Promise.resolve()
            }
            return promise.then(function () {
                return Transactions.create(newTransaction)
            }).then(function (_transaction) {
                transaction = _transaction
                return Promise.all(items.map(function (item) {
                    item.TransactionId = transaction.id
                    return TransactionItems.create(
                        item
                    )
                }))
            }).then(function () {
                return transaction
            })
        })
    },
    _setItemPrices: function (items) {
        return Products.findAll({
            where: {
                id: {
                    $in: items.map(function (item) {
                        return item.id
                    })
                }
            }
        }).then(function (products) {
            return items.map(function (item) {
                item.unitPrice = products.filter(function (product) {
                    return product.id === item.id
                })[0].unitPrice
                if (item.quantity < 0) {
                    item.quantity = 0
                }
                item.totalPrice = item.unitPrice * item.quantity
                item.ProductId = item.id
                item.id = null
                return item
            })
        })
    },
    _getUserLatestTransaction: function (user) {
        return Transactions.findAll({
            limit: 1,
            order: [['createdAt', 'DESC']],
            where: {
                UserId: user.id
            },
            attributes: ['balance', 'createdAt']
        }).then(function (latestTransactions) {
            return latestTransactions.length ? latestTransactions[0] : {
                balance: 0
            }
        })
    },
    _areItemsAdminOnly: function (items) {
        return items.every(function (item) {
            return adminOnlyProducts.indexOf(item.ProductId) >= 0
        })
    }
}
module.exports = TransactionController
