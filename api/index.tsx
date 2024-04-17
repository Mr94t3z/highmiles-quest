import { Button, Frog } from 'frog'
import { handle } from 'frog/vercel'
import { StackClient } from "@stackso/js-core";
import { init, fetchQuery } from "@airstack/node";
import { Web3 } from 'web3';
import dotenv from 'dotenv';
import mysql from 'mysql';

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

// Initialize Airstack with API key
init(process.env.AIRSTACK_API_KEY || '');

// Initialize the Web3 provider
const web3 = new Web3(process.env.PROVIDER_URL);

// Create a MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || ''),
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
// Neynar API base URL V2
const baseUrlNeynarV2 = process.env.BASE_URL_NEYNAR_V2;
// Reservoir API base URL
const baseUrlReservoir = process.env.BASE_URL_RESEVOIR;
// Zora API base URL
const baseUrlZora = process.env.BASE_URL_ZORA;
// Chainbase API base URL
const baseUrlChainbase = process.env.BASE_URL_CHAINBASE;
// Chainbase API key
const chainBaseApiKey = process.env.CHAINBASE_API_KEY || '';
// Coingecko API base URL
const baseUrlCoingecko = process.env.BASE_URL_COINGECKO;
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

  // Function to insert data into MySQL
  function insertDataIntoMySQL(address: any, points: any) {
    const sql = `INSERT INTO 1st_quest (address, points) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE points = VALUES(points)`;
    
    connection.query(sql, [address, points], (err) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
        } else {
            console.log('Data inserted into MySQL for address:', address);
        }
    });
  }

  const contractAddress = process.env.FORGE_X_747_AIRLINES_SMART_CONTRACT_ADDRESS || '';

  try {
    const responseUserData = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
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
      // Insert data into database if user is qualified
      insertDataIntoMySQL(eth_addresses, 250);
      await stack.track("Mint - Forage x 747 Airlines", {
        points: 250,
        account: eth_addresses,
        uniqueId: eth_addresses
      });
      console.log('User qualified for task 1!');
    } else {
      console.log('User not qualified for task 1!');
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

  // Function to insert data into MySQL
  function insertDataIntoMySQL(address: any, points: any) {
    const sql = `INSERT INTO 2nd_quest (address, points) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE points = VALUES(points)`;
    
    connection.query(sql, [address, points], (err) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
        } else {
            console.log('Data inserted into MySQL for address:', address);
        }
    });
  }

  try {
    const response = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    });
    
    const data = await response.json();
    const userData = data.users[0];

    const collectionAddress = process.env.COLLECTION_ADDRESS_747_AIRLINES || '';
    
    // Fetch token data
    const responseTokenData = await fetch(`${baseUrlZora}/${collectionAddress}?offset=0&limit=50&sort_key=CREATED&sort_direction=DESC`);
    
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
        // Insert data into database if user is qualified
        insertDataIntoMySQL(eth_addresses, 1250);
        await stack.track("Mint - All 747 Airlines NFTs (made in April)", {
          points: 1250,
          account: eth_addresses,
          uniqueId: eth_addresses
        });
        console.log('Tokens minted in April:', tokensMintedInApril.length);
        console.log('Total tokens:', tokenData.results.length);
        console.log('User qualified for task 2!');
      } else {
        console.log('Tokens minted in April:', tokensMintedInApril.length);
        console.log('Total tokens:', tokenData.results.length);
        console.log('User not qualified for task 2!');
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

  // Function to insert data into MySQL
  function insertDataIntoMySQL(address: any, points: any) {
    const sql = `INSERT INTO 3rd_quest (address, points) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE points = VALUES(points)`;
    
    connection.query(sql, [address, points], (err) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
        } else {
            console.log('Data inserted into MySQL for address:', address);
        }
    });
  }
  
  try {
    const response = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
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
      // Insert data into database if user is qualified
      insertDataIntoMySQL(eth_addresses, 1250);
      await stack.track("Mint - At least 1 747 Airlines NFT (in $crash)", {
        points: 1250,
        account: eth_addresses,
        uniqueId: eth_addresses
      });
      console.log("User qualified for task 3!");
    } else {
      console.log("User not qualified for task 3!");
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

  // Function to insert data into MySQL
  function insertDataIntoMySQL(address: any, points: any) {
    const sql = `INSERT INTO 4st_quest (address, points) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE points = VALUES(points)`;
    
    connection.query(sql, [address, points], (err) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
        } else {
            console.log('Data inserted into MySQL for address:', address);
        }
    });
  }

  try {
    const response = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
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
    const tokenAddress = process.env.IMAGINE_X_747_AIR_NFT_TOKEN_ADDRESS || '';

    // Get user tokens
    const responseUserData = await fetch(`${baseUrlReservoir}/users/${eth_addresses}/tokens/v10?tokens=${tokenAddress}`, {
      headers: {
        'accept': 'application/json',
        'x-api-key': process.env.RESERVOIR_API_KEY || '',
      },
    });

    const userDataResponse = await responseUserData.json();

    if (userDataResponse.tokens.length > 0) {
      // Insert data into database if user is qualified
      insertDataIntoMySQL(eth_addresses, 777);
      await stack.track("Mint - Imagine x 747 Air NFT", {
        points: 777,
        account: eth_addresses,
        uniqueId: eth_addresses
      });
      console.log('User qualified for task 4!');
    } else {
      console.log('User not qualified for task 4!');
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

  let totalPointsEarned = 0;

  // Function to insert data into MySQL
  function insertDataIntoMySQL(address: any, points: any) {
    const sql = `INSERT INTO 5th_quest (address, points) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE points = VALUES(points)`;
    
    connection.query(sql, [address, points], (err) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
        } else {
            console.log('Data inserted into MySQL for address:', address);
        }
    });
  }

  try {
    const response = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
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
    const tokenAddress = process.env.PASSENGER_TICKET_AND_BAGGAGE_CHECK_TOKEN_ADDRESS || '';

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
        // Determine the number of iterations, considering the minimum between tokenCount and 10
        const iterations = Math.min(tokenCount, 10);
        
        // Iterate up to the minimum value between tokenCount and 10
        for (let i = 1; i <= iterations; i++) {

          // Add points earned for each mint
          totalPointsEarned += 2000;
          
          await stack.track(`Mint ${i} - Destinations! Boarding Pass (up to 10 mints)`, {
            points: 2000,
            account: eth_addresses,
            uniqueId: eth_addresses
          });
          // Insert data into database if user is qualified
          insertDataIntoMySQL(eth_addresses, totalPointsEarned);
          console.log(`User qualified for ${i} tokens!`);
        }
      } else {
        console.log('User not qualified for task 5!');
      }
    } else {
      console.log('User not qualified for task 5!');
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
          <p style={{ margin : 0 }}>[ Mint - Destinations! Boarding Pass (up to 10 mints) ]</p>
          {totalPointsEarned > 0 ? (
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

  // Function to insert data into MySQL
  function insertDataIntoMySQL(address: any, points: any) {
    const sql = `INSERT INTO 6th_quest (address, points) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE points = VALUES(points)`;
    
    connection.query(sql, [address, points], (err) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
        } else {
            console.log('Data inserted into MySQL for address:', address);
        }
    });
  }

  try {
    const response = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
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
    const contractAddress = process.env.SFO_SMART_CONTRACT_ADDRESS || '';

    // Define parameters
    const params = new URLSearchParams({
        chain_id: '8453',
        contract_address: contractAddress,
        address: eth_addresses,
        from_timestamp: '1679811200', // 1st April 2024
        end_timestamp: '1680681600', // 28th April 2024
        page: '1',
        limit: '100'
    });
    const headers = {
        'Accept': 'application/json',
        'x-api-key': chainBaseApiKey
    };

    // Function to convert raw token value to human-readable format
    function convertValueToReadable(rawValue: string | number | bigint | boolean, decimals: string | number | bigint | boolean) {
        const rawBigInt = BigInt(rawValue);
        const divisor = BigInt(10) ** BigInt(decimals);
        const readableValue = rawBigInt / divisor;
        return readableValue.toString();
    }

    // Make the HTTP GET request to the API
    const isQualified = await fetch(`${baseUrlChainbase}?${params}`, { headers })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (!data || !data.data || data.data.length === 0) {
        console.log('User not qualified for task 6!');
        return false; // Indicate that the user is not qualified
      }

      // Extract the data from the response
      const transfers = data.data;

      // Filter the transfers based on the specified addresses
      const filteredTransfers = transfers.filter(
        (transfer: { to_address: string }) =>
          transfer.to_address === eth_addresses
      );

      if (filteredTransfers.length === 0) {
        console.log('No transfers found for the specified address.');
        return false; // Indicate that the user is not qualified
      }

      let totalPointsEarned = 0; // Variable to accumulate total points earned

      // Iterate through each transfer data and process it
      for (const transfer of filteredTransfers) {
        const value = convertValueToReadable(transfer.value, 18);
        const hash = transfer.transaction_hash;

        // .0001 pt per $SFO
        const totalPoint = Math.floor(Number(value) * 0.0001);

        // Accumulate the total points earned
        totalPointsEarned += totalPoint;

        // Track points for the current transaction
        await stack.track(`Swap ${value} - (any token) for $SFO on Tx [ ${hash} ]`, {
          points: totalPoint,
          account: eth_addresses,
          uniqueId: eth_addresses
        });

        console.log(`Added ${totalPoint} points for transaction ${hash}`);
      }

      // Insert the total points earned into a database
      insertDataIntoMySQL(eth_addresses, totalPointsEarned);

      console.log('Total points earned:', totalPointsEarned);

      return true; // Indicate that the user is qualified
    })
    .catch(() => {
      return false; // Indicate that the user is not qualified
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
          <p style={{ fontSize: 30 }}>Task 6 - .0001 pt per $SFO 🎖️</p>
          <p style={{ margin : 0 }}>[ Swap - (any token) for $SFO ]</p>
          {isQualified ? (
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

  // Function to insert data into MySQL
  function insertDataIntoMySQL(address: any, points: any) {
    const sql = `INSERT INTO 7th_quest (address, points) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE points = VALUES(points)`;
    
    connection.query(sql, [address, points], (err) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
        } else {
            console.log('Data inserted into MySQL for address:', address);
        }
    });
  }

  try {
    const response = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
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
    const contractAddress = process.env.NYC_SMART_CONTRACT_ADDRESS || '';

    // Define parameters
    const params = new URLSearchParams({
        chain_id: '8453',
        contract_address: contractAddress,
        address: eth_addresses,
        from_timestamp: '1679811200', // 1st April 2024
        end_timestamp: '1680681600', // 28th April 2024
        page: '1',
        limit: '100'
    });
    const headers = {
        'Accept': 'application/json',
        'x-api-key': chainBaseApiKey
    };

    // Function to convert raw token value to human-readable format
    function convertValueToReadable(rawValue: string | number | bigint | boolean, decimals: string | number | bigint | boolean) {
        const rawBigInt = BigInt(rawValue);
        const divisor = BigInt(10) ** BigInt(decimals);
        const readableValue = rawBigInt / divisor;
        return readableValue.toString();
    }

    // Make the HTTP GET request to the API
    const isQualified = await fetch(`${baseUrlChainbase}?${params}`, { headers })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (!data || !data.data || data.data.length === 0) {
        console.log('User not qualified for task 8!');
        return false; // Indicate that the user is not qualified
      }

      // Extract the data from the response
      const transfers = data.data;

      // Filter the transfers based on the specified addresses
      const filteredTransfers = transfers.filter(
        (transfer: { to_address: string }) =>
          transfer.to_address === eth_addresses
      );

      if (filteredTransfers.length === 0) {
        console.log('No transfers found for the specified address.');
        return false; // Indicate that the user is not qualified
      }

      let totalPointsEarned = 0; // Variable to accumulate total points earned

      // Iterate through each transfer data and process it
      for (const transfer of filteredTransfers) {
        const value = convertValueToReadable(transfer.value, 18);
        const hash = transfer.transaction_hash;

        // .0001 pt per $NYC
        const totalPoint = Math.floor(Number(value) * 0.0001);

        // Accumulate the total points earned
        totalPointsEarned += totalPoint;

        // Track points for the current transaction
        await stack.track(`Swap ${value} - (any token) for $NYC on Tx [ ${hash} ]`, {
          points: totalPoint,
          account: eth_addresses,
          uniqueId: eth_addresses
        });

        console.log(`Added ${totalPoint} points for transaction ${hash}`);
      }

      // Insert the total points earned into a database
      insertDataIntoMySQL(eth_addresses, totalPointsEarned);

      console.log('Total points earned:', totalPointsEarned);

      return true; // Indicate that the user is qualified
    })
    .catch(() => {
      return false; // Indicate that the user is not qualified
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
          <p style={{ fontSize: 30 }}>Task 7 - .0001 pt per $NYC 🎖️</p>
          <p style={{ margin : 0 }}>[ Swap - (any token) for $NYC ]</p>
          {isQualified ? (
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

  // Function to insert data into MySQL
  function insertDataIntoMySQL(address: any, points: any) {
    const sql = `INSERT INTO 8th_quest (address, points) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE points = VALUES(points)`;
    
    connection.query(sql, [address, points], (err) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
        } else {
            console.log('Data inserted into MySQL for address:', address);
        }
    });
  }

  try {
    const response = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
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
    const contractAddress = process.env.CRASH_SMART_CONTRACT_ADDRESS || '';

    // Define parameters
    const params = new URLSearchParams({
        chain_id: '8453',
        contract_address: contractAddress,
        address: eth_addresses,
        from_timestamp: '1679811200', // 1st April 2024
        end_timestamp: '1680681600', // 28th April 2024
        page: '1',
        limit: '100'
    });
    const headers = {
        'Accept': 'application/json',
        'x-api-key': chainBaseApiKey
    };

    // Function to convert raw token value to human-readable format
    function convertValueToReadable(rawValue: string | number | bigint | boolean, decimals: string | number | bigint | boolean) {
        const rawBigInt = BigInt(rawValue);
        const divisor = BigInt(10) ** BigInt(decimals);
        const readableValue = rawBigInt / divisor;
        return readableValue.toString();
    }

    // Make the HTTP GET request to the API
    const isQualified = await fetch(`${baseUrlChainbase}?${params}`, { headers })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (!data || !data.data || data.data.length === 0) {
        console.log('User not qualified for task 8!');
        return false; // Indicate that the user is not qualified
      }

      // Extract the data from the response
      const transfers = data.data;

      // Filter the transfers based on the specified addresses
      const filteredTransfers = transfers.filter(
        (transfer: { to_address: string }) =>
          transfer.to_address === eth_addresses
      );

      if (filteredTransfers.length === 0) {
        console.log('No transfers found for the specified address.');
        return false; // Indicate that the user is not qualified
      }

      let totalPointsEarned = 0; // Variable to accumulate total points earned

      // Iterate through each transfer data and process it
      for (const transfer of filteredTransfers) {
        const value = convertValueToReadable(transfer.value, 18);
        const hash = transfer.transaction_hash;

        // 0.0001 pt per $CRASH
        const totalPoint = Math.floor(Number(value) * 0.0001);

        // Accumulate the total points earned
        totalPointsEarned += totalPoint;

        // Track points for the current transaction
        await stack.track(`Swap ${value} - (any token) for $CRASH on Tx [ ${hash} ]`, {
          points: totalPoint,
          account: eth_addresses,
          uniqueId: eth_addresses
        });

        console.log(`Added ${totalPoint} points for transaction ${hash}`);
      }

      // Insert the total points earned into a database
      insertDataIntoMySQL(eth_addresses, totalPointsEarned);

      console.log('Total points earned:', totalPointsEarned);

      return true; // Indicate that the user is qualified
    })
    .catch(() => {
      return false; // Indicate that the user is not qualified
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
          <p style={{ fontSize: 30 }}>Task 8 - .0001 pt per $CRASH 🎖️</p>
          <p style={{ margin : 0 }}>[ Swap - (any token) for $CRASH ]</p>
          {isQualified ? (
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

// 9th Quest
app.frame('/9th-quest', async (c) => {
  const { frameData } = c;
  const { fid } = frameData as unknown as { buttonIndex?: number; fid?: string };

  // Function to insert data into MySQL
  function insertDataIntoMySQL(address: any, points: any) {
      const sql = `INSERT INTO 9th_quest (address, points) VALUES (?, ?) 
                  ON DUPLICATE KEY UPDATE points = VALUES(points)`;

      connection.query(sql, [address, points], (err) => {
          if (err) {
              console.error('Error inserting data into MySQL:', err);
          } else {
              console.log('Data inserted into MySQL for address:', address);
          }
      });
  }

  try {
      const response = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
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

      const crashContractAddress = process.env.CRASH_SMART_CONTRACT_ADDRESS;
      const poolsContractAddress = process.env.WETH_CRASH_POOLS_SMART_CONTRACT_ADDRESS;

      const responseTransaction = await fetch(`https://api.chainbase.online/v1/token/transfers?chain_id=8453&contract_address=${crashContractAddress}&address=${eth_addresses}&page=1&limit=100`, {
          method: 'GET',
          headers: {
              'accept': 'application/json',
              'x-api-key': 'demo'
          }
      });

      const dataTransaction = await responseTransaction.json();

      if (!dataTransaction || dataTransaction.data === null || dataTransaction.count === 0) {
          console.log('No transaction data available!');
      }

      let totalPointsEarned = 0;

      if (dataTransaction && dataTransaction.data && dataTransaction.data.length > 0) {
          const filteredTransactions = dataTransaction.data.filter((item: { to_address: string | undefined; }) => item.to_address === poolsContractAddress);

          const transactionHashes = filteredTransactions.map((transaction: { transaction_hash: any; }) => transaction.transaction_hash);

          let transactionCounter = 1;
          for (const transactionHash of transactionHashes) {
              try {
                  console.log(`Processing transaction hash ${transactionCounter}: ${transactionHash}`);
                  // Fetch transaction details
                  const txDetailResponse = await fetch(`https://api.chainbase.online/v1/tx/detail?chain_id=8453&hash=${transactionHash}`, {
                      method: 'GET',
                      headers: {
                          'accept': 'application/json',
                          'x-api-key': 'demo'
                      }
                  });

                  if (!txDetailResponse.ok) {
                      throw new Error('Network response was not ok');
                  }

                  const detailData = await txDetailResponse.json();
                  const valueInWei = detailData.data.value;
                  const valueInEth = web3.utils.fromWei(valueInWei, 'ether');

                  // Fetch current price of Ether in USD from CoinGecko API
                  const priceResponse = await fetch(`${baseUrlCoingecko}/simple/price?ids=ethereum&vs_currencies=usd`);

                  if (!priceResponse.ok) {
                      throw new Error('Failed to fetch price data from CoinGecko API');
                  }

                  const priceData = await priceResponse.json();

                  if (priceData && priceData.ethereum && priceData.ethereum.usd) {
                      const etherPriceInUSD = priceData.ethereum.usd;
                      const valueInUSD = Number(valueInEth) * etherPriceInUSD;
                      const totalPoint = Math.floor(valueInUSD * 0.001);

                      // Add points earned from current transaction to total points
                      totalPointsEarned += totalPoint;

                      // Insert data into database if user is qualified
                      insertDataIntoMySQL(eth_addresses, totalPointsEarned);

                      if (totalPointsEarned > 0) {

                          // Track points for each transaction
                          await stack.track(`LP ${valueInEth} - $CRASH/$ETH for month of April on Tx : [ ${transactionHash} ]`, {
                              points: totalPoint,
                              account: eth_addresses,
                              uniqueId: eth_addresses
                          });
                          console.log(`Added ${totalPoint} points for transaction ${transactionCounter}`);
                      } else {
                          console.log(`User not qualified for transaction ${transactionCounter}`);
                      }
                  } else {
                      console.error('Failed to get valid price data for Ethereum from CoinGecko API');
                  }

                  transactionCounter++;
              } catch (error) {
                  console.error(`Error fetching transaction details for transaction ${transactionCounter}:`, error);
              }
          }
          // Log total points earned after processing all transactions
          console.log('Total points earned from all transactions:', totalPointsEarned);
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
                  <p style={{ fontSize: 30 }}>Task 9 - .001 pt per $1 🎖️</p>
                  <p style={{ margin: 0 }}>[ LP - $CRASH/$ETH for month of April ]</p>
                  {totalPointsEarned > 0 ? (
                      <p style={{ fontSize: 24 }}>Completed ✅</p>
                  ) : (
                      <p style={{ fontSize: 24 }}>Not qualified ❌</p>
                  )}
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

  // Function to insert data into MySQL
  function insertDataIntoMySQL(address: any, points: any) {
    const sql = `INSERT INTO 10th_quest (address, points) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE points = VALUES(points)`;

    connection.query(sql, [address, points], (err) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
        } else {
            console.log('Data inserted into MySQL for address:', address);
        }
    });
  }

  try { 
    const response = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
    });

    const dataResponse = await response.json();
    const userData = dataResponse.users[0];

    // User connected wallet address
    const eth_addresses = userData.verified_addresses.eth_addresses.toString().toLowerCase();

    // Define FarcasterCasts GraphQL query
    const query = `
      query MyQuery {
        FarcasterCasts(
          input: {
            filter: {
              castedBy: {_eq: "fc_fname:${userData.username}"}
              castedAtTimestamp: {_gte: "2024-04-01T00:00:00Z"}
            },
            blockchain: ALL
          }
        ) 
        {
          Cast {
            castedAtTimestamp
            url
            text
            channel {
              channelId
            }
          }
        }
      }
    `;

    const { data, error } = await fetchQuery(query);

    let totalPointsEarned = 0; // Declare totalPointsEarned outside of the else block

    if (error) {
        console.error("Error fetching data:", error);
    } else {
        // Check if data is null or empty
        if (!data || !data.FarcasterCasts || data.FarcasterCasts.Cast.length === 0) {
            console.log("No found cast tip for this user.");
        } else {
            const regex = /\b\d+\s?\$crash\b/gi; // Regular expression to match "{amount} $crash" or "{amount} $CRASH" or "{amount} $Crash"
            let claim_amount = 1;
            for (const cast of data.FarcasterCasts.Cast) {
                if (
                    cast.channel &&
                    (cast.channel.channelId === '747air' ||
                    cast.channel.channelId === 'higher' ||
                    cast.channel.channelId === 'imagine' ||
                    cast.channel.channelId === 'enjoy' ||
                    cast.channel.channelId === 'degen') &&
                    cast.text.match(regex)
                ) {
                    // Add points earned for each cast
                    totalPointsEarned += 10;

                    // Insert points for each cast
                    await stack.track(`Tip ${claim_amount} - Casts made in /747air /higher /imagine /enjoy or /degen channels (up to 50 tip)`, {
                        points: 10,
                        account: eth_addresses,
                        uniqueId: eth_addresses
                    });
                    console.log(`Found ${claim_amount} cast tip for this user.`);
                    claim_amount++;

                    if (claim_amount > 50) break;
                }
            }
            // Insert totalPointsEarned into MySQL
            insertDataIntoMySQL(eth_addresses, totalPointsEarned); 
            console.log('Total points earned:', totalPointsEarned);
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
          <p style={{ fontSize: 30 }}>Task 10 - 10 pt per tip 🎖️</p>
          <p style={{ margin : 0 }}>[ Tip - Casts made in /747air /higher /imagine /enjoy or /degen channels (up to 50 tip) ]</p>
          {totalPointsEarned > 0 ? (
            <p style={{ fontSize: 24 }}>Completed ✅</p>
          ) : (
            <p style={{ fontSize: 24 }}>Not qualified ❌</p>
          )}
        </div>
      ),
      intents: [
        <Button.Link href='https://crash-tipping.vercel.app/'>Tip ⌁</Button.Link>,
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

  // Function to insert data into MySQL
  function insertDataIntoMySQL(address: any, points: any) {
    const sql = `INSERT INTO 11th_quest (address, points) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE points = VALUES(points)`;

    connection.query(sql, [address, points], (err) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
        } else {
            console.log('Data inserted into MySQL for address:', address);
        }
    });
  }

  try {
    const response = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
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
        if (topic.length >= 26) {
          addresses.push(`0x${topic.slice(26)}`);
        } else {
          console.error("Topic string too short:", topic);
        }
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

    async function getAssetTransfers() {
      const apiKey = process.env.ALCHEMY_API_KEY;
      const toAddress = process.env.COINBASE_COMMERCE_SMART_CONTRACT_ADDRESS;
  
      const body = JSON.stringify({
          id: 1,
          jsonrpc: "2.0",
          method: "alchemy_getAssetTransfers",
          params: [{
              fromAddress: eth_addresses,
              toAddress: toAddress,
              excludeZeroValue: true,
              category: ["external"],
          }]
      });
  
      try {
          const response = await fetch(`https://base-mainnet.g.alchemy.com/v2/${apiKey}`, {
              method: 'POST',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              },
              body: body
          });
  
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
  
          const data = await response.json();
          const transfers = data.result.transfers;
          const hashes = transfers.map((transfer: { hash: any; }) => transfer.hash);
  
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
              let totalPointsEarned = 0; // Initialize total points earned
            
              for (let i = 1; i <= qualifiedTransactions.length; i++) {

                  // Add points for each transaction
                  totalPointsEarned += 747;

                  await stack.track(`Buy ${i} - 747 Gear from Warpshop Frames (up to 5 items)`, {
                      points: 747,
                      account: eth_addresses,
                      uniqueId: eth_addresses
                  });
                  console.log(`User qualified for transaction ${i}!`);
              }
              // Insert the total points earned into the database
              insertDataIntoMySQL(eth_addresses, totalPointsEarned);

              console.log('Total points earned:', totalPointsEarned);
          } else {
              console.log('User not qualified for task 11!');
          }
      } catch (error) {
          console.error("Error getting asset transfers:", error);
      }
    }
    
    try {
        await getAssetTransfers();
    } catch (error) {
        console.error("Failed to get asset transfers:", error);
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
          <p style={{ fontSize: 30 }}>Task 11 - 747 Points 🎖️</p>
          <p style={{ margin : 0 }}>[ Buy - 747 Gear from Warpshop Frames (up to 5 items) ]</p>
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

  // Function to insert data into MySQL
  function insertDataIntoMySQL(address: any, points: any) {
    const sql = `INSERT INTO 12th_quest (address, points) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE points = VALUES(points)`;
    
    connection.query(sql, [address, points], (err) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
        } else {
            console.log('Data inserted into MySQL for address:', address);
        }
    });
  }

  try {
    const response = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
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

    const responseUserFollowing = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=${fidNeedToFollow}&viewer_fid=${userData.fid}`, {
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
      // Insert data into database if user is qualified
      insertDataIntoMySQL(eth_addresses, 747);

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

  // Function to insert data into MySQL
  function insertDataIntoMySQL(address: any, points: any) {
    const sql = `INSERT INTO 13th_quest (address, points) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE points = VALUES(points)`;
    
    connection.query(sql, [address, points], (err) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
        } else {
            console.log('Data inserted into MySQL for address:', address);
        }
    });
  }

  try {
    const response = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
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
    const responseChannel = await fetch(`${baseUrlNeynarV2}/channel?id=${channelNeedToFollow}&viewer_fid=${userData.fid}`, {
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
      // Insert data into database if user is qualified
      insertDataIntoMySQL(eth_addresses, 747);

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

  // Function to insert data into MySQL
  function insertDataIntoMySQL(address: any, points: any) {
    const sql = `INSERT INTO 14th_quest (address, points) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE points = VALUES(points)`;
    
    connection.query(sql, [address, points], (err) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
        } else {
            console.log('Data inserted into MySQL for address:', address);
        }
    });
  }

  try {
    const response = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
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
      // Insert data into database if user is qualified
      insertDataIntoMySQL(eth_addresses, 747);

      await stack.track("Profile Cosmetic - Have ✈️ on Display Name", {
        points: 747,
        account: eth_addresses,
        uniqueId: eth_addresses
      });
      console.log("User have ✈️ on Display Name");
    } else {
      console.log("User doesn't have ✈️ on Display Name");
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

  // Function to insert data into MySQL
  function insertDataIntoMySQL(address: any, points: any) {
    const sql = `INSERT INTO final_points (address, points) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE points = VALUES(points)`;
    
    connection.query(sql, [address, points], (err) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
        } else {
            console.log('Data inserted into MySQL for address:', address);
        }
    });
  }

  // Function to query points by address from each quest table and calculate the total points
  async function getPointsByAddress(address: string): Promise<number> {
    let totalPoints = 0;

    // Iterate through each quest table and sum up the points
    for (let i = 1; i <= 14; i++) {
      let tableName;
      if (i === 1) {
        tableName = '1st_quest';
      } else if (i === 2) {
        tableName = '2nd_quest';
      } else if (i === 3) {
        tableName = '3rd_quest';
      } else {
        tableName = `${i}th_quest`;
      }

      const query = `SELECT points FROM ${tableName} WHERE address = ?`;

      await new Promise<void>((resolve, reject) => {
        connection.query(query, [address], (err, results) => {
          if (err) {
            console.error(`Error querying points from ${tableName}:`, err);
            reject(err);
            return;
          }

          if (results.length > 0) {
            totalPoints += results[0].points;
          }

          resolve();
        });
      });
    }

    return totalPoints;
  }

  try {
    const response = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=${fid}&viewer_fid=${fid}`, {
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

    // Ensure that point data is not null
    if (point && point.points) {
      const total_point = point.points;

      // If there are total points, proceed to aggregate and store them
      if (total_point) {
        // Get total points from all quest tables
        const totalPoints = await getPointsByAddress(eth_addresses);

        // Insert total points into the final_points table
        insertDataIntoMySQL(eth_addresses, totalPoints);
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
          {point && point.rank? (
          <p style={{ fontSize: 30 }}>Rank #{point.rank} 🏁</p>
          ) : (
            <p></p>
          )}
          {point && point.points? (
          <p style={{ margin : 0 }}>[ You've collected {point.points} points 🎖️ ]</p>
          ) : (
            <p>[ You need to complete at least 1 task. ]</p>
          )}
          {point && point.points ? (
            <p style={{ fontSize: 24}}>Thank you for your participation in the HighMiles© {questMonth} Quest!</p>
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
