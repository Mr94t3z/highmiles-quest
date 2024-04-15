import os
from dotenv import load_dotenv
from web3 import Web3
import json

# Load variables from .env file
load_dotenv()

# Load ABI from JSON file
with open('./test/lib/v3_pool_abi.json', 'r') as abi_file:
    v3_pool_abi = json.load(abi_file)

    
provider_url = os.getenv("PROVIDER_URL")

web3 = Web3(Web3.HTTPProvider(provider_url))

# Verify connection is successful
if not web3.is_connected():
    print("Failed to connect to the Ethereum network!")
else:
    print("Successfully connected to the Ethereum network.")

pool_address = '0xb6B2410fCbEe0584314af4F859b7B896616f2E51'

# Creating the pool contract instance
pool_contract = web3.eth.contract(address=pool_address, abi=v3_pool_abi)

# Example to fetch and print the slot0 data which contains current price information
try:
    slot0 = pool_contract.functions.slot0().call()
    current_sqrt_price_x96 = slot0[0]
    current_tick = slot0[1]
    price = (current_sqrt_price_x96 ** 2) >> 192  # Convert sqrtPriceX96 to a standard price
    print(f"Current price: {price}, Current tick: {current_tick}")
except Exception as e:
    print(f"Failed to fetch pool data: {str(e)}")