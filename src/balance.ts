import { config } from 'dotenv';
import {
    IUniversalAccountConfig,
    UniversalAccount,
    UNIVERSAL_ACCOUNT_VERSION_V2
} from '@particle-network/universal-account-sdk';
import { Wallet } from 'ethers';
config();

// Step 2 — Read the unified, cross-chain balance in a single call.
// getPrimaryAssets() aggregates every supported chain into one USD total.
(async () => {
    try {
        const wallet = new Wallet(process.env.PRIVATE_KEY || '');

        const universalAccountConfig: IUniversalAccountConfig = {
            projectId: process.env.PROJECT_ID || '',
            projectClientKey: process.env.PROJECT_CLIENT_KEY || '',
            projectAppUuid: process.env.PROJECT_APP_UUID || '',
            smartAccountOptions: {
                useEIP7702: true,
                name: 'UNIVERSAL',
                version: UNIVERSAL_ACCOUNT_VERSION_V2,
                ownerAddress: wallet.address,
            },
            // Optional: defaults to auto-slippage. universalGas pays fees in PARTI.
            tradeConfig: { slippageBps: 100, universalGas: true },
        };

        const universalAccount = new UniversalAccount(universalAccountConfig);

        const primaryAssets = await universalAccount.getPrimaryAssets();
        const options = await universalAccount.getSmartAccountOptions();
        console.log('Owner (EOA):     ', options.ownerAddress);
        console.log('EVM UA address:  ', options.smartAccountAddress);
        console.log('Solana UA address:', options.solanaSmartAccountAddress);

        console.log(`\n--- Unified Balance ---`);
        console.log(`Total: $${primaryAssets.totalAmountInUSD.toFixed(2)}\n`);

        for (const asset of primaryAssets.assets) {
            if (asset.amount > 0) {
                console.log(
                    `${asset.tokenType.toUpperCase()}: ${asset.amount} ($${asset.amountInUSD.toFixed(2)})`,
                );
                for (const chain of asset.chainAggregation) {
                    if (chain.amount > 0) {
                        console.log(`  └─ chain ${chain.token.chainId}: ${chain.amount}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
})();
