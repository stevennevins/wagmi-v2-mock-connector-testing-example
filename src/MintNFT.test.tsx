import { renderWithProviders } from "../test";
import { act, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import Connect from "./Connect";
import MintNFT from "./MintNFT";
import { Contract } from "./utils/Contract";
import { publicClient, walletClient, testClient } from "../test/utils";
import { mockAccount } from "../test/index";

describe("MintNFT", () => {
  let contractAddress: `0x${string}`;

  beforeEach(async () => {
    // Deploy the contract once before all tests
    const hash = await walletClient.deployContract({
      abi: Contract.abi,
      bytecode: Contract.bytecode,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    contractAddress = receipt.contractAddress!;

    console.log("Wallet client RPC URL:", walletClient.transport.url);
    console.log("public client RPC URL:", publicClient.transport.url);
    console.log("test client RPC URL:", testClient.transport.url);
    console.log("Contract deployed to:", contractAddress);
  });

  it("should render the MintNFT component", async () => {
    await act(async () => {
      renderWithProviders(
        <>
          <Connect /> <MintNFT contractAddress={contractAddress} />
        </>
      );
    });

    expect(screen.getByText("Mint NFT")).toBeDefined();
    expect(screen.getByPlaceholderText("Token ID (optional)")).toBeDefined();
  });

  it("should handle minting NFT", async () => {
    await act(async () => {
      renderWithProviders(
        <>
          <Connect />
          <MintNFT contractAddress={contractAddress} />
        </>
      );
    });

    const connectButton = screen.getByRole("button", {
      name: "Mock Connector",
    });
    await act(async () => {
      fireEvent.click(connectButton);
    });

    const mintButton = screen.getByText("Mint NFT");
    await act(async () => {
      fireEvent.click(mintButton);
    });

    // Check initial state
    expect(screen.queryByText("Minting...")).toBeNull();
    expect(screen.queryByText("Transaction Hash:")).toBeNull();
    expect(screen.queryByText("Waiting for confirmation...")).toBeNull();
    expect(screen.queryByText("Transaction confirmed.")).toBeNull();
    expect(screen.queryByTestId("success")).toBeNull();

    // Wait for and verify loading state
    await waitFor(() => {
      expect(screen.getByText("Minting...")).toBeDefined();
    });

    // Mine blocks to process transaction
    await testClient.mine({ blocks: 2 });

    // Wait for and verify transaction hash
    await waitFor(() => {
      expect(screen.getByText(/Transaction Hash:/)).toBeDefined();
    });

    // Wait for and verify confirmation state
    await waitFor(() => {
      expect(screen.getByText("Waiting for confirmation...")).toBeDefined();
    });

    // Mine blocks to confirm transaction
    await testClient.mine({ blocks: 2 });

    // Wait for and verify confirmed state
    await waitFor(() => {
      expect(screen.getByText("Transaction confirmed.")).toBeDefined();
    });

    // Wait for Transfer event and success state
    await waitFor(
      () => {
        expect(screen.getByTestId("success")).toBeDefined();
      },
      {
        timeout: 5000,
      }
    );

    // Mine additional block to ensure state is updated
    await testClient.mine({ blocks: 1 });

    // Check if NFT was minted after confirmation and event
    const balanceAfter = await publicClient.readContract({
      address: contractAddress,
      abi: Contract.abi,
      functionName: "balanceOf",
      args: [mockAccount.address],
    });

    expect(balanceAfter).toBe(1n);
  });
});
