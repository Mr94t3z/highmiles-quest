import { Button, Frog } from 'frog'
import { handle } from 'frog/vercel'
import { StackClient } from "@stackso/js-core";
import { Alchemy, Network } from "alchemy-sdk";
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
  // hub: neynar({ apiKey: process.env.NEYNAR_API_KEY || '' })
})

// Initialize the client
const stack = new StackClient({
  // Get your API key and point system id from the Stack dashboard (stack.so)
  apiKey: process.env.STACK_API_KEY || '', 
  pointSystemId: parseInt(process.env.STACK_POINT_SYSTEM_ID || ''),
});

// Get the current date
const currentDate = new Date();
// Set the start dates of the range
const startDateString = process.env.QUEST_START_DATE || '';
// Set the end dates of the range
const endDateString = process.env.QUEST_END_DATE || '';
// Convert the start date string to a Date object
const startDate = new Date(startDateString);
// Get the month name from the start date
const questMonth = startDate.toLocaleString('default', { month: 'long' });
// Neynar API base URL
const baseUrlNeynar = process.env.BASE_URL_NEYNAR;
// Reservoir API base URL
const baseUrlReservoir = process.env.BASE_URL_RESEVOIR;
// Zora API base URL
const baseUrlZora = process.env.BASE_URL_ZORA;
// Chainbase API base URL
const baseUrlChainbase = process.env.BASE_URL_CHAINBASE;
// Leaderboard URL
const leaderboardUrl = process.env.PUBLIC_URL_HIGHMILES_QUEST_LEADERBOARD;

// Initial frame
app.frame('/', (c) => {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    // Check if the current date is within the range
    if (currentDate >= startDate && currentDate <= endDate) {
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
                  Welcome to HighMiles© {questMonth} Quest! ✈️
              </div>
          ),
          intents: [
              <Button action='/1st-quest'>🏁 Start Quest</Button>,
              <Button.Link href='https://warpcast.com/~/channel/747air'>✈️ Follow Channel</Button.Link>
          ],
      });
    } else {
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
                  HighMiles© {questMonth} Quest already ended :(
              </div>
          ),
          intents: [
              <Button action='/check-points'>🏁 Start Quest</Button>,
              <Button.Link href={`${leaderboardUrl}`}>✈️ Leaderboard</Button.Link>
          ],
      });
    }
});

