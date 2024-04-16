import axios from 'axios';

const contract = "0xb6B2410fCbEe0584314af4F859b7B896616f2E51";

const poolAddress = contract.toString().toLowerCase();

console.log(poolAddress);

async function fetchData() {
    try {
        const response = await axios.post(
            "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
            {
                query: `
                  {
                    swaps(orderBy: timestamp, orderDirection: desc, where:
                    { pool: "0x621E87AF48115122Cd96209F820fE0445C2ea90e" }
                    ) {
                      pool {
                        token0 {
                          id
                          symbol
                        }
                        token1 {
                          id
                          symbol
                        }
                      }
                      sender
                      recipient
                      amount0
                      amount1
                    }
                    }
                `
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        console.log(response.data); // Display the response data
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchData();
