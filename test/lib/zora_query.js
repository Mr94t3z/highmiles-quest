// Import the entire Zora SDK package as a single default import
import ZoraSDK from '@zoralabs/zdk';

// Destructure ZDK, ZDKNetwork, and ZDKChain from the imported package
const { ZDK, ZDKNetwork, ZDKChain } = ZoraSDK;

const networkInfo = {
    network: ZDKNetwork.Ethereum,  // Specify Ethereum as the network
    chain: ZDKChain.Mainnet,       // Mainnet is the chain being used
};

const API_ENDPOINT = "https://api.zora.co/graphql";
const args = {
    endPoint: API_ENDPOINT,
    networks: [networkInfo],
    apiKey: process.env.API_KEY  // Ensure your .env file has this key or it's set in your environment
};

const zdk = new ZDK(args);

async function fetchNFTs() {
    try {
        const response = await zdk.tokens({
            where: {
                collectionAddresses: [""]  // Replace with actual address
            },
            pagination: {
                limit: 10
            },
            sort: {
                sortDirection: "ASC",
                sortKey: "Created"
            },
            includeFullDetails: true,
            includeSalesHistory: false
        });

        console.log("NFTs fetched:", response);
    } catch (error) {
        console.error("Error fetching NFTs:", error);
    }
}

fetchNFTs();