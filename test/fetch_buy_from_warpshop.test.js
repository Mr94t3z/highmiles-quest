import dotenv from 'dotenv';
import { Alchemy, Network } from "alchemy-sdk";
import fetch from 'node-fetch';
import { StackClient } from "@stackso/js-core";

// Load environment variables from .env file
dotenv.config();

// Initialize Alchemy client
const config = {
  apiKey: process.env.ALCHEMY_API_KEY || 'demo',
  network: Network.BASE_MAINNET,
};
const alchemy = new Alchemy(config);

// Initialize the Stack client
const stack = new StackClient({
  apiKey: process.env.STACK_API_KEY || '', 
  pointSystemId: parseInt(process.env.STACK_POINT_SYSTEM_ID || ''),
});

// Target address to match
const targetAddress = process.env.COINBASE_COMMERCE_WALLET_ADDRESS;
const eth_addresses = "0x5183E0203858aa3E3bc3A7D9cb41875a4c0A6216";

// Function to extract wallet addresses from all topics in a log
function parseAddressesFromTopics(log) {
  const addresses = [];
  log.topics.forEach(topic => {
    addresses.push(`0x${topic.slice(26)}`); // Slice the topic to get the address
  });
  return addresses;
}

async function getTransactionData(hash) {
  try {
    const resp = await fetch(
      `https://api.tatum.io/v3/base/transaction/${hash}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': process.env.TATUM_API_KEY || '',
        }
      }
    );

    if (resp.ok) {
      const data = await resp.json(); // Parse response as JSON
      const logs = data.logs || []; // Extract logs field, or default to an empty array if logs are not available

      // Parse all logs, filter, and extract addresses from all topics for logs that match the target address
      const matchingLogs = logs.filter(log => parseAddressesFromTopics(log).includes(targetAddress));
      
      if (matchingLogs.length > 0) {
        return { hash, qualified: true };
      } else {
        return { hash, qualified: false };
      }
    } else {
      console.error(`Failed to fetch transaction data for hash ${hash}:`, resp.statusText);
      return { hash, qualified: false };
    }
  } catch (error) {
    console.error(`Error fetching transaction data for hash ${hash}:`, error);
    return { hash, qualified: false };
  }
}

async function getAssetTransfers() {
  try {
    const res = await alchemy.core.getAssetTransfers({
      fromAddress: eth_addresses,
      toAddress: process.env.COINBASE_COMMERCE_SMART_CONTRACT_ADDRESS,
      excludeZeroValue: true,
      category: ["external"],
    });

    const hashes = res.transfers.map(transfer => transfer.hash);
    const qualifiedTransactions = [];

    for (const hash of hashes) {
      const transactionData = await getTransactionData(hash);
      if (transactionData.qualified) {
        qualifiedTransactions.push(transactionData);
        if (qualifiedTransactions.length >= 5) {
          break; // Exit loop if 5 qualified transactions are found
        }
      }
    }

    if (qualifiedTransactions.length > 0) {
      for (let i = 1; i <= qualifiedTransactions.length; i++) {
        await stack.track(`Buy ${i} - 747 Gear from Warpshop Frames`, {
          points: 747,
          account: eth_addresses,
          uniqueId: eth_addresses
        });
        console.log(`User qualified for transaction ${i}!`);
      }
    } else {
      console.log('User not qualified.');
    }
  } catch (error) {
    console.error("Error getting asset transfers:", error);
  }
}


getAssetTransfers();