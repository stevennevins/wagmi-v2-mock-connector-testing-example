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
        const shutdownProxies = await startProxy({
            port: PROXY_PORT,
            host: "::",
            options: {
                forkUrl: BASE_URL,
                chainId: 123,
            },
        });

        // Return a teardown function
        return async () => {
            // console.log('Stopping Anvil instances...');
            shutdownProxies();
            await baseAnvil.stop();
            // console.log('Anvil instances stopped.');
        };

    } catch (error) {
        console.error('Failed to start Anvil instances:', error);
        throw error;
    }
}
