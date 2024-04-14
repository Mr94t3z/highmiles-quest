// import axios
import axios from 'axios';

const poolAddress = "0xb6B2410fCbEe0584314af4F859b7B896616f2E51"

const skip = 100;

axios.post(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
    {"query": `{ ticks(
          where: {poolAddress: "${poolAddress.toLowerCase()}", liquidityNet_not: "0"}
          first: 1000,
          skip: ${skip},
          orderBy: tickIdx,
          orderDirection: asc
        ) {
          tickIdx
          liquidityGross
          liquidityNet
        }
      }`
    },
    {
        headers: {
            "Content-Type": "application/json"
        }
    }
)