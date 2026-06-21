# Universal Accounts + EIP-7702 — Workshop Demo

A 3-file Node.js / TypeScript demo for the **Particle Network × Encode Club** hackathon (theme: Chain Abstraction & EIP-7702 tooling).

You'll initialize a [Universal Account](https://developers.particle.network/universal-accounts/overview) in **EIP-7702 mode**, read a unified cross-chain balance, and execute a cross-chain conversion — all from a backend script with a private key. No frontend, no browser wallet.

## What's inside

| Script | Command | What it does |
|---|---|---|
| `src/address.ts` | `npm run address` | Initializes the UA and prints the owner EOA, EVM UA, and Solana UA addresses. In 7702 mode the EOA address **is** the UA address. |
| `src/balance.ts` | `npm run balance` | Fetches the unified balance across every supported chain in one call. |
| `src/convert.ts` | `npm run convert` | Converts any asset → 0.1 USDC on Arbitrum, signing the EIP-7702 authorization inline. |

## Prerequisites

- Node.js 18+
- A Particle Network project (free): https://dashboard.particle.network
- A funded demo wallet holding at least one [Primary Asset](https://developers.particle.network/universal-accounts/chains#primary-assets) on any supported chain

## Setup

```bash
npm install
cp .env.example .env   # then fill in your credentials
```

Fill `.env`:

```env
PROJECT_ID=...
PROJECT_CLIENT_KEY=...
PROJECT_APP_UUID=...
PRIVATE_KEY=0x...        # throwaway demo wallet — never use a real key
```

## Run

```bash
npm run address   # see your UA addresses
npm run balance   # see your unified cross-chain balance
npm run convert   # execute the cross-chain conversion
```

`convert` prints an explorer link — open it to watch the cross-chain routing live:
`https://universalx.app/activity/details?id=<transactionId>`

## The five-step transaction flow

Every Universal Account transaction follows the same shape:

```
1. CREATE    → createConvertTransaction()  — say what you want, not how to route it
2. DELEGATE  → sign pending eip7702Auth entries inline (first tx on a new chain)
3. SIGN      → wallet.signMessageSync(getBytes(rootHash))
4. SEND      → sendTransaction(tx, rootSig, authorizations)
5. DONE      → transactionId + explorer link
```

## Going further

- Swap `SUPPORTED_TOKEN_TYPE.USDC` / `CHAIN_ID.ARBITRUM_MAINNET_ONE` (and the `amount`) for other assets/chains.
- `createTransferTransaction()` — send tokens cross-chain.
- `createBuyTransaction()` / `createSellTransaction()` — trading flows.
- `createUniversalTransaction()` — call any contract on any chain.
- **Add a frontend:** the same SDK works with Privy, Dynamic, or Magic — only the signer changes (replace `wallet.signMessageSync` with the provider's `signAuthorization` / `signMessage`).

## Docs

- UA SDK reference: https://developers.particle.network/universal-accounts/ua-reference/web/overview
