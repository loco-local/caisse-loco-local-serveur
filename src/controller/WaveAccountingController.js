const WAVE_URL = 'https://gql.waveapps.com/graphql/public';
const config = require('../config')
const fetch = require('node-fetch');
const waveBusinessId = config.getConfig().waveHgBusinessId;
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
    }
}

module.exports = WaveAccountingController

