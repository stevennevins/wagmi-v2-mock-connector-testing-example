import React from "react";
import { render, type RenderResult } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mock } from "wagmi/connectors";
import { anvil } from "../src/config/chain";
import { mockAccount } from "./utils";
import { PROXY_URL } from "./constants";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

// Get the pool ID for test worker
const pool = Number(process.env.VITEST_POOL_ID ?? 1);

// Initialize transport
const transport = http(`${PROXY_URL}/${pool}`);

// Create wagmi config with mock connector
const config = createConfig({
    chains: [anvil],
    connectors: [
        mock({
            accounts: [mockAccount],
            features: {
                connectError: false,
                switchChainError: false,
            },
        }),
    ],
    transports: {
        [anvil.id]: transport,
    },
});

export const renderWithProviders = (ui: React.ReactElement): RenderResult => {
    return render(
        React.createElement(
            WagmiProvider,
            { config },
            React.createElement(
                QueryClientProvider,
                { client: queryClient },
                ui
            )
        )
    );
};
