import { config } from 'dotenv';
import {
    IUniversalAccountConfig,
    UNIVERSAL_ACCOUNT_VERSION_V2,
    UniversalAccount,
} from '@particle-network/universal-account-sdk';
import { Wallet } from 'ethers';
config();

// Step 1 — Initialize a Universal Account in EIP-7702 mode and print its addresses.
// In 7702 mode the EOA address IS the Universal Account address: no new address, no migration.
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

        const options = await universalAccount.getSmartAccountOptions();
        console.log('Owner (EOA):     ', options.ownerAddress);
        console.log('EVM UA address:  ', options.smartAccountAddress);
        console.log('Solana UA address:', options.solanaSmartAccountAddress);
    } catch (error) {
        console.error(error);
    }
})();
