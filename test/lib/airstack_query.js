import { init, fetchQuery } from "@airstack/node";
import { StackClient } from "@stackso/js-core";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
// Initialize Airstack with your API key
init(process.env.AIRSTACK_API_KEY);

// Initialize the client
const stack = new StackClient({
  // Get your API key and point system id from the Stack dashboard (stack.so)
  apiKey: process.env.STACK_API_KEY || '', 
  pointSystemId: parseInt(process.env.STACK_POINT_SYSTEM_ID || ''),
});

const username = "sirsu"

// Define your GraphQL query
const query = `
    query MyQuery {
      FarcasterCasts(
        input: {
          filter: {
            castedBy: {_eq: "fc_fname:${username}"}
            castedAtTimestamp: {_gte: "2024-04-01T00:00:00Z", _lte:"2024-04-28T00:00:00Z"}
          },
          blockchain: ALL
          limit: 200
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

    // // Access the data
    // const casts = data.FarcasterCasts.Cast;

    // console.log("Data:", casts);

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      // Check if data is null or empty
      if (!data || !data.FarcasterCasts || data.FarcasterCasts.length === 0) {
        console.log("No data found for the provided username.");
      } else {
        console.log("Data:");
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
            console.log(`[${claim_amount}]`, cast); 
            claim_amount++;
            if (claim_amount > 50) break;
          }
        }
      }
    }
    
     
