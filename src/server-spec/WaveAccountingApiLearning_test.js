const config = require('../config')
const WAVE_URL = 'https://gql.waveapps.com/graphql/public';
const fetch = require('node-fetch');
xdescribe('WaveAccountingApi', () => {
    xit("create transaction", async () => {
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
                                didSucceed
                            }
                        }`,
                variables: {
                    input: {
                        businessId: config.getConfig().waveHgBusinessId,
                        externalId: Math.random() + "",
                        date: "2022-02-12",
                        description: "vincent test wave api chocolat",
                        anchor: {
                            accountId: config.getConfig().waveCashAccountId,
                            amount: 7,
                            direction: "DEPOSIT"
                        },
                        lineItems: [{
                            accountId: config.getConfig().waveChocolateAccountId,
                            amount: 7,
                            balance: "INCREASE"
                        }]
                    }
                }
            })
        });
        let json = await response.json();
        console.log(JSON.stringify(json))
        json.data.moneyTransactionCreate.didSucceed.should.equal(true);
    });
})
