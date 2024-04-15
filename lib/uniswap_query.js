import axios from 'axios';

const poolAddress = "0xb6B2410fCbEe0584314af4F859b7B896616f2E51";

async function fetchData() {
    try {
        const response = await axios.post(
            "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
            {
                query: `
                {
                  mints(first: 1000, where: {pool: "${poolAddress}"}) {
                    transaction {
                      id
                      mints {
                        sender
                        amount0
                        amount1
                      }
                    }
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
