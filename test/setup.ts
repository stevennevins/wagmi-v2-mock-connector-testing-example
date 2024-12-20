import { fetchLogs } from "@viem/anvil";
import { beforeEach, afterEach } from "vitest";
import { pool, testClient } from "./utils";
import { BASE_URL } from "./constants";
import { anvil } from "../src/config/chain";

// Initialize chain before each test
beforeEach(async () => {
    try {
        await testClient.setChainId({
            chainId: anvil.id,
        });
        console.log('Chain ID set to:', anvil.id);
    } catch (error) {
        console.error('Failed to set chain ID:', error);
    }
});

// Reset state after each test
afterEach(async () => {
    try {
        // Reset the forked chain state
        await testClient.reset({
            jsonRpcUrl: BASE_URL,
        });
    } catch (error) {
        console.error('Failed to reset state:', error);
    }
});

// Log anvil output on test failure
afterEach(async (context) => {
    context.onTestFailed(async () => {
        const logs = await fetchLogs(`http://127.0.0.1:8545/${pool}`, pool);
        console.log(...logs.slice(-20));
    });
});
