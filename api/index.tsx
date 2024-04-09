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


app.frame('/', async (c) => {
  const {buttonValue} = c;
  
  if (buttonValue === 'add') {
    await stack.track("DailyWalletLogin", {
      points: 15,
      account: "0x2eeb301387D6BDa23E02fa0c7463507c68b597B5",
      uniqueId: `${(new Date()).toISOString().split('T')[0]}-0x2eeb301387D6BDa23E02fa0c7463507c68b597B5`,
    });
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
