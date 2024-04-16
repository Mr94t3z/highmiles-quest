import dotenv from 'dotenv';
dotenv.config();


const contractAddress = process.env.CRASH_SMART_CONTRACT_ADDRESS;

// Define the API endpoint and parameters
const apiUrl = 'https://api.chainbase.online/v1/token/transfers';
const params = new URLSearchParams({
    chain_id: '8453',
    contract_address: contractAddress,
    address: '0x130946d8dF113e45f44e13575012D0cFF1E53e37',
    from_timestamp: '1679811200', // 1st April 2024
    end_timestamp: '1680681600', // 28th April 2024
    page: '1',
    limit: '100'
});
const headers = {
    'Accept': 'application/json',
    'x-api-key': 'demo'
};

// Function to convert raw token value to human-readable format
function convertValueToReadable(rawValue, decimals) {
    const rawBigInt = BigInt(rawValue);
    const divisor = BigInt(10) ** BigInt(decimals);
    const readableValue = rawBigInt / divisor;
    return readableValue.toString();
}

fetch(`${apiUrl}?${params}`, { headers })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (!data || !data.data || data.data.length === 0) {
            console.log('No data available for the specified parameters.');
            return; // Exit the function since there's no data
        }

        // Extract the data from the response
        const transfers = data.data;

        const wallet = '0x130946d8dF113e45f44e13575012D0cFF1E53e37'
        
        const eth_addreses = wallet.toString().toLowerCase();
        
        // Filter the transfers based on the specified addresses
        const filteredTransfers = transfers.filter(transfer =>
            transfer.to_address === eth_addreses
        );

        if (filteredTransfers.length === 0) {
            console.log('No transfers found for the specified address.');
            return; // Exit the function since there are no transfers for the address
        }

        // Convert token values to human-readable format and log only the values
        filteredTransfers.map(transfer => {
            const value = convertValueToReadable(transfer.value, 18); // Assuming 18 decimal places
            console.log(value); // Log the value
            return value; // Return the value for further processing if needed
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
