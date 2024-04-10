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
const baseUrlNeynar = 'https://api.neynar.com/v2/farcaster';
// Reservoir API base URL
const baseUrlReservoir = 'https://api-base.reservoir.tools';


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
          <p>Hi Passengers! ✋🏻</p>
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

  // const fid = 254520;

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

    const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();

    const responseUserCollected = await fetch(`${baseUrlReservoir}/users/${eth_addresses}/collections/v4?collection=${contractAddress}`, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'x-api-key': process.env.RESERVOIR_API_KEY || '',
      }
    })

    const userCollected = await responseUserCollected.json();

    console.log('User Collected:', userCollected);

    if (userCollected.collections.length > 0) {
      await stack.track("Mint - Forage x 747 Airlines", {
        points: 250,
        account: eth_addresses,
        uniqueId: eth_addresses
      });
      console.log('Points added successfully!');
    } else {
      console.log('Failed to add points!');
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
            <p style={{ fontSize: 24 }}>Qualified ✅</p>
          ) : (
            <p style={{ fontSize: 24 }}>Not qualified ❌</p>
          )}
        </div>
      ),
      intents: [
        <Button action='/first-quest'>🔄 Refresh</Button>,
        <Button.Link href='https://forage.xyz/p/01HT3MC4CTKPVQWQ6TX052RXGF	'>Mint ⚡️</Button.Link>,
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
          {/* <p style={{ fontSize: 24 }}> Qualified ✅ </p> */}
          <p style={{ fontSize: 24 }}> Not qualified ❌</p>
        </div>
      ),
      intents: [
        <Button action='/first-quest'>⏪ Back</Button>,
        <Button action='/second-quest'>🔄 Refresh</Button>,
        <Button.Link href='https://zora.co/collect/base:0xa0487df3ab7a9e7ba2fd6bb9acda217d0930217b'>⚡️ Mint</Button.Link>,  
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


// Third Quest
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
          {/* <p style={{ fontSize: 24 }}> Qualified ✅ </p> */}
          <p style={{ fontSize: 24 }}> Not qualified ❌</p>
        </div>
      ),
      intents: [
        <Button action='/second-quest'>⏪ Back</Button>,
        <Button action='/third-quest'>🔄 Refresh</Button>,
        <Button.Link href='https://zora.co/explore/crash'>⚡️ Mint</Button.Link>,  
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

// Uncomment for local server testing
devtools(app, { serveStatic });

export const GET = handle(app)
export const POST = handle(app)
