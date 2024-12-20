import {
    type Chain,
    createPublicClient,
    createTestClient,
    createWalletClient,
    http,
} from "viem";
import { anvil as anvilViem } from "viem/chains";
import { PROXY_URL } from "./constants";

/**
 * The id of the current test worker.
 * This is used by the anvil proxy to route requests to the correct anvil instance.
 */
export const pool = Number(process.env.VITEST_POOL_ID ?? 1);
// console.log(`Test worker ${pool} connecting to anvil at ${PROXY_URL}/${pool}`);

// Mock account for testing
export const mockAccount = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

// Local chain configuration using foundry base for compatibility
export const anvil = {
    ...anvilViem,
    id: 123,
    rpcUrls: {
        default: {
            http: [`${PROXY_URL}/${pool}`],
        },
        public: {
            http: [`${PROXY_URL}/${pool}`],
        },
    },
} as const satisfies Chain;

export const testClient = createTestClient({
    chain: anvil,
    mode: "anvil",
    transport: http(),
    account: mockAccount,
});

export const publicClient = createPublicClient({
    chain: anvil,
    transport: http(),
});

export const walletClient = createWalletClient({
    chain: anvil,
    transport: http(),
    account: mockAccount,
});