// 1st Quest
app.frame('/1st-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  const contractAddress = process.env.FIRST_QUEST_SMART_CONTRACT_ADDRESS || '';

  try {
    const responseUserData = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
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
        <Button action='/1st-quest'>🔄 Refresh</Button>,
        <Button action='/'>⏪ Back</Button>,
        <Button action='/2nd-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});

// 2nd Quest
app.frame('/2nd-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    });
    
    const data = await response.json();
    const userData = data.users[0];
    
    // Fetch token data
    const responseTokenData = await fetch(`${baseUrlZora}/0xA0487Df3ab7a9E7Ba2fd6BB9acDa217D0930217b?offset=0&limit=50&sort_key=CREATED&sort_direction=DESC`);
    
    const tokenData = await responseTokenData.json();
    
    // Filter tokens with is_active: true and start_datetime >= April 1st
    tokenData.results = tokenData.results.filter((token: { mintable: { start_datetime: string | number | Date; is_active: boolean; }; }) => {
      const startDate = new Date('2024-04-01');
      const tokenStartDate = new Date(token.mintable.start_datetime);
      return token.mintable.is_active === true && tokenStartDate >= startDate;
    });

    let qualified = false;
    
    // Check if data is available
    if (tokenData.results && tokenData.results.length > 0) {
      // User connected wallet address
      const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();
    
      // Format the data as collection_address:token_id
      const formattedTokens = tokenData.results.map((token: { collection_address: any; token_id: any; }) => `${token.collection_address}:${token.token_id}`);
    
      // Get user tokens
      const responseUserData = await fetch(`${baseUrlReservoir}/users/${eth_addresses}/tokens/v10?tokens=${formattedTokens.join('&tokens=')}&limit=200`, {
        headers: {
          'accept': 'application/json',
          'x-api-key': process.env.RESERVOIR_API_KEY || '',
        },
      });
    
      const userDataResponse = await responseUserData.json();
    
      // Filter tokens minted between April 1st and April 28th
      const tokensMintedInApril = userDataResponse.tokens.filter((token: { ownership: { acquiredAt: string | number | Date; }; }) => {
        const acquiredDate = new Date(token.ownership.acquiredAt);
        return (
          acquiredDate >= new Date('2024-04-01') &&
          acquiredDate <= new Date('2024-04-28')
        );
      });
    
      if (tokensMintedInApril.length === tokenData.results.length) {
        qualified = true;
        await stack.track("Mint - All 747 Airlines NFTs (made in April)", {
          points: 1250,
          account: eth_addresses,
          uniqueId: eth_addresses
        });
        console.log('Tokens minted in April:', tokensMintedInApril.length);
        console.log('Total tokens:', tokenData.results.length);
        console.log('User qualified!');
      } else {
        console.log('Tokens minted in April:', tokensMintedInApril.length);
        console.log('Total tokens:', tokenData.results.length);
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
          <p style={{ fontSize: 30 }}>Task 2 - 1250 Points 🎖️</p>
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
        <Button action='/2nd-quest'>🔄 Refresh</Button>,
        <Button action='/1st-quest'>⏪ Back</Button>,  
        <Button action='/3rd-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});

// 3rd Quest
app.frame('/3rd-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    });

    const data = await response.json();
    const userData = data.users[0];

    // User connected wallet address
    const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();

    // List of NFTs that can be minted with $crash
    const tokens = [
      '0x6EDed07dd3E9a3215a005eB4E588adF1810B77BC:4',
      '0xB704c29279664F873Dc138e16389C8152A132269:3',
      '0x6C4E4EAE8Ba72407e47d430DA43a450e170CB2d6:3',
      '0x72AA38D5fc500eD2910ed29ac8B8A79a84607500:1',
      '0x6C4E4EAE8Ba72407e47d430DA43a450e170CB2d6:1',
      '0xA0487Df3ab7a9E7Ba2fd6BB9acDa217D0930217b:47',
      '0xA0487Df3ab7a9E7Ba2fd6BB9acDa217D0930217b:46',
      '0x6C4E4EAE8Ba72407e47d430DA43a450e170CB2d6:2',
      '0xd2Fdd31E00826B0a11678d87f791fB4ae84c2809:2'
    ];

    // Fetch user tokens
    const responseUserData = await fetch(`${baseUrlReservoir}/users/${eth_addresses}/tokens/v10?tokens=` + tokens.join('&tokens='), {
      headers: {
          'accept': 'application/json',
          'x-api-key': process.env.RESERVOIR_API_KEY || '',
      },
    });

    const userDataResponse = await responseUserData.json();
    
    if (userDataResponse.tokens.length > 0) {
      await stack.track("Mint - At least 1 747 Airlines NFT (in $crash)", {
        points: 1250,
        account: eth_addresses,
        uniqueId: eth_addresses
      });
      console.log("User qualified");
    } else {
      console.log("User not qualified");
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
          <p style={{ fontSize: 30 }}>Task 3 - 1250 Points 🎖️</p>
          <p style={{ margin : 0 }}>[ Mint - At least 1 747 Airlines NFT (in $crash) ]</p>
          {userDataResponse.tokens.length > 0 ? (
            <p style={{ fontSize: 24 }}>Completed ✅</p>
          ) : (
            <p style={{ fontSize: 24 }}>Not qualified ❌</p>
          )}
        </div>
      ),
      intents: [
        <Button.Link href='https://zora.co/explore/crash'>Mint ⌁</Button.Link>,
        <Button action='/3rd-quest'>🔄 Refresh</Button>,
        <Button action='/2nd-quest'>⏪ Back</Button>,
        <Button action='/4th-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});

// 4th Quest
app.frame('/4th-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
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
        points: 777,
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
          <p style={{ fontSize: 30 }}>Task 4 - 777 Points 🎖️</p>
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
        <Button action='/4th-quest'>🔄 Refresh</Button>,
        <Button action='/3rd-quest'>⏪ Back</Button>,
        <Button action='/5th-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});

// 5th Quest
app.frame('/5th-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
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

    // Check if userDataResponse exists and if tokenCount is greater than 0
    if (userDataResponse && userDataResponse.tokens && userDataResponse.tokens.length > 0) {
      const tokenCount = userDataResponse.tokens[0].ownership.tokenCount;

      if (tokenCount > 0) {
        // Iterate from 1 to the value of tokenCount and execute the corresponding code block
        for (let i = 1; i <= tokenCount; i++) {
          await stack.track(`Mint ${i} - Destinations! Boarding Pass`, {
            points: 2000,
            account: eth_addresses,
            uniqueId: eth_addresses
          });
          console.log(`User qualified for ${i} tokens!`);
        }
      } else {
        console.log('User not qualified.');
      }
    } else {
      console.log('User not qualified.');
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
          <p style={{ fontSize: 30 }}>Task 5 - 2000 Points 🎖️</p>
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
        <Button action='/5th-quest'>🔄 Refresh</Button>,
        <Button action='/4th-quest'>⏪ Back</Button>,
        <Button action='/6th-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});

// 6th Quest
app.frame('/6th-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
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
          <p style={{ fontSize: 30 }}>Task 6 - 250 Points 🎖️</p>
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
        <Button action='/6th-quest'>🔄 Refresh</Button>,
        <Button action='/5th-quest'>⏪ Back</Button>,
        <Button action='/7th-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});

// 7th Quest
app.frame('/7th-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
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
          <p style={{ fontSize: 30 }}>Task 7 - 250 Points 🎖️</p>
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
        <Button action='/7th-quest'>🔄 Refresh</Button>,
        <Button action='/6th-quest'>⏪ Back</Button>,
        <Button action='/8th-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});

// 8th Quest
app.frame('/8th-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    });

    const data = await response.json();
    const userData = data.users[0];

    // User connected wallet address
    const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();

    // Contract address
    const contractAddress = process.env.NINTH_QUEST_SMART_CONTRACT_ADDRESS || '';

    // Get token transfers by contract from 1 - 28 April 2024 
    const responseUserData = await fetch(`${baseUrlChainbase}/token/transfers?chain_id=8453&contract_address=${contractAddress}&address=${eth_addresses}&from_timestamp=1711904400&end_timestamp=1714237200&page=1&limit=100`, {
      headers: {
        'accept': 'application/json',
        'x-api-key': process.env.BASECHAIN_API_KEY || '',
      },
    });

    const userDataResponse = await responseUserData.json();

    if (userDataResponse && userDataResponse.data && userDataResponse.data.length > 0) {
      await stack.track("Swap - (any token) for $CRASH", {
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
          <p style={{ margin : 0 }}>[ Swap - (any token) for $CRASH ]</p>
          {userDataResponse && userDataResponse.data && userDataResponse.data.length > 0 ? (
            <p style={{ fontSize: 24 }}>Completed ✅</p>
          ) : (
            <p style={{ fontSize: 24 }}>Not qualified ❌</p>
          )}
        </div>
      ),
      intents: [
        <Button.Link href='https://app.uniswap.org/explore/tokens/base/0x621e87af48115122cd96209f820fe0445c2ea90e'>Swap ⌁</Button.Link>,
        <Button action='/8th-quest'>🔄 Refresh</Button>,
        <Button action='/7th-quest'>⏪ Back</Button>,
        <Button action='/9th-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});

// 9th Quest - Skip
app.frame('/9th-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    });

    const data = await response.json();
    const userData = data.users[0];

    // User connected wallet address
    // const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();
  

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
          <p style={{ fontSize: 30 }}>Task 9 - 1500 Points 🎖️</p>
          <p style={{ margin : 0 }}>[ LP - $CRASH/$ETH for month of April ]</p>
          {/* {userDataResponse && userDataResponse.data && userDataResponse.data.length > 0 ? (
            <p style={{ fontSize: 24 }}>Completed ✅</p>
          ) : (
            <p style={{ fontSize: 24 }}>Not qualified ❌</p>
          )} */}
        </div>
      ),
      intents: [
        <Button.Link href='https://app.uniswap.org/explore/pools/base/0xb6B2410fCbEe0584314af4F859b7B896616f2E51'>Add LP ⌁</Button.Link>,
        <Button action='/9th-quest'>🔄 Refresh</Button>,
        <Button action='/8th-quest'>⏪ Back</Button>,
        <Button action='/10th-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});

// 10th Quest
app.frame('/10th-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    });

    const data = await response.json();
    const userData = data.users[0];

    // List of channels
    const channels = ["/747air", "/higher", "/imagine", "/enjoy", "/degen"];

    const links = channels.map(channel => "https://warpcast.com/~/channel" + channel);

    const castResponses = await Promise.all(links.map(link => {
      return fetch(`https://api.neynar.com/v1/farcaster/casts?fid=${userData.fid}&parent_url=${encodeURIComponent(link)}&viewerFid=${userData.fid}&limit=1`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'api_key': process.env.NEYNAR_API_KEY || '',
        }
      });
    }));

    const castData = await Promise.all(castResponses.map(response => response.json()));

    // User connected wallet address
    const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();

    // Process each cast data
    castData.forEach((data) => {
      const casts = data.result.casts;
      if (casts.length > 0) {
        const channel = casts[0].parentUrl;
        stack.track("Tip - Casts made in /747Air /higher /imagine /enjoy or /degen channels", {
          points: 250,
          account: eth_addresses,
          uniqueId: eth_addresses
        });
        console.log('User qualified, found cast in -', channel);
      } else {
        console.log('User not casting in this channel!');
      }
    });

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
          <p style={{ fontSize: 30 }}>Task 10 - 250 Points 🎖️</p>
          <p style={{ margin : 0 }}>[ Tip - Casts made in /747air /higher /imagine /enjoy or /degen channels ]</p>
          {castData && castData.some(data => data.result.casts.length > 0) ? (
            <p style={{ fontSize: 24 }}>Completed ✅</p>
          ) : (
            <p style={{ fontSize: 24 }}>Not qualified ❌</p>
          )}
        </div>
      ),
      intents: [
        <Button.Link href='https://warpcast.com/~/compose?text=&embeds[]=https://highmiles-quest.vercel.app/api/april'>Cast ⌁</Button.Link>,
        <Button action='/10th-quest'>🔄 Refresh</Button>,
        <Button action='/9th-quest'>⏪ Back</Button>,
        <Button action='/11th-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});

// 11th Quest
app.frame('/11th-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    });

    const data = await response.json();
    const userData = data.users[0];

    // User connected wallet address
    const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();

    const targetAddress = process.env.COINBASE_COMMERCE_WALLET_ADDRESS || '';

    // Function to extract wallet addresses from all topics in a log
    function parseAddressesFromTopics(log: { topics: any[]; }) {
      const addresses: string[] = [];
      log.topics.forEach(topic => {
        addresses.push(`0x${topic.slice(26)}`); // Slice the topic to get the address
      });
      return addresses;
    }

    let qualifiedTransactions: any[] = [];

    // Function to fetch transaction data from Tatum API
    async function getTransactionData(hash: string) {
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
          const matchingLogs = logs.filter((log: { topics: any[]; }) => parseAddressesFromTopics(log).includes(targetAddress));
          
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

    // Function to get asset transfers from Alchemy API and process them
    async function getAssetTransfers() {

      // Initialize Alchemy client
      const config = {
        apiKey: process.env.ALCHEMY_API_KEY || '',
        network: Network.BASE_MAINNET,
      };

      const alchemy = new Alchemy(config);

      try {
        const res = await alchemy.core.getAssetTransfers({
          fromAddress: eth_addresses,
          toAddress: process.env.COINBASE_COMMERCE_SMART_CONTRACT_ADDRESS,
          excludeZeroValue: true,
          category: ["external"] as any,
        });
    
        const hashes = res.transfers.map((transfer: { hash: any; }) => transfer.hash);
    
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

    // Call the function to get asset transfers and process them
    await getAssetTransfers();

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
          <p style={{ fontSize: 30 }}>Task 11 - 747 Points 🎖️</p>
          <p style={{ margin : 0 }}>[ Buy - 747 Gear from Warpshop Frames ]</p>
          {qualifiedTransactions && qualifiedTransactions.length > 0 ? (
            <p style={{ fontSize: 24 }}>Completed ✅</p>
          ) : (
            <p style={{ fontSize: 24 }}>Not qualified ❌</p>
          )}
        </div>
      ),
      intents: [
        <Button.Link href='https://warpcast.com/boeing747/0x4ea6e3ba'>Buy ⌁</Button.Link>,
        <Button action='/11th-quest'>🔄 Refresh</Button>,
        <Button action='/10th-quest'>⏪ Back</Button>,
        <Button action='/12th-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});

// 12th Quest
app.frame('/12th-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    });

    const data = await response.json();
    const userData = data.users[0];

    // User must follow this fid - @boeing747
    const fidNeedToFollow = "388965";

    const responseUserFollowing = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fidNeedToFollow}&viewer_fid=${userData.fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    });

    const userIsFollow = await responseUserFollowing.json();
    const userFollowing = userIsFollow.users[0].viewer_context.following;

    // User connected wallet address
    const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();

    if (userFollowing) {
      await stack.track("Follow - 747 Air on Warpcast", {
        points: 747,
        account: eth_addresses,
        uniqueId: eth_addresses
      });
      console.log("User is following.");
    } else {
      console.log("User is not following.");
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
          <p style={{ fontSize: 30 }}>Task 12 - 747 Points 🎖️</p>
          <p style={{ margin : 0 }}>[ Follow - 747 Air on Warpcast ]</p>
          {userFollowing ? (
            <p style={{ fontSize: 24 }}>Completed ✅</p>
          ) : (
            <p style={{ fontSize: 24 }}>Not qualified ❌</p>
          )}
        </div>
      ),
      intents: [
        <Button.Link href='https://warpcast.com/boeing747'>Follow ⌁</Button.Link>,
        <Button action='/12th-quest'>🔄 Refresh</Button>,
        <Button action='/11th-quest'>⏪ Back</Button>,
        <Button action='/13th-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});

// 13th Quest
app.frame('/13th-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    });

    const data = await response.json();
    const userData = data.users[0];

    // User must follow this channel - /747air
    const channelNeedToFollow = "747air";

    // Fetching channel data
    const responseChannel = await fetch(`${baseUrlNeynar}/channel?id=${channelNeedToFollow}&viewer_fid=${userData.fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    });

    // Extracting user following status for the channel
    const channelData = (await responseChannel.json()).channel;
    const userFollowing = channelData.viewer_context.following;

    // User connected wallet address
    const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();

    if (userFollowing) {
      await stack.track("Follow - 747 Air Channel on Warpcast", {
        points: 747,
        account: eth_addresses,
        uniqueId: eth_addresses
      });
      console.log("User is following.");
    } else {
      console.log("User is not following.");
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
          <p style={{ fontSize: 30 }}>Task 13 - 747 Points 🎖️</p>
          <p style={{ margin : 0 }}>[ Follow - 747 Air Channel on Warpcast ]</p>
          {userFollowing ? (
            <p style={{ fontSize: 24 }}>Completed ✅</p>
          ) : (
            <p style={{ fontSize: 24 }}>Not qualified ❌</p>
          )}
        </div>
      ),
      intents: [
        <Button.Link href='https://warpcast.com/~/channel/747air'>Follow ⌁</Button.Link>,
        <Button action='/13th-quest'>🔄 Refresh</Button>,
        <Button action='/12th-quest'>⏪ Back</Button>,
        <Button action='/14th-quest'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});

// 14th Quest
app.frame('/14th-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    });

    const data = await response.json();
    const userData = data.users[0];

    // User display name
    const name = userData.display_name;

    // User connected wallet address
    const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();

    if (name.includes('✈️')) {
      await stack.track("Profile Cosmetic - Have ✈️ on Display Name", {
        points: 747,
        account: eth_addresses,
        uniqueId: eth_addresses
      });
      console.log("User has the plane emoji in their Warpcast Display Name.");
    } else {
      console.log("User doesn't have the plane emoji in their Warpcast Display Name.");
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
          <p style={{ fontSize: 30 }}>Task 14 - 747 Points 🎖️</p>
          <p style={{ margin : 0 }}>[ Profile Cosmetic - Have ✈️ on Display Name ]</p>
          {name.includes('✈️') ? (
            <p style={{ fontSize: 24 }}>Completed ✅</p>
          ) : (
            <p style={{ fontSize: 24 }}>Not qualified ❌</p>
          )}
        </div>
      ),
      intents: [
        <Button.Link href='https://warpcast.com/~/settings'>Change ⌁</Button.Link>,
        <Button action='/14th-quest'>🔄 Refresh</Button>,
        <Button action='/13th-quest'>⏪ Back</Button>,
        <Button action='/check-points'>⏩️ Next</Button>,
      ],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      image: <div style={{ color: 'red' }}>An error occurred.</div>,
    });
  }
});

// Check Points
app.frame('/check-points', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    });

    const data = await response.json();
    const userData = data.users[0];

    // User connected wallet address
    const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();

    const point = await stack.getLeaderboardRank(eth_addresses);

    const rank = point.rank;

    const total_point = point.points;

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
          {rank? (
          <p style={{ fontSize: 30 }}>Rank #{rank} 🏁</p>
          ) : (
            <p></p>
          )}
          {total_point? (
          <p style={{ margin : 0 }}>[ You've collected {total_point} points 🎖️ ]</p>
          ) : (
            <p></p>
          )}
          {rank && total_point? (
            <p style={{ fontSize: 24}}>Thank you for your participation in the HighMiles© {questMonth} Quest!</p>
          ) : (
            <p></p>
          )}
          {!rank && !total_point? (
          <p>[ You need to complete at least 1 task. ]</p>
          ) : (
            <p></p>
          )}
        </div>
      ),
      intents: [
        <Button action='/'>🏁 Home</Button>,
        <Button.Link href={`${leaderboardUrl}`}>✈️ Leaderboard</Button.Link>,
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
