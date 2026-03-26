# Igra Network — Comprehensive Skill

Igra is a Layer 2 EVM-compatible blockchain built on Kaspa's BlockDAG proof-of-work consensus. It offers sub-second block times, ~30-second practical finality, and full Ethereum tooling compatibility.

For the latest information, use the Igra Gitbook MCP server:
`https://igra-labs.gitbook.io/~gitbook/mcp`

Official documentation: https://igra-labs.gitbook.io/igralabs-docs/

## Networks

### Igra Mainnet

| Parameter | Value |
|---|---|
| Network Name | Igra Mainnet |
| Chain ID | 38833 (0x97B1) |
| Currency | iKAS (18 decimals) |
| RPC URL | `https://rpc.igralabs.com:8545` |
| Block Explorer | https://explorer.igralabs.com |
| L1 Prefix | 97b1 |
| Status | Active |
| Faucet | https://faucet.igralabs.com |

### Galleon Testnet

| Parameter | Value |
|---|---|
| Network Name | IGRA Galleon Testnet |
| Chain ID | 38836 (0x97B4) |
| Currency | iKAS (18 decimals) |
| RPC URL | `https://galleon-testnet.igralabs.com:8545` |
| Block Explorer | https://explorer.galleon-testnet.igralabs.com |
| Status | Active Testnet |
| Faucet | https://faucet.igralabs.com |

## Block Parameters

| Parameter | Value |
|---|---|
| Block Time | ~1 second (1 BPS) |
| Finality (practical) | ~30 seconds |
| Finality (formal) | 12 hours (Kaspa finality protocol) |
| Base Fee | 1 wei |
| Min Gas Price (mainnet) | 1000 Gwei |
| Min Gas Price (testnet) | ~2000 Gwei |
| Block Gas Limit | 10,000,000,000 |
| Max Transaction Size | ~21 KB (Kaspa L1 DA limit) |
| EIP-1559 | Active |

## Critical Developer Notes

### Gas Price

Always use explicit legacy `gasPrice`. The RPC returns incorrect EIP-1559 `maxFeePerGas` values that are below the minimum protocol fee floor.

```javascript
// Correct — explicit gasPrice
const tx = await wallet.sendTransaction({
  to: recipient,
  value: ethers.parseEther('1'),
  gasPrice: ethers.parseUnits('1100', 'gwei'), // mainnet, above 1000 min
});

// WRONG — do not rely on EIP-1559 defaults
// const tx = await wallet.sendTransaction({ to, value }); // will likely fail
```

Minimum protocol fee per gas: **1000 Gwei** (mainnet), **~2000 Gwei** (testnet). Use slightly above (1100/2200) for safety.

### Transaction Ordering

Igra uses **FIFO ordering**, not gas-price ordering. Transactions are processed in arrival order. This means:
- MEV extraction strategies do not work
- You cannot "speed up" a pending transaction by increasing gas
- Reorged transactions are discarded, not re-injected to mempool

### Transaction Size Limit

Maximum ~21 KB. Large contract deployments may need to be split. Most transactions are well under this limit.

### Finality Confirmation Guide

| Use Case | Confirmations | Time |
|---|---|---|
| Low-value transfers | 10 | ~10 seconds |
| DEX swaps, DeFi | 30 | ~30 seconds |
| High-value transfers | 250 | ~4 minutes |
| Exchange deposits | 500 (or `finalized` block tag) | ~8 minutes |
| Formal compliance | — | 12 hours |

The `finalized` block tag in RPC returns blocks older than the 12-hour pruning window.

## EVM Compatibility

Igra is fully EVM-compatible. Standard Ethereum tooling works without modification:

- **Languages**: Solidity, Vyper
- **Frameworks**: Hardhat, Foundry, Truffle
- **Libraries**: ethers.js, web3.js, viem
- **Wallets**: MetaMask, Ledger, Tangem, any EVM wallet
- **Opcodes**: Full support, no custom opcodes
- **Transaction types**: Legacy, EIP-2930, EIP-1559, EIP-4844 (type supported at EVM level; Igra uses Kaspa L1 for DA, not Ethereum blobs)
- **EVM fork level**: Prague/Pectra active from genesis (all modern opcodes available)

## Bridging (KAS to iKAS)

### Mainnet

Send a valid entry transaction to lock KAS on L1 and receive iKAS on L2:

