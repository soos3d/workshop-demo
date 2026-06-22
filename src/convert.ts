import { config } from 'dotenv';
import {
    CHAIN_ID,
    EIP7702Authorization,
    IUniversalAccountConfig,
    SUPPORTED_TOKEN_TYPE,
    UNIVERSAL_ACCOUNT_VERSION_V2,
    UniversalAccount,
} from '@particle-network/universal-account-sdk';
import { getBytes, hashAuthorization, Wallet } from 'ethers';

config();

// Step 3 — Convert any asset into USDT on BSC, handling EIP-7702 delegation inline.
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
            tradeConfig: { slippageBps: 100, universalGas: false },
        };

        const universalAccount = new UniversalAccount(universalAccountConfig);

        // 1. CREATE — describe WHAT you want; the SDK figures out the routing.
        const transaction = await universalAccount.createConvertTransaction({
            expectToken: { type: SUPPORTED_TOKEN_TYPE.USDC, amount: '0.1' },
            chainId: CHAIN_ID.ARBITRUM_MAINNET_ONE,
        });

        // 2. DELEGATE — sign any pending 7702 authorizations inline (first tx on a new chain).
        const authorizations: EIP7702Authorization[] = [];
        const nonceMap = new Map<number, string>();
        for (const userOp of transaction.userOps) {
            if (!!userOp.eip7702Auth && !userOp.eip7702Delegated) {
                let signatureSerialized = nonceMap.get(userOp.eip7702Auth.nonce);
                if (!signatureSerialized) {
                    // const authorization = wallet.authorizeSync(userOp.eip7702Auth);
                    const dataHash = hashAuthorization(userOp.eip7702Auth);
                    const signature = wallet.signingKey.sign(dataHash);
                    signatureSerialized = signature.serialized;
                    nonceMap.set(userOp.eip7702Auth.nonce, signatureSerialized);
                }
                authorizations.push({
                    userOpHash: userOp.userOpHash,
                    signature: signatureSerialized,
                });
            }
        }

        // 3. SIGN the rootHash + 4. SEND — both signatures come from the same key.
        const sendResult = await universalAccount.sendTransaction(
            transaction,
            wallet.signMessageSync(getBytes(transaction.rootHash)),
            authorizations,
        );

        console.log('sendResult', sendResult);
        console.log('sendResult.transactionId', sendResult.transactionId);
        console.log('explorer url', `https://universalx.app/activity/details?id=${sendResult.transactionId}`);
    } catch (error) {
        console.error(error);
    }
})();
