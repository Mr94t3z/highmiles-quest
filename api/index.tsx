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
  basePath: '/api/quest/april',
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

// // Define the type for the CSV row
// interface TaskData {
//   taskType: string;
//   taskDescription: string;
//   pointsAwarded: number;
//   smartContract: string;
//   links: string;
//   claimAmount: number;
//   deadline: string;
// }

// const apiData: TaskData[] = [];

// // Define unsupported deadline format(s)
// const unsupportedDeadlineFormat = ['Unknown'];

// async function readCSVFromUrl(csvUrl: string) {
//   try {
//     const response = await fetch(csvUrl);

//     // Check if the fetch was successful
//     if (!response.ok) {
//       throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
//     }

//     const csvText = await response.text();
//     const rows = csvText.split('\n');

//     rows.forEach((row, index) => {
//       if (index === 0 || row.trim() === '') return; // Skip header row and empty rows

//       const columns = row.split(',');
//       if (columns.length < 7) { // Assuming 7 columns expected
//         console.error(`Skipping malformed row: ${row}`);
//         return;
//       }

//       const deadline = columns[6].trim();

//       if (!unsupportedDeadlineFormat.includes(deadline)) {
//         const taskData: TaskData = {
//           taskType: columns[0],
//           taskDescription: columns[1],
//           pointsAwarded: parseInt(columns[2]),
//           smartContract: columns[3],
//           links: columns[4],
//           claimAmount: parseInt(columns[5]),
//           deadline: deadline,
//         };
//         apiData.push(taskData);
//       }
//     });

//     console.log('CSV data successfully processed:');
//     console.log(apiData); // Log the loaded CSV data to the console
//   } catch (error) {
//     console.error('Error loading or processing CSV:', error);
//   }
// }


// // Call function to populate data, passing the CSV URL as an argument
// const csvUrl = 'https://raw.githubusercontent.com/Mr94t3z/highmiles-quest/master/api/resources/HighMiles%20Tasks%20-%20April%202024.csv';
// readCSVFromUrl(csvUrl);


// app.frame('/', async (c) => {
//   const {buttonValue} = c;
  
//   if (buttonValue === 'add') {
//     await stack.track("user_signup", {
//       points: -50,
//       account: "0x130946d8dF113e45f44e13575012D0cFF1E53e37"
//     });
    
//     // await stack.track("DailyWalletLogin", {
//     //   points: 15,
//     //   account: "0x2eeb301387D6BDa23E02fa0c7463507c68b597B5",
//     //   uniqueId: `${(new Date()).toISOString().split('T')[0]}-0x2eeb301387D6BDa23E02fa0c7463507c68b597B5`,
//     // });
//   }

//   return c.res({
//     action: '/',
//     image: (
//       <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
//         Perform add points
//       </div>
//     ),
//     intents: [
//       <Button value='add'>Add Points</Button>,
//       <Button action='/frist-quest'>Task 1</Button>,
//     ]
//   })
// })


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

  try {
    const response = await fetch(`${baseUrlNeynar}/user/bulk?fids=397668&viewer_fid=397668`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': 'NEYNAR_FROG_FM',
      },
    });

    const data = await response.json();
    const userData = data.users[0];

    const eth_addresses = userData.verified_addresses.eth_addresses as string;

    console.log(eth_addresses);

    if ( eth_addresses === eth_addresses) {
      await stack.track("Mint - Forage x 747 Airlines	", {
        points: 250,
        account: "0xcB46Bfb7315eca9ECd42D02C1AE174DA4BBFf291"
      });
      
      // await stack.track("DailyWalletLogin", {
      //   points: 15,
      //   account: "0x2eeb301387D6BDa23E02fa0c7463507c68b597B5",
      //   uniqueId: `${(new Date()).toISOString().split('T')[0]}-0x2eeb301387D6BDa23E02fa0c7463507c68b597B5`,
      // });
    } else {
      console.log('Failed to add points!');
    }

    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format
      // Check if the current date is within April 2024
      if (currentDate.getFullYear() === 2024 && currentDate.getMonth() === 3 /* April is 3rd month */) {
        // Check if the current date is before April 29, 2024 (end date)
        if (currentDate.getDate() <= 28) {
          // Log the event with the unique identifier including month and year
            await stack.track("Mint - Forage x 747 Airlines", {
              points: 250,
              account: "0xcB46Bfb7315eca9ECd42D02C1AE174DA4BBFf291",
              uniqueId: `${currentDateString}-0xcB46Bfb7315eca9ECd42D02C1AE174DA4BBFf291`,
            });
        } else {
          console.log("Event cannot be claimed after April 28, 2024.");
        }
      } else {
        console.log("Event can only be claimed in April 2024.");
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
          {/* <p style={{ fontSize: 24 }}> Qualified ✅ </p> */}
          <p style={{ fontSize: 24 }}> Not qualified ❌</p>
        </div>
      ),
      intents: [
        <Button action='/first-quest'>🔄 Check</Button>,
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
        <Button action='/second-quest'>🔄 Check</Button>,
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
        <Button action='/third-quest'>🔄 Check</Button>,
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
