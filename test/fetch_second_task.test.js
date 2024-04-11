async function fetchTokenData() {
    const url = 'https://api.zora.co/discover/tokens/BASE-MAINNET/0xA0487Df3ab7a9E7Ba2fd6BB9acDa217D0930217b?offset=0&limit=50&sort_key=CREATED&sort_direction=DESC';
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Check if data is available
        if (data.results && data.results.length > 0) {
            // Extract token_id, token_name, start_datetime, and end_datetime for each token
            const tokens = data.results.map(token => {
                // Check if start_datetime falls from April 1st, 2024 onwards and end_datetime is null
                const startDate = new Date('2024-04-01T00:00:00');
                const tokenStartDate = new Date(token.mintable.start_datetime);

                if (tokenStartDate >= startDate) {
                    return {
                        collection_address: token.collection_address,
                        token_id: token.mintable.token_id,
                        token_name: token.mintable.token_name,
                        start_datetime: token.mintable.start_datetime,
                        end_datetime: token.mintable.end_datetime
                    };
                } else {
                    return null; // Token does not meet the desired criteria
                }
            }).filter(token => token !== null); // Filter out tokens that do not meet the desired criteria
            
            // Format the data as collection_address:token_id
            const formattedTokens = tokens.map(token => `${token.collection_address}:${token.token_id}`);

            return formattedTokens;
        } else {
            console.error('No results found.');
            return [];
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function fetchUserData() {
    try {
        const formattedTokens = await fetchTokenData();
        if (formattedTokens.length > 0) {
            
            // User has minted all NFTs in April
            // const eth_addresses = '0x5183E0203858aa3E3bc3A7D9cb41875a4c0A6216';
            // User has minted all NFTs in April but not completed
            const eth_addresses = '0x8962B4ebe444f2fa4eF74e631a084726Ad9BDc3D';
            const tokensParam = formattedTokens.join('&tokens=');
            const apiUrl = `https://api-base.reservoir.tools/users/${eth_addresses}/tokens/v10?tokens=${tokensParam}`;

            const response = await fetch(apiUrl, {
                headers: {
                    'accept': '*/*',
                    'x-api-key': 'demo-api-key'
                }
            });
            
            const userData = await response.json();

            // Check if user has acquired all tokens listed in fetchTokenData
            if (userData.tokens.length < formattedTokens.length) {
                console.log('User not qualified');
                return null;
            }

            return userData;
        } else {
            console.error('No tokens to fetch user data for.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

// Usage
fetchUserData().then(userData => {
    if (!userData) {
        // User is not qualified, no need to proceed further
        return;
    }

    const { tokens } = userData;

    // Sort the tokens array by tokenId in ascending order
    tokens.sort((a, b) => {
        // Assuming tokenId is a string
        return a.token.tokenId.localeCompare(b.token.tokenId);
    });

    // Check if all tokens have been acquired by the user
    const allTokensAcquired = tokens.every(tokenData => {
        return tokenData.ownership.tokenCount > 0;
    });

    if (allTokensAcquired) {
        console.log('Qualified');
    } else {
        console.log('User not qualified');
    }

    // Iterate over the sorted tokens array
    tokens.forEach(tokenData => {
        const { token, ownership } = tokenData;
        // Access token details
        console.log('Token ID:', token.tokenId);
        // Access ownership details
        console.log('Ownership:', ownership.tokenCount);
    });
}).catch(error => {
    console.error('Error:', error);
});



