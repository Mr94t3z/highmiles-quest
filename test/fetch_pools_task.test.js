const wallet_addr = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

fetch(`https://api.chainbase.online/v1/account/portfolios?address=${wallet_addr}`, {
    method: 'GET',
    headers: {
        'x-api-key': "2eyn4z8jyMyUl4HK2Vu0sKVBFsv",
        'accept': 'application/json'
    }
}).then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.text(); // Fetch the response body as text
}).then(text => {
    console.log("Response text:", text); // Log the response text
    const data = JSON.parse(text); // Attempt to parse the response text as JSON
    console.log(data.data); // Log the parsed JSON data
}).catch(error => console.error(error));
