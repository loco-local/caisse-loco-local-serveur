const WAVE_URL = 'https://gql.waveapps.com/graphql/public';
const config = require('../config')
const fetch = require('node-fetch');
const waveBusinessId = config.getConfig().waveHgBusinessId;
const fns = require('date-fns')

const models = require('../model')
const {
    TransactionItems
} = models

const WaveAccountingController = {
    listCategories: async function (req, res) {
        if (config.getConfig().waveAccounting === "test") {
            res.send([])
            return;
        }
        const response = await fetch(WAVE_URL, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + config.getConfig().waveAccounting,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `query {
                           business(id:"${waveBusinessId}"){
                           accounts(pageSize:300){
                           edges{
                                node{
                                    id
                                    name,
                                    type {
                                        name
                                        value
                                    }
                                }                              
                          }
                        }  
                    }
                }`,
                variables: {}
            })
        });
        const categories = await response.json();
        res.send(
            categories.data.business.accounts.edges.filter((edge) => {
                return edge.node.type.value !== "EXPENSE"
            })
        );
    },
    async addTransaction(transactionItem, waveCategoryAccountId, paymentMethod, personName, date) {
        if (paymentMethod === 'interact' || paymentMethod === 'bankTransfer') {
            return;
        }
        if (config.getConfig().waveAccounting === "test") {
            console.log("Test mode not trying to add to wave")
            return;
        }
        const lineItems = [{
            accountId: waveCategoryAccountId,
            amount: transactionItem.totalPrice.toFixed(2),
            balance: "INCREASE"
        }]
        const variables = {
            input: {
                businessId: config.getConfig().waveHgBusinessId,
                externalId: transactionItem.uuid,
                date: fns.format(date, "yyyy-MM-dd"),
                description: WaveAccountingController._descriptionOfTransactionItem(transactionItem, personName),
                anchor: {
                    accountId: WaveAccountingController.accountIdFromPaymentMethod(paymentMethod),
                    amount: transactionItem.totalPrice.toFixed(2),
                    direction: "DEPOSIT"
                },
                lineItems: lineItems
            }
        }
        const response = await fetch(WAVE_URL, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + config.getConfig().waveAccounting,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `mutation ($input:MoneyTransactionCreateInput!){
                            moneyTransactionCreate(input:$input)
                            {
                                didSucceed,
                                inputErrors{
                                    path,
                                    message,
                                    code
                                }
                            }
                        }`,
                variables: variables
            })
        });
        let json = await response.json();
        const isAddedToWave = json.data && json.data.moneyTransactionCreate && json.data.moneyTransactionCreate.didSucceed;
        if (!isAddedToWave) {
            console.log("failed to add to wave")
            // console.log(response);
            console.log(response.errors);
            // console.log(config.getConfig().waveAccounting)
            console.log(json);
            console.log(json.errors);
            // console.log(json.data.moneyTransactionCreate.inputErrors);
            console.log(JSON.stringify(json.data));
            console.log(variables);
            console.log(lineItems[0])
        }
        await TransactionItems.update({
            isAddedToWave: isAddedToWave,
        }, {
            where: {
                id: transactionItem.id
            }
        });
    },
    _descriptionOfTransactionItem: function (transactionItem, personName) {
        personName = personName === null ? "" : " " + personName;
        let nameInfo = "";
        if (transactionItem.info !== null && transactionItem.info !== undefined && transactionItem.info.name !== undefined) {
            nameInfo = " " + transactionItem.info.name
        }
        return transactionItem.description + nameInfo + personName;
    },
    accountIdFromPaymentMethod: function (paymentMethod) {
        switch (paymentMethod) {
            case 'prepaid':
                return config.getConfig().wavePrepaidAccountId;
            case 'cash' :
                return config.getConfig().waveCashAccountId;
        }
    },
}

module.exports = WaveAccountingController

