import { renderWithProviders } from "../test";
import { act, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
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

    expect(screen.getByRole("heading", { name: "Mint NFT" })).toBeDefined();
    expect(screen.getByPlaceholderText("Token ID (optional)")).toBeDefined();
    expect(screen.getByRole("button", { name: "Mint NFT" })).toBeDefined();
  });

  it("should handle minting NFT", async () => {
    console.log("Starting NFT mint test");

    await act(async () => {
      renderWithProviders(
        <>
          <Connect />
          <MintNFT contractAddress={contractAddress} />
        </>
      );
    });

    console.log("Components rendered");

    // Connect wallet first
    const connectButton = screen.getByRole("button", {
      name: "Mock Connector",
    });
    await act(async () => {
      console.log("Clicking connect button");
      fireEvent.click(connectButton);
    });

    // Wait for connection success with retry
    let retryCount = 0;
    const maxRetries = 5;
    while (retryCount < maxRetries) {
      try {
        await waitFor(() => {
          const successElement = screen.getByText("success");
          console.log("Wallet connected successfully");
          expect(successElement).toBeDefined();
        }, { timeout: 5000 });
        break;
      } catch (error) {
        console.log(`Connection retry ${retryCount + 1}/${maxRetries}`);
        retryCount++;
        if (retryCount === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Check initial state before any actions
    const mintButton = screen.getByRole("button", { name: "Mint NFT" });
    console.log("Found mint button:", mintButton.textContent);
    expect(mintButton).toBeDefined();
    expect(screen.queryByText("Transaction Hash:")).toBeNull();
    expect(screen.queryByText("Waiting for confirmation...")).toBeNull();
    expect(screen.queryByText("Transaction confirmed.")).toBeNull();
    expect(screen.queryByTestId("success")).toBeNull();

    // Submit the mint transaction
    await act(async () => {
      console.log("Clicking mint button");
      fireEvent.click(mintButton);
    });

    // Wait for the transaction to be submitted and loading state to appear
    await waitFor(() => {
      const loadingElement = screen.getByText("Minting...");
      console.log("Found loading state:", loadingElement.textContent);
      expect(loadingElement).toBeDefined();
    }, { timeout: 15000 });

    // Wait for transaction hash with retry logic
    retryCount = 0;
    while (retryCount < maxRetries) {
      try {
        await waitFor(() => {
          const hashElement = screen.getByText(/Transaction Hash:/);
          console.log("Found transaction hash:", hashElement.textContent);
          expect(hashElement).toBeDefined();
        }, { timeout: 5000 });
        break;
      } catch (error) {
        console.log(`Hash retry ${retryCount + 1}/${maxRetries}`);
        await testClient.mine({ blocks: 1 });
        retryCount++;
        if (retryCount === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Mine blocks and wait for confirmation with retry
    console.log("Mining blocks for confirmation");
    await testClient.mine({ blocks: 2 });

    retryCount = 0;
    while (retryCount < maxRetries) {
      try {
        await waitFor(() => {
          const confirmingElement = screen.getByText("Waiting for confirmation...");
          console.log("Found confirming state:", confirmingElement.textContent);
          expect(confirmingElement).toBeDefined();
        }, { timeout: 5000 });
        break;
      } catch (error) {
        console.log(`Confirmation retry ${retryCount + 1}/${maxRetries}`);
        await testClient.mine({ blocks: 1 });
        retryCount++;
        if (retryCount === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Mine more blocks and wait for confirmed state with retry
    console.log("Mining more blocks for final confirmation");
    await testClient.mine({ blocks: 2 });

    retryCount = 0;
    while (retryCount < maxRetries) {
      try {
        await waitFor(() => {
          const confirmedElement = screen.getByText("Transaction confirmed.");
          console.log("Found confirmed state:", confirmedElement.textContent);
          expect(confirmedElement).toBeDefined();
        }, { timeout: 5000 });
        break;
      } catch (error) {
        console.log(`Final confirmation retry ${retryCount + 1}/${maxRetries}`);
        await testClient.mine({ blocks: 1 });
        retryCount++;
        if (retryCount === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Wait for Transfer event and success state with retry
    retryCount = 0;
    while (retryCount < maxRetries) {
      try {
        // Mine multiple blocks to ensure events are processed
        console.log("Mining blocks for Transfer event processing...");
        for (let i = 0; i < 3; i++) {
          await testClient.mine({ blocks: 1 });
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for event processing
        }

        await waitFor(() => {
          const successElement = screen.getByTestId("success");
          console.log("Found success state:", successElement.textContent);
          expect(successElement).toBeDefined();
        }, { timeout: 5000 });
        break;
      } catch (error) {
        console.log(`Success state retry ${retryCount + 1}/${maxRetries}`);
        if (retryCount === maxRetries - 1) {
          console.log("Final retry attempt, dumping component state...");
          console.log("Current DOM:", screen.debug());
        }
        retryCount++;
        if (retryCount === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Mine one final block and check balance
    console.log("Mining final block");
    await testClient.mine({ blocks: 1 });

    // Check if NFT was minted after confirmation and event
    const balanceAfter = await publicClient.readContract({
      address: contractAddress,
      abi: Contract.abi,
      functionName: "balanceOf",
      args: [mockAccount.address],
    });

    console.log("Final balance:", balanceAfter.toString());
    expect(balanceAfter).toBe(1n);
  }, 60000); // Increase overall test timeout to 60 seconds
});