```
kaspa:ppvnxxzm0rr37zpnwux2f2ntvfpr4uqdpm7zsvsztg3en92r7gs0wkmr72q9n
```

Early-stage bridge. Minimum entry: 100 KAS (`IGRA_ENTRY_MIN_AMOUNT = 10000000000` SOMPI). Recommended max: 300 KAS.

### Testnet

Options:
- **Faucet**: https://faucet.igralabs.com (testnet iKAS directly)
- **Kaspa Testnet Faucet**: https://faucet-tn10.kaspanet.io (get tKAS first)
- **Kasperia Wallet**: Bridge tKAS to iKAS
- **KatBridge**: https://galleon-tn-kas.katbridge.com
- **Direct Entry** to: `kaspatest:qqmstl2znv9tsfgcmj9shme82my867tapz7pdu4ztwdn6sm9452jj5mm0sxzw`

### Entry Transaction Protocol

L1 Payload format: `[0x92] [L2Data (28 bytes)] [4-byte Nonce]`

L2Data: `[20-byte recipient address] [8-byte amount in SOMPI (10^-8 KAS), little-endian]`

The equivalent iKAS is scaled to 10^-18 units and minted to the L2 address as an EVM "withdrawal" per EIP-4895.

Requirements:
- L1 Tx ID must start with `TX_ID_PREFIX = 97b1` (mined by varying the nonce)
- The L1 transaction must create the KAS Locking UTXO using the Entry Locking Script

## Network Parameters (Mainnet)

| Parameter | Value |
|---|---|
| IGRA_CHAIN_ID | 38833 |
| TX_ID_PREFIX | 97b1 |
| MIN_PROTOCOL_FEE_PER_GAS_GWEI | 1000 |
| IGRA_ENTRY_MIN_AMOUNT | 10000000000 (100 KAS) |
| IGRA_LAUNCH_DAA_SCORE | 366020000 |
| L1_REFERENCE_TIMESTAMP | 1771977542 |
| L1_REFERENCE_DAA_SCORE | 365578320 |

## Mainnet Contract Addresses (Chain ID: 38833)

### Core Protocol

| Contract | Address |
|---|---|
| Diamond Proxy | `0xc24Df70E408739aeF6bF594fd41db4632dF49188` |
| IGRA Token | `0x093d77d397F8acCbaee0820345E9E700B1233cD1` |
| Vesting Pools | `0xc9c88C5b4a0E5ae4C0812F3bc04A5FeA9ffC580b` |
| Stake Rewards Controller | `0xF4BF5afdCC70eD80737778625Ddb1c0Ce89EC42c` |
| Fee Proxy | `0x0000000000000000000000000000000000000FEE` |
| Fee Implementation | `0x3b34f39f49aF761615Aa569713f96c04112969d2` |

### Attestation System

| Contract | Address |
|---|---|
| Config Init | `0x87f01B5fe0BA991EEA5b78904E920Fd8290925b8` |
| Config Facet | `0x852423E5222ABBB88173452bBd83446fa526346e` |
| Staking | `0xBc8fD7c21a0A3CbbE7e57366D648C62DFAe32c4B` |
| Attester | `0xe01A13ab23AaeCE1c80419595E1cF1cFC8DF662C` |
| Challenger | `0x051214558d2c3c5cA49162E4B6C93638713A6040` |
| L2 Oracle | `0x7c8edd6eB8959cCcDA63D7A3e956Bb9C00BaD67c` |

### Governance

| Contract | Address |
|---|---|
| Governance | `0xB3300fcC2F3EF3DeCdF8B1f710c21666f33Cbf18` |
| IGRA Voting Power | `0x50BAc71D1B32Fa6030007b5E72dbBB4fF48c1B39` |

### Quex Oracle (Price Feeds)

| Pair | Address |
|---|---|
| Quex Core | `0xC3546441897D9c87B3808c9402Bcb0655F238541` |
| Request Oracle Pool | `0x7311069095613B2776DB66e0E88f8E4DC63cfC67` |
| KAS/USD | `0xd4D0cbbd05FBf1cAEb4c56956D992C5CCCdcD88e` |
| BTC/USD | `0xE07F8a0C78a4B843A65DeB8e12Af9121EAb84dB2` |
| ETH/USD | `0x8b8B506B8BADFA687EAF2467ca9b0C74e1f9633F` |
| USDT/USD | `0x27629A0b955F0baE31fEF908FBF6051A8cd6D735` |
| USDC/USD | `0x06Bc2d4ed8Caf9DFfa8EAead325e7Ecb4E1489a2` |
| DAI/USD | `0x06e6a0E09871a1c0D039DC55dc64421DA7B4E723` |
| BNB/USD | `0x002d29824e52B1d323927219C7C7b81e14EdF22f` |

