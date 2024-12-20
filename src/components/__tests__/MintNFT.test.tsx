import { renderWithProviders } from "../../../test";
import { act, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import Connect from "../Connect";
import MintNFT from "../MintNFT";
import { Contract } from "../../utils/Contract";
import { publicClient, walletClient, testClient } from "../../../test/utils";
import { mockAccount } from "../../../test";

describe("MintNFT", () => {
  let contractAddress: `0x${string}`;

  beforeEach(async () => {
    console.log("Setting up test environment...");

    // Deploy the contract once before all tests
    const hash = await walletClient.deployContract({
      abi: Contract.abi,
      bytecode: Contract.bytecode,
    });
    console.log("Contract deployment transaction hash:", hash);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    contractAddress = receipt.contractAddress!;

    console.log("Contract deployed successfully");
    console.log("Contract address:", contractAddress);
    console.log("Wallet client RPC URL:", walletClient.transport.url);
    console.log("Public client RPC URL:", publicClient.transport.url);
    console.log("Test client RPC URL:", testClient.transport.url);
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
    console.log("\nStarting mint NFT test");

    // Render components
    await act(async () => {
      renderWithProviders(
        <>
          <Connect />
          <MintNFT contractAddress={contractAddress} />
        </>
      );
    });
    console.log("Components rendered");

    // Connect wallet
    const connectButton = screen.getByRole("button", {
      name: "Mock Connector",
    });
    await act(async () => {
      fireEvent.click(connectButton);
    });
    console.log("Wallet connected");

    // Get initial balance
    const balanceBefore = await publicClient.readContract({
      address: contractAddress,
      abi: Contract.abi,
      functionName: "balanceOf",
      args: [mockAccount.address],
    });
    console.log("Initial balance:", balanceBefore.toString());

    // Click mint button
    const mintButton = screen.getByText("Mint NFT");
    await act(async () => {
      fireEvent.click(mintButton);
    });
    console.log("Mint button clicked");

    // Wait for loading state
    await waitFor(() => {
      const loadingElement = screen.getByTestId("confirming");
      console.log("Found loading state");
      expect(loadingElement).toBeDefined();
    });

    // Wait for confirmed state
    await waitFor(() => {
      const confirmedElement = screen.getByTestId("success");
      console.log("Transaction confirmed");
      expect(confirmedElement).toBeDefined();
    });

    // Verify final balance
    console.log("Verifying final balance...");
    const balanceAfter = await publicClient.readContract({
      address: contractAddress,
      abi: Contract.abi,
      functionName: "balanceOf",
      args: [mockAccount.address],
    });

    console.log("Final balance:", balanceAfter.toString());
    expect(balanceAfter).toBe(balanceBefore + 1n);

    await waitFor(() => {
      const successElement = screen.getByTestId("success");
      console.log("Mint successful");
      expect(successElement).toBeDefined();
    });
  });

  it("should handle minting NFT with an id", async () => {
    console.log("\nStarting mint NFT test");

    // Render components
    await act(async () => {
      renderWithProviders(
        <>
          <Connect />
          <MintNFT contractAddress={contractAddress} />
        </>
      );
    });
    console.log("Components rendered");

    // Connect wallet
    const connectButton = screen.getByRole("button", {
      name: "Mock Connector",
    });
    await act(async () => {
      fireEvent.click(connectButton);
    });
    console.log("Wallet connected");

    // Get initial balance
    const balanceBefore = await publicClient.readContract({
      address: contractAddress,
      abi: Contract.abi,
      functionName: "balanceOf",
      args: [mockAccount.address],
    });
    console.log("Initial balance:", balanceBefore.toString());

    // Set NFT ID input
    const idInput = screen.getByPlaceholderText("Token ID (optional)");
    await act(async () => {
      fireEvent.change(idInput, { target: { value: "42" } });
    });
    console.log("Set NFT ID to 42");

    // Click mint button
    const mintButton = screen.getByText("Mint NFT");
    await act(async () => {
      fireEvent.click(mintButton);
    });
    console.log("Mint button clicked");

    // Wait for loading state
    await waitFor(() => {
      const loadingElement = screen.getByTestId("confirming");
      console.log("Found loading state");
      expect(loadingElement).toBeDefined();
    });

    // Wait for confirmed state
    await waitFor(() => {
      const confirmedElement = screen.getByTestId("success");
      console.log("Transaction confirmed");
      expect(confirmedElement).toBeDefined();
    });

    // Verify final balance
    console.log("Verifying final balance...");
    const balanceAfter = await publicClient.readContract({
      address: contractAddress,
      abi: Contract.abi,
      functionName: "balanceOf",
      args: [mockAccount.address],
    });

    console.log("Final balance:", balanceAfter.toString());
    expect(balanceAfter).toBe(balanceBefore + 1n);

    await waitFor(() => {
      const successElement = screen.getByTestId("success");
      console.log("Mint successful");
      expect(successElement).toBeDefined();
    });
  });
});
