import Web3 from 'web3';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const crashContractAddress = process.env.CRASH_SMART_CONTRACT_ADDRESS;
const poolsContractAddress = process.env.WETH_CRASH_POOLS_SMART_CONTRACT_ADDRESS;
const alchemyUrl = process.env.PROVIDER_URL;

const web3 = new Web3(alchemyUrl);

fetch(`https://api.chainbase.online/v1/token/transfers?chain_id=8453&contract_address=${crashContractAddress}&address=0x130946d8dF113e45f44e13575012D0cFF1E53e37&page=1&limit=100`, {
    method: 'GET',
    headers: {
        'accept': 'application/json',
        'x-api-key': 'demo'
    }
})
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Check if data and data.data are present
        if (data && data.data && data.data.length > 0) {
            // Filter data where to_address matches poolsContractAddress
            const filteredData = data.data.filter(item => item.to_address === poolsContractAddress);

            // Check if there are any matching transactions
            if (filteredData.length > 0) {
                // Extract the transaction hash from the first matching transaction
                const transactionHash = filteredData[0].transaction_hash;

                // Now use the transaction hash to fetch transaction detail
                fetch(`https://api.chainbase.online/v1/tx/detail?chain_id=8453&hash=${transactionHash}`, {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json',
                        'x-api-key': 'demo'
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(detailData => {
                        const valueInWei = detailData.data.value;
                        // Convert value from wei to ether
                        const valueInEth = web3.utils.fromWei(valueInWei, 'ether');

                        console.log('Total pools (ETH):', valueInEth);

                        // Fetch current Ethereum price in USD from CoinGecko API
                        fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                return response.json();
                            })
                            .then(priceData => {
                                if (priceData && priceData.ethereum && priceData.ethereum.usd) {
                                    // Calculate value in USD
                                    const valueInUSD = valueInEth * priceData.ethereum.usd;
                                    console.log('Total pools (USD):', valueInUSD);

                                    // Calculate 0.1% of the value in USD
                                    const totalPoint = valueInUSD * 0.001;
                                    console.log('Total point:', totalPoint);
                                    
                                } else {
                                    console.error('Price data is null or undefined.');
                                }
                            })
                            .catch(error => {
                                console.error('Error fetching price data:', error);
                            });
                    })
                    .catch(error => {
                        console.error('Error fetching transaction detail:', error);
                    });
            } else {
                console.log('No transactions found with to_address matching poolsContractAddress.');
            }
        } else {
            console.error('User does not have any transactions.');
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
