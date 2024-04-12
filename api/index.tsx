import { Button, Frog } from 'frog'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'
import { StackClient } from "@stackso/js-core";
import dotenv from 'dotenv';

// Uncomment this packages to tested on local server
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

// Load environment variables from .env file
dotenv.config();

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api/april',
  imageOptions: {
    /* Other default options */
    fonts: [
      {
        name: 'Arimo',
        source: 'google',

      },
      {
        name: 'Space Mono',
        source: 'google',
      },
    ],    
  },
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

// Initialize the client
const stack = new StackClient({
  // Get your API key and point system id from the Stack dashboard (stack.so)
  apiKey: process.env.STACK_API_KEY || '', 
  pointSystemId: parseInt(process.env.STACK_POINT_SYSTEM_ID || ''),
});

// Neynar API base URL
const baseUrlNeynar = process.env.BASE_URL_NEYNAR;
// Reservoir API base URL
const baseUrlReservoir = process.env.BASE_URL_RESEVOIR;
// Zora API base URL
const baseUrlZora = process.env.BASE_URL_ZORA;
// Chainbase API base URL
const baseUrlChainbase = process.env.BASE_URL_CHAINBASE;

app.frame('/', (c) => {
    return c.res({
      image: (
        <div
          style={{
            alignItems: 'center',
            background: '#1A30FF',
            backgroundSize: '100% 100%',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            height: '100%',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
            color: 'white',
            fontFamily: 'Space Mono',
            fontSize: 35,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 0,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <p>Hi Passengers! 👨🏻‍✈️</p>
          Welcome to HighMiles© Quest! ✈️
        </div>
      ),
      intents: [
        <Button action='/first-quest'>🏁 Start Quest</Button>,
        <Button.Link href='https://warpcast.com/~/channel/747air'>✈️ Follow Channel</Button.Link>
      ],
    });
});


// First Quest
app.frame('/first-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  const contractAddress = process.env.FIRST_QUEST_SMART_CONTRACT_ADDRESS || '';

  try {
    const responseUserData = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': 'NEYNAR_FROG_FM',
      },
    });

    const data = await responseUserData.json();
    const userData = data.users[0];

    // User connected wallet address
    const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();

    const responseUserCollected = await fetch(`${baseUrlReservoir}/users/${eth_addresses}/collections/v4?collection=${contractAddress}`, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'x-api-key': process.env.RESERVOIR_API_KEY || '',
      }
    })

    const userCollected = await responseUserCollected.json();

    if (userCollected.collections.length > 0) {
      await stack.track("Mint - Forage x 747 Airlines", {
        points: 250,
        account: eth_addresses,
        uniqueId: eth_addresses
      });
      console.log('User qualified!');
    } else {
      console.log('User not qualified!');
    }

    return c.res({
      image: (
        <div
          style={{
            alignItems: 'center',
            background: '#1A30FF',
            backgroundSize: '100% 100%',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            height: '100%',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
            color: 'white',
            fontFamily: 'Space Mono',
            fontSize: 35,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 0,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={userData.pfp_url.toLowerCase().endsWith('.webp') ? '/images/no_avatar.png' : userData.pfp_url}
              style={{
                width: 100,
                height: 100,
                borderRadius: 100,
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
              }}
              width={200} 
              height={200} 
            />
            <span style={{ marginLeft: '25px' }}>Hi, @{userData.username} 👩🏻‍✈️</span>
          </div>
          <p style={{ fontSize: 30 }}>Task 1 - 250 Points 🎖️</p>
          <p style={{ margin : 0 }}>[ Mint - Forage x 747 Airlines ]</p>
          {userCollected.collections.length > 0 ? (
            <p style={{ fontSize: 24 }}>Completed ✅</p>
          ) : (
            <p style={{ fontSize: 24 }}>Not qualified ❌</p>
          )}
        </div>
      ),
      intents: [
        <Button.Link href='https://forage.xyz/p/01HT3MC4CTKPVQWQ6TX052RXGF	'>Mint ⌁</Button.Link>,
        <Button action='/first-quest'>🔄 Check</Button>,
        <Button action='/'>⏪ Back</Button>,
        <Button action='/second-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});


// Second Quest
app.frame('/second-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': 'NEYNAR_FROG_FM',
      },
    });

    const data = await response.json();
    const userData = data.users[0];
    
    // Fetch token data
    const responseTokenData = await fetch(`${baseUrlZora}/0xA0487Df3ab7a9E7Ba2fd6BB9acDa217D0930217b?offset=0&limit=50&sort_key=CREATED&sort_direction=DESC`);

    const tokenData = await responseTokenData.json();
    let qualified = false;
    
    // Check if data is available
    if (tokenData.results && tokenData.results.length > 0) {
      // Extract token_id, token_name, start_datetime, and end_datetime for each token
      const tokens = tokenData.results.map((token: { mintable: { start_datetime: string | number | Date; token_id: any; token_name: any; end_datetime: any; }; collection_address: any; }) => {
          // Check if start_datetime falls from April 1st, 2024 onwards
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
              return null;
          }
      }).filter((token: null) => token !== null);

      // User connected wallet address
      const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();
      
      // Format the data as collection_address:token_id
      const formattedTokens = tokens.map((token: { collection_address: any; token_id: any; }) => `${token.collection_address}:${token.token_id}`);
      
      // Get user tokens
      const responseUserData = await fetch(`${baseUrlReservoir}/users/${eth_addresses}/tokens/v10?tokens=${formattedTokens.join('&tokens=')}&limit=200`, {
        headers: {
          'accept': 'application/json',
          'x-api-key': process.env.RESERVOIR_API_KEY || '',
        },
      });
      
      const userDataResponse = await responseUserData.json();

      if (userDataResponse.tokens.length >= formattedTokens.length) {
        qualified = true;
        await stack.track("Mint - All 747 Airlines NFTs (made in April)", {
          points: 747,
          account: eth_addresses,
          uniqueId: eth_addresses
        });
        console.log('User qualified!');
      } else {
        console.log('User not qualified!');
      }
    }  

    return c.res({
      image: (
        <div
          style={{
            alignItems: 'center',
            background: '#1A30FF',
            backgroundSize: '100% 100%',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            height: '100%',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
            color: 'white',
            fontFamily: 'Space Mono',
            fontSize: 35,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 0,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={userData.pfp_url.toLowerCase().endsWith('.webp') ? '/images/no_avatar.png' : userData.pfp_url}
              style={{
                width: 100,
                height: 100,
                borderRadius: 100,
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
              }}
              width={200} 
              height={200} 
            />
            <span style={{ marginLeft: '25px' }}>Hi, @{userData.username} 👩🏻‍✈️</span>
          </div>
          <p style={{ fontSize: 30 }}>Task 2 - 747 Points 🎖️</p>
          <p style={{ margin : 0 }}>[ Mint - All 747 Airlines NFTs (made in April) ]</p>
          {qualified ? (
              <p style={{ fontSize: 24 }}> Completed ✅ </p>
            ) : (
              <p style={{ fontSize: 24 }}> Not qualified ❌</p>
            )
          }
        </div>
      ),
      intents: [
        <Button.Link href='https://zora.co/collect/base:0xa0487df3ab7a9e7ba2fd6bb9acda217d0930217b'>Mint ⌁</Button.Link>,
        <Button action='/second-quest'>🔄 Check</Button>,
        <Button action='/first-quest'>⏪ Back</Button>,  
        <Button action='/third-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});


// Third Quest - Skip
app.frame('/third-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': 'NEYNAR_FROG_FM',
      },
    });

    const data = await response.json();
    const userData = data.users[0];
  

    return c.res({
      image: (
        <div
          style={{
            alignItems: 'center',
            background: '#1A30FF',
            backgroundSize: '100% 100%',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            height: '100%',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
            color: 'white',
            fontFamily: 'Space Mono',
            fontSize: 35,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 0,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={userData.pfp_url.toLowerCase().endsWith('.webp') ? '/images/no_avatar.png' : userData.pfp_url}
              style={{
                width: 100,
                height: 100,
                borderRadius: 100,
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
              }}
              width={200} 
              height={200} 
            />
            <span style={{ marginLeft: '25px' }}>Hi, @{userData.username} 👩🏻‍✈️</span>
          </div>
          <p style={{ fontSize: 30 }}>Task 3 - 500 Points 🎖️</p>
          <p style={{ margin : 0 }}>[ Mint - At least 1 747 Airlines NFT (in $crash) ]</p>
          {/* <p style={{ fontSize: 24 }}> Completed ✅ </p> */}
          <p style={{ fontSize: 24 }}> Not qualified ❌</p>
        </div>
      ),
      intents: [
        <Button.Link href='https://zora.co/explore/crash'>Mint ⌁</Button.Link>,
        <Button action='/third-quest'>🔄 Check</Button>,
        <Button action='/second-quest'>⏪ Back</Button>,
        <Button action='/fourth-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});


// Fourth Quest
app.frame('/fourth-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': 'NEYNAR_FROG_FM',
      },
    });

    const data = await response.json();
    const userData = data.users[0];

    // User connected wallet address
    const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();

    // Token address
    const tokenAddress = process.env.FOURTH_QUEST_TOKEN_ADDRESS || '';

    // Get user tokens
    const responseUserData = await fetch(`${baseUrlReservoir}/users/${eth_addresses}/tokens/v10?tokens=${tokenAddress}`, {
      headers: {
        'accept': 'application/json',
        'x-api-key': process.env.RESERVOIR_API_KEY || '',
      },
    });

    const userDataResponse = await responseUserData.json();

    if (userDataResponse.tokens.length > 0) {
      await stack.track("Mint - Imagine x 747 Air NFT", {
        points: 333,
        account: eth_addresses,
        uniqueId: eth_addresses
      });
      console.log('User qualified!');
    } else {
      console.log('User not qualified!');
    }

    return c.res({
      image: (
        <div
          style={{
            alignItems: 'center',
            background: '#1A30FF',
            backgroundSize: '100% 100%',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            height: '100%',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
            color: 'white',
            fontFamily: 'Space Mono',
            fontSize: 35,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 0,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={userData.pfp_url.toLowerCase().endsWith('.webp') ? '/images/no_avatar.png' : userData.pfp_url}
              style={{
                width: 100,
                height: 100,
                borderRadius: 100,
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
              }}
              width={200} 
              height={200} 
            />
            <span style={{ marginLeft: '25px' }}>Hi, @{userData.username} 👩🏻‍✈️</span>
          </div>
          <p style={{ fontSize: 30 }}>Task 4 - 333 Points 🎖️</p>
          <p style={{ margin : 0 }}>[ Mint - Imagine x 747 Air NFT ]</p>
          {userDataResponse.tokens.length > 0 ? (
            <p style={{ fontSize: 24 }}>Completed ✅</p>
          ) : (
            <p style={{ fontSize: 24 }}>Not qualified ❌</p>
          )}
        </div>
      ),
      intents: [
        <Button.Link href='https://zora.co/collect/base:0xa0487df3ab7a9e7ba2fd6bb9acda217d0930217b/53'>Mint ⌁</Button.Link>,
        <Button action='/fourth-quest'>🔄 Check</Button>,
        <Button action='/third-quest'>⏪ Back</Button>,
        <Button action='/fifth-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});


// Fifth Quest - Skip
app.frame('/fifth-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': 'NEYNAR_FROG_FM',
      },
    });

    const data = await response.json();
    const userData = data.users[0];
  

    return c.res({
      image: (
        <div
          style={{
            alignItems: 'center',
            background: '#1A30FF',
            backgroundSize: '100% 100%',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            height: '100%',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
            color: 'white',
            fontFamily: 'Space Mono',
            fontSize: 35,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 0,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={userData.pfp_url.toLowerCase().endsWith('.webp') ? '/images/no_avatar.png' : userData.pfp_url}
              style={{
                width: 100,
                height: 100,
                borderRadius: 100,
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
              }}
              width={200} 
              height={200} 
            />
            <span style={{ marginLeft: '25px' }}>Hi, @{userData.username} 👩🏻‍✈️</span>
          </div>
          <p style={{ fontSize: 30 }}>Task 5 - 500 Points 🎖️</p>
          <p style={{ margin : 0 }}>[ Mint - leaderboard from 747 game ]</p>
          {/* <p style={{ fontSize: 24 }}> Completed ✅ </p> */}
          <p style={{ fontSize: 24 }}> Not qualified ❌</p>
        </div>
      ),
      intents: [
        <Button.Link href='https://zora.co/explore/crash'>Mint ⌁</Button.Link>,
        <Button action='/fifth-quest'>🔄 Check</Button>,
        <Button action='/fourth-quest'>⏪ Back</Button>,
        <Button action='/sixth-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});


// Sixth Quest
app.frame('/sixth-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': 'NEYNAR_FROG_FM',
      },
    });

    const data = await response.json();
    const userData = data.users[0];

    // User connected wallet address
    const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();

    // Token address
    const tokenAddress = process.env.SIXTH_QUEST_TOKEN_ADDRESS || '';

    // Get user tokens
    const responseUserData = await fetch(`${baseUrlReservoir}/users/${eth_addresses}/tokens/v10?tokens=${tokenAddress}`, {
      headers: {
        'accept': 'application/json',
        'x-api-key': process.env.RESERVOIR_API_KEY || '',
      },
    });

    const userDataResponse = await responseUserData.json();

    if (userDataResponse.tokens.length > 0) {
      await stack.track("Mint - Destinations! Boarding Pass", {
        points: 2000,
        account: eth_addresses,
        uniqueId: eth_addresses
      });
      console.log('User qualified!');
    } else {
      console.log('User not qualified!');
    }
  

    return c.res({
      image: (
        <div
          style={{
            alignItems: 'center',
            background: '#1A30FF',
            backgroundSize: '100% 100%',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            height: '100%',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
            color: 'white',
            fontFamily: 'Space Mono',
            fontSize: 35,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 0,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={userData.pfp_url.toLowerCase().endsWith('.webp') ? '/images/no_avatar.png' : userData.pfp_url}
              style={{
                width: 100,
                height: 100,
                borderRadius: 100,
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
              }}
              width={200} 
              height={200} 
            />
            <span style={{ marginLeft: '25px' }}>Hi, @{userData.username} 👩🏻‍✈️</span>
          </div>
          <p style={{ fontSize: 30 }}>Task 6 - 2000 Points 🎖️</p>
          <p style={{ margin : 0 }}>[ Mint - Destinations! Boarding Pass ]</p>
          {userDataResponse.tokens.length > 0 ? (
            <p style={{ fontSize: 24 }}>Completed ✅</p>
          ) : (
            <p style={{ fontSize: 24 }}>Not qualified ❌</p>
          )}
        </div>
      ),
      intents: [
        <Button.Link href='https://zora.co/collect/base:0xcd6a95bf6c52a76f75049024b3660307b0078fef/2'>Mint ⌁</Button.Link>,
        <Button action='/sixth-quest'>🔄 Check</Button>,
        <Button action='/fifth-quest'>⏪ Back</Button>,
        <Button action='/seventh-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});


// Seventh Quest
app.frame('/seventh-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': 'NEYNAR_FROG_FM',
      },
    });

    const data = await response.json();
    const userData = data.users[0];

    // User connected wallet address
    const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();

    // Contract address
    const contractAddress = process.env.SEVENTH_QUEST_SMART_CONTRACT_ADDRESS || '';

    // Get token transfers by contract from 1 - 28 April 2024 
    const responseUserData = await fetch(`${baseUrlChainbase}/token/transfers?chain_id=8453&contract_address=${contractAddress}&address=${eth_addresses}&from_timestamp=1711904400&end_timestamp=1714237200&page=1&limit=100`, {
      headers: {
        'accept': 'application/json',
        'x-api-key': process.env.BASECHAIN_API_KEY || '',
      },
    });

    const userDataResponse = await responseUserData.json();

    if (userDataResponse && userDataResponse.data && userDataResponse.data.length > 0) {
      await stack.track("Swap - (any token) for $SFO", {
        points: 250,
        account: eth_addresses,
        uniqueId: eth_addresses
      });
      console.log('User qualified!');
    } else {
      console.log('User not qualified!');
    }
  

    return c.res({
      image: (
        <div
          style={{
            alignItems: 'center',
            background: '#1A30FF',
            backgroundSize: '100% 100%',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            height: '100%',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
            color: 'white',
            fontFamily: 'Space Mono',
            fontSize: 35,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 0,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={userData.pfp_url.toLowerCase().endsWith('.webp') ? '/images/no_avatar.png' : userData.pfp_url}
              style={{
                width: 100,
                height: 100,
                borderRadius: 100,
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
              }}
              width={200} 
              height={200} 
            />
            <span style={{ marginLeft: '25px' }}>Hi, @{userData.username} 👩🏻‍✈️</span>
          </div>
          <p style={{ fontSize: 30 }}>Task 7 - 250 Points 🎖️</p>
          <p style={{ margin : 0 }}>[ Swap - (any token) for $SFO ]</p>
          {userDataResponse && userDataResponse.data && userDataResponse.data.length > 0 ? (
            <p style={{ fontSize: 24 }}>Completed ✅</p>
          ) : (
            <p style={{ fontSize: 24 }}>Not qualified ❌</p>
          )}
        </div>
      ),
      intents: [
        <Button.Link href='https://app.uniswap.org/explore/tokens/base/0x38e540ca0315bd0de92ed7c4429418bf51826549'>Swap ⌁</Button.Link>,
        <Button action='/seventh-quest'>🔄 Check</Button>,
        <Button action='/sixth-quest'>⏪ Back</Button>,
        <Button action='/eighth-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});


// Eighth Quest
app.frame('/eighth-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': 'NEYNAR_FROG_FM',
      },
    });

    const data = await response.json();
    const userData = data.users[0];

    // User connected wallet address
    const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();

    // Contract address
    const contractAddress = process.env.EIGHTH_QUEST_SMART_CONTRACT_ADDRESS || '';

    // Get token transfers by contract from 1 - 28 April 2024 
    const responseUserData = await fetch(`${baseUrlChainbase}/token/transfers?chain_id=8453&contract_address=${contractAddress}&address=${eth_addresses}&from_timestamp=1711904400&end_timestamp=1714237200&page=1&limit=100`, {
      headers: {
        'accept': 'application/json',
        'x-api-key': process.env.BASECHAIN_API_KEY || '',
      },
    });

    const userDataResponse = await responseUserData.json();

    if (userDataResponse && userDataResponse.data && userDataResponse.data.length > 0) {
      await stack.track("Swap - (any token) for $NYC", {
        points: 250,
        account: eth_addresses,
        uniqueId: eth_addresses
      });
      console.log('User qualified!');
    } else {
      console.log('User not qualified!');
    }
  

    return c.res({
      image: (
        <div
          style={{
            alignItems: 'center',
            background: '#1A30FF',
            backgroundSize: '100% 100%',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            height: '100%',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
            color: 'white',
            fontFamily: 'Space Mono',
            fontSize: 35,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 0,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={userData.pfp_url.toLowerCase().endsWith('.webp') ? '/images/no_avatar.png' : userData.pfp_url}
              style={{
                width: 100,
                height: 100,
                borderRadius: 100,
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
              }}
              width={200} 
              height={200} 
            />
            <span style={{ marginLeft: '25px' }}>Hi, @{userData.username} 👩🏻‍✈️</span>
          </div>
          <p style={{ fontSize: 30 }}>Task 8 - 250 Points 🎖️</p>
          <p style={{ margin : 0 }}>[ Swap - (any token) for $NYC ]</p>
          {userDataResponse && userDataResponse.data && userDataResponse.data.length > 0 ? (
            <p style={{ fontSize: 24 }}>Completed ✅</p>
          ) : (
            <p style={{ fontSize: 24 }}>Not qualified ❌</p>
          )}
        </div>
      ),
      intents: [
        <Button.Link href='https://app.uniswap.org/explore/tokens/base/0xbb769d7a13e3f10957741b2b13e6c2c4c67908fa'>Swap ⌁</Button.Link>,
        <Button action='/eighth-quest'>🔄 Check</Button>,
        <Button action='/seventh-quest'>⏪ Back</Button>,
        <Button action='/ninth-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});

// Uncomment for local server testing
devtools(app, { serveStatic });

export const GET = handle(app)
export const POST = handle(app)
