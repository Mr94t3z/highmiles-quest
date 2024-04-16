import Moralis from 'moralis';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

try {
  await Moralis.start({
    apiKey: process.env.MORALIS_API_KEY
  });

  const response = await Moralis.EvmApi.transaction.getTransactionVerbose({
    "chain": "0x2105",
    "transactionHash": "0x9288fbf144bb77a7548403b26e1c351c5f60864f99fd4ad8754c043e4b24f121"
  });

  const logs = response.jsonResponse.logs;

    // Iterate through each log
    logs.forEach(log => {
        // Check if the log has a decoded_event
        if (log.decoded_event) {
            // Check if the decoded_event has params
            if (log.decoded_event.params) {
                // Iterate through each parameter
                log.decoded_event.params.forEach(param => {
                    // Check if the parameter name is "to"
                    if (param.name === "to") {
                        // Check if the value matches the desired value
                        if (param.value === "0x20a2d6c8cabB3179f42F26Eb85fd9C98aC15983e") {
                            // Log success message
                            console.log("Success! Value of 'to' parameter matches the desired value.");
                        } else {
                            // Log failure message
                            console.log("Failure! Value of 'to' parameter does not match the desired value.");
                        }
                    }
                });
            }
        }
    });



} catch (e) {
  console.error(e);
}