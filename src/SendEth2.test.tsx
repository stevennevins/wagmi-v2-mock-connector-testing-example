import { renderWithProviders } from "../test";
import { act, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Connect from "./Connect";
import SendEth from "./SendEth";
import { parseEther } from "viem";
import { createPublicClient, http } from "viem";
import { anvil } from "../test/utils";
import { mockAccount } from "../test";

/// Just showing they have distinct forked instances of anvil
describe("SendEth2", () => {
  it("should render the SendEth component 2", async () => {
    await act(async () => {
      renderWithProviders(
        <>
          <Connect /> <SendEth />
        </>
      );
    });

    expect(screen.getByText("Send ETH")).toBeDefined();
    expect(screen.getByPlaceholderText("0x...")).toBeDefined();
    expect(screen.getByText("Amount (ETH):")).toBeDefined();
  });

  it("should handle sending ETH 2", async () => {
    const publicClient = createPublicClient({
      chain: anvil,
      transport: http(),
    });

    const recipient = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
    const amount = parseEther("0.1");

    const senderBalanceBefore = await publicClient.getBalance({
      address: mockAccount.address,
    });
    expect(senderBalanceBefore).toBe(parseEther("10000"));

    const recipientBalanceBefore = await publicClient.getBalance({
      address: recipient,
    });

    await act(async () => {
      renderWithProviders(
        <>
          <Connect />
          <SendEth />
        </>
      );
    });

    const connectButton = screen.getByRole("button", {
      name: "Mock Connector",
    });
    await act(async () => {
      fireEvent.click(connectButton);
    });

    const recipientInput = screen.getByPlaceholderText("0x...");
    const amountInput = screen.getByLabelText("Amount (ETH):");
    const sendButton = screen.getByText("Send ETH");

    await act(async () => {
      fireEvent.change(recipientInput, {
        target: { value: recipient },
      });
      fireEvent.change(amountInput, { target: { value: "0.1" } });
      fireEvent.click(sendButton);
    });

    await waitFor(() => expect(screen.getByTestId("success")).toBeDefined());

    const recipientBalanceAfter = await publicClient.getBalance({
      address: recipient,
    });

    expect(recipientBalanceAfter - recipientBalanceBefore).toBe(amount);
  });
});
