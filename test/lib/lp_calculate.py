import os
import json
from collections import namedtuple
from web3 import Web3, HTTPProvider
from web3.middleware import geth_poa_middleware
from web3_multicall import Multicall
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup Web3 connection
provider_url = os.getenv("PROVIDER_URL")
web3 = Web3(HTTPProvider(provider_url))
web3.middleware_onion.inject(geth_poa_middleware, layer=0)

# Load ABI and create contract instance
with open('./test/lib/v3_pool_abi.json', 'r') as abi_file:
    v3_pool_abi = json.load(abi_file)
pool_address = '0xb6B2410fCbEe0584314af4F859b7B896616f2E51'
contract = web3.eth.contract(address=pool_address, abi=v3_pool_abi)

# Verify network connection
if not web3.is_connected():
    print("Failed to connect to the Ethereum network!")
else:
    print("Successfully connected to the Ethereum network.")

# Define tick range
MIN_TICK = -887272  # Adjust based on pool
MAX_TICK = 887272   # Adjust based on pool

# Define the Tick namedtuple
Tick = namedtuple("Tick", "liquidityGross liquidityNet feeGrowthOutside0X128 feeGrowthOutside1X128 tickCumulativeOutside secondsPerLiquidityOutsideX128 secondsOutside initialized")

# Initialize sums
amounts0 = 0
amounts1 = 0
liquidity = 0

# Multicall setup
# Ensure the 'call' is invoked for each contract function to create callable object
calls = [contract.functions.ticks(tick).call for tick in range(MIN_TICK, MAX_TICK, 200)]
multi = Multicall(calls)
results = multi()

# Process each tick result
for result in results:
    tickRange = Tick(*result)
    liquidity += tickRange.liquidityNet
    tick_index = results.index(result) * 200 + MIN_TICK  # Calculate tick index from result order
    sqrtPriceLow = 1.0001 ** (tick_index // 2)
    sqrtPriceHigh = 1.0001 ** ((tick_index + 200) // 2)

    # Current sqrt price from slot0
    slot0 = contract.functions.slot0().call()
    sqrtPriceCurrent = slot0[0] / (1 << 96)

    amounts0 += liquidity * (sqrtPriceHigh - sqrtPriceCurrent) / (sqrtPriceCurrent * sqrtPriceHigh)
    amounts1 += liquidity * (sqrtPriceCurrent - sqrtPriceLow)

# Output results
print("Token0 Amount:", amounts0)
print("Token1 Amount:", amounts1)
