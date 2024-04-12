const channels = ["/747air", "/higher", "/imagine", "/enjoy", "/degen"];
const links = channels.map(channel => "https://warpcast.com/~/channel" + channel);
const apiKey = 'NEYNAR_API_DOCS';

links.forEach(link => {
  fetch(`https://api.neynar.com/v1/farcaster/casts?fid=1841&parent_url=${encodeURIComponent(link)}&viewerFid=25440&limit=1`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'api_key': apiKey
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log("Link:", link);
    console.log("Data:", data); // Log the response data
    const casts = data.result.casts;
    if (casts.length > 0) {
      const castText = casts[0].text; // Accessing cast text
      console.log("Cast Text:", castText); // Log the cast text
    } else {
      console.log("No casts available for this link");
    }
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
});
