import { expect, test } from "vitest";
import { Contract } from "./utils/Contract";
import { publicClient, walletClient } from "../test/utils";
import { mockAccount } from "../test/index";

test("deploys contract and mints NFT", async () => {
  const hash = await walletClient.deployContract({
    abi: Contract.abi,
    bytecode: Contract.bytecode,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  expect(receipt.status).toBe("success");

  const contractAddress = receipt.contractAddress;
  if (!contractAddress) throw new Error("Contract address is undefined");

  // Mint an NFT
  const mintHash = await walletClient.writeContract({
    address: contractAddress,
    abi: Contract.abi,
    functionName: "mint",
  });

  const mintReceipt = await publicClient.waitForTransactionReceipt({
    hash: mintHash,
  });
  expect(mintReceipt.status).toBe("success");

  const balance = await publicClient.readContract({
    address: contractAddress,
    abi: Contract.abi,
    functionName: "balanceOf",
    args: [mockAccount.address],
  });

  expect(balance).toBe(1n);
});
