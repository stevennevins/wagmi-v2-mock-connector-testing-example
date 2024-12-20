import {
    createPublicClient,
    createTestClient,
    createWalletClient,
    http,
    type Address,
} from "viem";
import { anvil } from "../src/config/chain";
import { PROXY_URL } from "./constants";

/**
 * The id of the current test worker.
 * This is used by the anvil proxy to route requests to the correct anvil instance.
 */
export const pool = Number(process.env.VITEST_POOL_ID ?? 1);

// Mock account for testing
export const mockAccount = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" as Address;

// Create test clients with proper RPC URL configuration
export const testClient = createTestClient({
    chain: anvil,
    mode: "anvil",
    transport: http(`${PROXY_URL}/${pool}`),
    account: mockAccount,
});

export const publicClient = createPublicClient({
    chain: anvil,
    transport: http(`${PROXY_URL}/${pool}`),
});

export const walletClient = createWalletClient({
    chain: anvil,
    transport: http(`${PROXY_URL}/${pool}`),
    account: mockAccount,
});

export { renderWithProviders } from "./test-utils";
