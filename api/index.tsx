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
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

// Initialize the client
const stack = new StackClient({
  // Get your API key and point system id from the Stack dashboard (stack.so)
  apiKey: process.env.STACK_API_KEY || '', 
  pointSystemId: parseInt(process.env.STACK_POINT_SYSTEM_ID || ''),
});

// Define the type for the CSV row
interface TaskData {
  taskType: string;
  taskDescription: string;
  pointsAwarded: number;
  smartContract: string;
  links: string;
  claimAmount: number;
  deadline: string;
}

const apiData: TaskData[] = [];

// Define unsupported deadline format(s)
const unsupportedDeadlineFormat = ['Unknown'];

async function readCSVFromUrl(csvUrl: string) {
  try {
    const response = await fetch(csvUrl);

    // Check if the fetch was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    const rows = csvText.split('\n');

    rows.forEach((row, index) => {
      if (index === 0 || row.trim() === '') return; // Skip header row and empty rows

      const columns = row.split(',');
      if (columns.length < 7) { // Assuming 7 columns expected
        console.error(`Skipping malformed row: ${row}`);
        return;
      }

      const deadline = columns[6].trim();

      if (!unsupportedDeadlineFormat.includes(deadline)) {
        const taskData: TaskData = {
          taskType: columns[0],
          taskDescription: columns[1],
          pointsAwarded: parseInt(columns[2]),
          smartContract: columns[3],
          links: columns[4],
          claimAmount: parseInt(columns[5]),
          deadline: deadline,
        };
        apiData.push(taskData);
      }
    });

    console.log('CSV data successfully processed:');
    console.log(apiData); // Log the loaded CSV data to the console
  } catch (error) {
    console.error('Error loading or processing CSV:', error);
  }
}


// Call function to populate data, passing the CSV URL as an argument
const csvUrl = 'https://raw.githubusercontent.com/Mr94t3z/highmiles-quest/master/api/resources/HighMiles%20Tasks%20-%20April%202024.csv';
readCSVFromUrl(csvUrl);


app.frame('/', async (c) => {
  const {buttonValue} = c;
  
  if (buttonValue === 'add') {
    await stack.track("user_signup", {
      points: -50,
      account: "0x130946d8dF113e45f44e13575012D0cFF1E53e37"
    });
    
    // await stack.track("DailyWalletLogin", {
    //   points: 15,
    //   account: "0x2eeb301387D6BDa23E02fa0c7463507c68b597B5",
    //   uniqueId: `${(new Date()).toISOString().split('T')[0]}-0x2eeb301387D6BDa23E02fa0c7463507c68b597B5`,
    // });
  }

  return c.res({
    action: '/',
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
        Perform add points
      </div>
    ),
    intents: [
      <Button value='add'>Add Points</Button>,
    ]
  })
})

// Uncomment for local server testing
devtools(app, { serveStatic });

export const GET = handle(app)
export const POST = handle(app)