## Igra DAO

Igra is governed by the Igra Association and $IGRA token holders via Igra DAO (live at genesis).

- **Proposals**: Any token holder meeting the proposal threshold can submit
- **Voting**: For / Against / Abstain, fixed voting window after delay
- **Quorum**: Dynamic percentage of total voting power (immutable)
- **Execution**: Immediate, no timelock
- **No sequencer**: Igra is a based rollup — no sequencer, no kill switch, no admin override

### What the DAO controls
- Protocol parameters
- Protocol contracts (redeploy + repoint via governance)

### What nobody controls (immutable)
- Token supply
- Governance mechanics

## Hardhat Configuration

```javascript
require("@nomicfoundation/hardhat-toolbox");
module.exports = {
  solidity: "0.8.24",
  networks: {
    igra_mainnet: {
      url: "https://rpc.igralabs.com:8545",
      chainId: 38833,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1100_000_000_000, // 1100 gwei, above 1000 gwei minimum
    },
    galleon_testnet: {
      url: "https://galleon-testnet.igralabs.com:8545",
      chainId: 38836,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 2200_000_000_000, // 2200 gwei, above 2000 gwei minimum
    },
  },
  etherscan: {
    apiKey: {
      igra_mainnet: "no-api-key-needed",
      galleon_testnet: "no-api-key-needed",
    },
    customChains: [
      {
        network: "igra_mainnet",
        chainId: 38833,
        urls: {
          apiURL: "https://explorer.igralabs.com/api",
          browserURL: "https://explorer.igralabs.com",
        },
      },
      {
        network: "galleon_testnet",
        chainId: 38836,
        urls: {
          apiURL: "https://explorer.galleon-testnet.igralabs.com/api",
          browserURL: "https://explorer.galleon-testnet.igralabs.com",
        },
      },
    ],
  },
};
```

## Foundry Configuration

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.24"

[rpc_endpoints]
igra_mainnet = "https://rpc.igralabs.com:8545"
galleon_testnet = "https://galleon-testnet.igralabs.com:8545"

[etherscan]
igra_mainnet = { key = "no-api-key-needed", url = "https://explorer.igralabs.com/api" }
galleon_testnet = { key = "no-api-key-needed", url = "https://explorer.galleon-testnet.igralabs.com/api" }
```

## Contract Verification (Blockscout)

No API key needed. Use `--verifier blockscout`:

```bash
# Mainnet
forge verify-contract CONTRACT_ADDRESS src/MyContract.sol:MyContract \
  --chain-id 38833 --verifier blockscout \
  --verifier-url https://explorer.igralabs.com/api

# Testnet
forge verify-contract CONTRACT_ADDRESS src/MyContract.sol:MyContract \
  --chain-id 38836 --verifier blockscout \
  --verifier-url https://explorer.galleon-testnet.igralabs.com/api
```

## Architecture

Igra is an L2 built on top of the Kaspa BlockDAG. Key concepts:

- **Based rollup**: Transactions are posted to Kaspa L1 and sequenced by Kaspa's consensus
- **L2 blocks**: Built from L1 block windows in the Selected Parent Chain (SPC)
- **Attesting protocol**: Attesters stake IGRA tokens and submit attestations for light client security
- **Node types**: Full nodes (independent verification), Light nodes (L1 attestation verification), Ultra-light nodes (peer-gossiped attestations)

## Resources

| Resource | URL |
|---|---|
| Documentation | https://igra-labs.gitbook.io/igralabs-docs/ |
| Gitbook MCP | `https://igra-labs.gitbook.io/~gitbook/mcp` |
| GitHub | https://github.com/IgraLabs |
| Faucet | https://faucet.igralabs.com |
| Node Setup | https://igralabs.github.io/igra-orchestra/ |
| Mainnet Explorer | https://explorer.igralabs.com |
| Testnet Explorer | https://explorer.galleon-testnet.igralabs.com |
| Mainnet Nodes Status | https://grafana.igralabs.com/public-dashboards/56eb9e43b3854d38b1744f48675a82ac |
