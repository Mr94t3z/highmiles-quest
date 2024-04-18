import { StackClient } from "@stackso/js-core";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize the client
const stack = new StackClient({
    // Get your API key and point system id from the Stack dashboard (stack.so)
    apiKey: process.env.STACK_API_KEY || '', 
    pointSystemId: parseInt(process.env.STACK_POINT_SYSTEM_ID || ''),
  });


const point = await stack.getPoints("0x130946d8dF113e45f44e13575012D0cFF1E53e37");

console.log(point);