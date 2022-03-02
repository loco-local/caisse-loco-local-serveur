const BASKET_PRODUCT_ID = 1;
const PENALTY_PRODUCT_ID = 2;
const adminOnlyProducts = [
    BASKET_PRODUCT_ID,
    PENALTY_PRODUCT_ID
];
const {v4: uuidv4} = require('uuid');
const models = require('../model');
const {
    Transactions,
    TransactionItems,
    Users,
    Products
} = models

const config = require('../config')

const {Op} = require('sequelize')

const WaveAccountingController = require('./WaveAccountingController')

const TransactionController = {
    async listForUser(req, res) {
        const userId = parseInt(req.params['userId'])
        const transactions = await Transactions.findAll({
            where: {
                UserId: userId
            }
        });
        res.send(transactions)
    },
    async listAllDetails(req, res) {
        const lowerDate = new Date(req.body.lowerDate);
        const higherDate = new Date(req.body.higherDate);
        const transactionItems = await TransactionItems.findAll({
            include: [
                {
                    model: Transactions,
                    attributes: ['id', 'UserId', 'personName', 'paymentMethod']
                }],
            where: {
                'createdAt': {
                    [Op.between]: [lowerDate, higherDate],
                }
            }
        });
        res.send(transactionItems)
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
    async prepaidAccountTransaction(req, res) {
        const userId = parseInt(req.params['userId'])
        let user = await Users.findOne({
            where: {
                id: userId
            }
        });
        // console.log("yo " + JSON.stringify(req.body[0]))
        let items = await TransactionController._sanitizeItems(
            req.body.items
        )
        items = items.map(function (item) {
            item.totalPriceAfterRebate = parseFloat(item.totalPrice)
            return item
        })
        let latestTransaction = await TransactionController._getUserLatestTransaction(
            user
        );
        // console.log(latestTransaction.balance)
        let transaction = await TransactionController._transaction(
            items, "prepaid", req.body.personName, user, latestTransaction
        );
        res.send(transaction)
    },
    transactionDetails(req, res) {
        const transactionId = parseInt(req.params['transactionId'])
        TransactionItems.findAll({
            where: {
                TransactionId: transactionId
            },
            include: [{
                attributes: ['name', 'format']
            }]
        }).then(function (transactionItems) {
            res.send(transactionItems)
        })
    }
    ,
    async anonymousTransaction(req, res) {
        let items = await TransactionController._sanitizeItems(
            req.body.items
        );
        items = items.map(function (item) {
            item.totalPriceAfterRebate = parseFloat(item.totalPrice)
            return item
        })
        const transaction = await TransactionController._transaction(
            items, req.body.paymentMethod, req.body.personName
        )
        res.send(transaction);
    },
    async addFund(req, res) {
        const amount = req.body.amount
        const accountId = req.body.accountId
        if (!amount || !accountId) {
            return res.sendStatus(400)
        }
        let user = await Users.findOne({
            where: {
                id: accountId
            }
        });
        let latestTransaction = await TransactionController._getUserLatestTransaction(
            user
        );
        let transaction = await TransactionController._transaction(
            [{
                name: "Paiement compte prépayé",
                quantity: 1,
                price: amount * -1,
                totalPrice: amount * -1,
                totalPriceAfterRebate: amount * -1,
                accountingCategoryId: config.getConfig().wavePrepaidAccountId
            }],
            req.body.paymentMethod,
            req.body.personName,
            user,
            latestTransaction
        )
        res.send(transaction);
    },
    _transaction(items, paymentMethod, personName, user, latestUserTransaction) {
        let transaction
        let totalPrice = items.reduce(function (sum, item) {
            return (sum) + (item.totalPriceAfterRebate)
        }, 0)
        return models.sequelize.transaction(async function (t) {
            const newTransaction = {
                totalPrice: parseFloat(totalPrice).toFixed(2),
                paymentMethod: paymentMethod,
                personName: personName
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
                // console.log('items')
                // console.log(items)
                // console.log('TransactionController._areItemsAdminOnly(items)')
                // console.log(TransactionController._areItemsAdminOnly(items))
                if (!TransactionController._areItemsAdminOnly(items)) {
                    user.latestTransaction = new Date()
                }
                promise = user.save();
            } else {
                promise = Promise.resolve()
            }
            await promise;
            transaction = await Transactions.create(newTransaction);
            await Promise.all(items.map(async function (item) {
                item.TransactionId = transaction.id;
                item.tvq = TransactionController.calculateTVQ(item);
                item.tps = TransactionController.calculateTPS(item);
                item.description = item.name;
                item.uuid = uuidv4();
                return TransactionItems.create(
                    item
                ).then((transactionItem) => {
                    return WaveAccountingController.addTransaction(
                        transactionItem,
                        item.accountingCategoryId,
                        paymentMethod,
                        transaction.personName,
                        new Date()
                    );
                })
            }))
            return transaction
        })
    },
    calculateTPS(product) {
        return product.isTaxable ? product.amountWithoutTax * 0.05 * product.quantity : 0;
    },
    calculateTVQ(product) {
        return product.isTaxable ? product.amountWithoutTax * 0.09975 * product.quantity : 0;
    },
    _sanitizeItems: async function (items) {
        const products = await Products.findAll({
            where: {
                id: {
                    $in: items.map(function (item) {
                        return item.id
                    })
                }
            }
        });
        return items.map(function (item) {
            const product = products.filter(function (product) {
                return product.id === item.id
            })[0];
            if (!product.isActivity && !product.isOther) {
                item.price = product.price
            }
            if (item.quantity < 0) {
                item.quantity = 0
            }
            item.totalPrice = item.price * item.quantity;
            item.ProductId = item.id;
            if (!item.accountingCategoryId) {
                item.accountingCategoryId = product.accountingCategoryId;
            }
            item.id = null
            return item
        });
    },
    _getUserLatestTransaction: async function (user) {
        const latestTransactions = await Transactions.findAll({
            limit: 1,
            order: [['createdAt', 'DESC']],
            where: {
                UserId: user.id
            },
            attributes: ['balance', 'createdAt']
        });
        return latestTransactions.length ? latestTransactions[0] : {
            balance: 0
        };
    },
    _areItemsAdminOnly: function (items) {
        return items.every(function (item) {
            return adminOnlyProducts.indexOf(item.ProductId) >= 0
        })
    }
}
module.exports = TransactionController
