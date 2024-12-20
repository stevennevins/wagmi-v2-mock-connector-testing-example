import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { privateKeyToAccount } from "viem/accounts";
import { http, WagmiProvider, createConfig } from "wagmi";
import { mock } from "wagmi/connectors";
import { JSX } from "react";
import { anvil } from "../src/config/chain";

const privateKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // default anvil account 0
export const mockAccount = privateKeyToAccount(privateKey);

const mockConnector = mock({
  accounts: [mockAccount.address],
});

const config = createConfig({
  chains: [anvil],
  connectors: [mockConnector],
  transports: {
    [anvil.id]: http(anvil.rpcUrls.default.http[0]),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export const renderWithProviders = (component: JSX.Element) => {
  return render(
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    </WagmiProvider>
  );
};
