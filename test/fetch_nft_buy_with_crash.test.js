const tokens = [
    '0x6EDed07dd3E9a3215a005eB4E588adF1810B77BC:4',
    '0xB704c29279664F873Dc138e16389C8152A132269:3',
    '0x6C4E4EAE8Ba72407e47d430DA43a450e170CB2d6:3',
    '0x72AA38D5fc500eD2910ed29ac8B8A79a84607500:1',
    '0x6C4E4EAE8Ba72407e47d430DA43a450e170CB2d6:1',
    '0xA0487Df3ab7a9E7Ba2fd6BB9acDa217D0930217b:47',
    '0xA0487Df3ab7a9E7Ba2fd6BB9acDa217D0930217b:46',
    '0x6C4E4EAE8Ba72407e47d430DA43a450e170CB2d6:2',
    '0xd2Fdd31E00826B0a11678d87f791fB4ae84c2809:2'
];

const eth_addresses = "0x7ca5EEE289d429A26F7F5dbE8e233f6c67ec0E44";

fetch(`https://api-base.reservoir.tools/users/${eth_addresses}/tokens/v10?tokens=` + tokens.join('&tokens='), {
    method: 'GET',
    headers: {
        'accept': '*/*',
        'x-api-key': 'demo-api-key'
    }
})
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
})
.then(data => {
    if (data.tokens.length === 0) {
        console.log("User not qualified");
        return;
    }
    console.log("User qualified");
    console.log(data); // Process the fetched data here
})
.catch(error => {
    console.error('Error:', error);
});
