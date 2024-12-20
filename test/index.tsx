import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { privateKeyToAccount } from "viem/accounts";
import { http, WagmiProvider, createConfig } from "wagmi";
import { anvil } from "./utils";
import { mock } from "wagmi/connectors";
import { createWalletClient } from "viem";
import { JSX } from "react";

const privateKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // default anvil account 0
export const mockAccount = privateKeyToAccount(privateKey);

const getWalletClient = () =>
  createWalletClient({
    transport: http(),
    chain: anvil,
    account: mockAccount,
    key: privateKey,
  });

const config = createConfig({
  chains: [anvil],
  client: getWalletClient,
  connectors: [mock({ accounts: [mockAccount.address] })],
});

const queryClient = new QueryClient();

export const Providers = ({ children }: { children: JSX.Element }) => {
  // Log RPC URL from wallet client
  console.log("Provider RPC URL:", getWalletClient().transport.url);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};

export const renderWithProviders = (component: JSX.Element) => {
  return render(<Providers>{component}</Providers>);
};
