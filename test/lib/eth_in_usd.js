async function getEthPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        const ethPrice = data.ethereum.usd;
        return ethPrice;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Example usage
getEthPrice().then((ethPrice) => {
    if (ethPrice !== null) {
        console.log("Current Ether (ETH) price in USD:", ethPrice);
    } else {
        console.log("Failed to retrieve Ether price.");
    }
});
