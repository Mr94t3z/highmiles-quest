import dotenv from 'dotenv';
import { Alchemy, Network } from "alchemy-sdk";

// Load environment variables from .env file
dotenv.config();

const config = {
  apiKey: process.env.ALCHEMY_API_KEY || 'demo',
  network: Network.BASE_MAINNET,
};
const alchemy = new Alchemy(config);

async function getAssetTransfers() {
  try {
    const res = await alchemy.core.getAssetTransfers({
      fromAddress: "0x5183E0203858aa3E3bc3A7D9cb41875a4c0A6216",
      toAddress: process.env.COINBASE_COMMERCE_SMART_CONTRACT_ADDRESS,
      excludeZeroValue: true,
      category: ["external"],
    });

    // Loop through each transfer and process its hash
    res.transfers.forEach(transfer => {
      const hash = transfer.hash;
      console.log("Hash:", hash);
      // Add your logic to handle each hash here
    });
  } catch (error) {
    console.error(error);
  }
}

getAssetTransfers();