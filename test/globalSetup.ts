import { createAnvil, startProxy } from "@viem/anvil";
import { ANVIL_PORT, PROXY_PORT, BASE_URL } from "./constants";

export default async function () {
    try {
        // Start base Anvil instance
        const baseAnvil = await createAnvil({
            port: ANVIL_PORT,
            host: "::",
            chainId: 123,
            noMining: false,
        });
        await baseAnvil.start();

        // Start proxy that forks from base instance
        return await startProxy({
            port: PROXY_PORT,
            host: "::",
            options: {
                forkUrl: BASE_URL,
                chainId: 123,
            },
        });
    } catch (error) {
        console.error('Failed to start Anvil instances:', error);
        throw error;
    }
}
