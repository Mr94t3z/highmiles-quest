import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();


const apiKey = process.env.ALCHEMY_API_KEY;
fetch(`https://base-mainnet.g.alchemy.com/v2/${apiKey}`, {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "alchemy_getAssetTransfers",
    params: [
      {
        fromBlock: "0x0",
        toAddress: process.env.COINBASE_COMMERCE_SMART_CONTRACT_ADDRESS,
        withMetadata: true,
        excludeZeroValue: true,
        maxCount: "0x3e8",
        category: ["external"],
        fromAddress: "0x5183E0203858aa3E3bc3A7D9cb41875a4c0A6216"
      }
    ]
  })
})
.then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
})
.then(data => {
  // Access the transfers array within the result object
  const transfers = data.result.transfers;
  // Map over the transfers array to extract hashes
  const hashes = transfers.map(transfer => transfer.hash);
  console.log("Hashes:", hashes);
  return hashes;
})
.catch(error => console.error('Error:', error));
