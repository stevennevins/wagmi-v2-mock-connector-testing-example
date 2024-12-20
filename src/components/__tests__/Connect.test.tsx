import { renderWithProviders } from "../../../test";
import { act, screen, fireEvent } from "@testing-library/react";
import { describe, it } from "vitest";
import Connect from "../Connect";

describe("Connect", () => {
  it("should render the Connect component", async () => {
    await act(async () => {
      renderWithProviders(<Connect />);
    });
  });

  it("should handle connecting the user wallet", async () => {
    await act(async () => {
      renderWithProviders(<Connect />);
    });

    const connectButton = screen.getByRole("button", {
      name: "Mock Connector",
    });
    await act(async () => {
      fireEvent.click(connectButton);
    });
  });
});
