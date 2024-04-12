const apiUrl = 'https://api.chainbase.online/v1/token/transfers';
const queryParams = new URLSearchParams({
  chain_id: '8453',
  contract_address: '0x38e540cA0315BD0De92eD7C4429418Bf51826549',
  address: '0x0b69547B03F6a0bBec1D7731DF7A85D253B71b37',
  from_timestamp: '1711904400',
  end_timestamp: '1714237200',
  page: '1',
  limit: '100'
});
const apiKey = 'demo';

fetch(`${apiUrl}?${queryParams}`, {
  method: 'GET',
  headers: {
    'accept': 'application/json',
    'x-api-key': apiKey
  }
})
.then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
})
.then(data => {
  // Process the data here
  console.log(data);
})
.catch(error => {
  console.error('There was a problem with the fetch operation:', error);
});
