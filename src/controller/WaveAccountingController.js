const WAVE_URL = 'https://gql.waveapps.com/graphql/public';
const config = require('../config')
const fetch = require('node-fetch');

const WaveAccountingController = {
    listCategories: async function (req, res) {
        const response = await fetch(WAVE_URL, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + config.getConfig().waveAccounting,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `query {
                           business(id:"QnVzaW5lc3M6MTc2YTBkNzktOTNkOS00MjBkLTk3ZTEtYzAyMTc3ZTRmOTRm"){
                           accounts(pageSize:200){
                           edges{
                                node{
                                    id
                                    name
                                }
                          }
                        }  
                    }
                }`,
                variables: {}
            })
        });
        const categories = await response.json();
        res.send(categories.data.business.accounts.edges);
    }
}

module.exports = WaveAccountingController

