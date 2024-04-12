import { init, fetchQuery } from "@airstack/node";

// Initialize Airstack with your API key
init("API_KEY");

// Define your GraphQL query
const query = `
query MyQuery {
    SocialFollowers(
      input: {
        filter: {
          dappName: { _eq: lens }
          identity: {
            _in: [
              "lens/@747"
            ]
          }
        }
        blockchain: ALL
        limit: 200
      }
    ) {
      Follower {
        followerAddress {
          addresses
          socials(input: { filter: { dappName: { _eq: lens } } }) {
            profileName
            profileTokenId
            profileTokenIdHex
          }
        }
        followerProfileId
        followerTokenId
        followingAddress {
          addresses
          domains {
            name
          }
          socials(input: { filter: { dappName: { _eq: lens } } }) {
            profileName
            profileTokenId
            profileTokenIdHex
          }
        }
        followingProfileId
      }
    }
  }
    `;

// Fetch data using the query asynchronously
fetchQuery(query)
  .then(({ data, error }) => {
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      console.log("Data:", data); // Print out the data to understand its structure

      // Access the desired data from the response
      const { SocialFollowers } = data;
      const { Follower } = SocialFollowers;

      // Iterate through each Follower object
      Follower.forEach((follower) => {
        console.log("Follower:", follower);
        // Access other properties of the follower as needed
      });
    }
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
