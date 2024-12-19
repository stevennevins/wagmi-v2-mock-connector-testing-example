import { fetchLogs } from "@viem/anvil";
import { afterEach } from "vitest";
import { pool, testClient } from "./utils";
import { BASE_URL } from "./constants";

// Reset state after each test
afterEach(async () => {
    try {
        // Reset the forked chain state
        console.log('Test client RPC URL:', testClient.transport.url);
        await testClient.reset({
            // jsonRpcUrl: BASE_URL,
        });
        console.log('Successfully reset anvil state');
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
