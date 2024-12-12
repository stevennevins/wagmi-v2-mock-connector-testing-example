import { renderWithProviders } from "../test";
import { act, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createAnvil } from "@viem/anvil";
import Connect from "./Connect";
import SendEth from "./SendEth";

let anvil: ReturnType<typeof createAnvil>;

describe("SendEth", () => {
  beforeAll(async () => {
    anvil = createAnvil({});
    await anvil.start();
  });

  afterAll(async () => {
    await anvil.stop();
  });

  it("should render the SendEth component", async () => {
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

  it("should handle sending ETH", async () => {
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
        target: { value: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8" },
      });
      fireEvent.change(amountInput, { target: { value: "0.1" } });
      fireEvent.click(sendButton);
    });

    // await waitFor(() => expect(screen.getByTestId("pending")).toBeDefined());
    await waitFor(() => expect(screen.getByTestId("success")).toBeDefined());
  });
});
