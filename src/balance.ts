import { config } from 'dotenv';
import {
    IUniversalAccountConfig,
    UNIVERSAL_ACCOUNT_VERSION,
    UniversalAccount,
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
                version: process.env.UNIVERSAL_ACCOUNT_VERSION || UNIVERSAL_ACCOUNT_VERSION,
                ownerAddress: wallet.address,
            },
        };

        const universalAccount = new UniversalAccount(universalAccountConfig);

        const primaryAssets = await universalAccount.getPrimaryAssets();

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
