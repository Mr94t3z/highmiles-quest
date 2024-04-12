fetch('https://api.neynar.com/v2/farcaster/user/bulk?fids=388965&viewer_fid=3', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'api_key': 'NEYNAR_API_DOCS'
  }
})
.then(response => response.json())
.then(data => {
  // Check if the user is following
  const following = data.users[0].viewer_context.following;
  
  // Log a message based on the following status
  if (following) {
    console.log("User is following.");
  } else {
    console.log("User is not following.");
  }
})
.catch(error => {
  // Handle any errors that occur during the fetch
  console.error('Error:', error);
});
