import { useState, useEffect } from "react";
import {
  type BaseError,
  useWaitForTransactionReceipt,
  useWriteContract,
  useWatchContractEvent,
} from "wagmi";
import { keccak256, toHex, stringToHex } from "viem";
import { Contract } from "./utils/Contract";

interface MintNFTProps {
  contractAddress: `0x${string}`;
}

export default function MintNFT({ contractAddress }: MintNFTProps) {
  const [success, setSuccess] = useState(false);

  const {
    data: hash,
    error,
    isPending,
    writeContract,
    isSuccess: isWriteSuccess,
    isError: isWriteError,
  } = useWriteContract();

  // Log state changes for writeContract
  useEffect(() => {
    console.log("WriteContract state changed:", {
      hash,
      isPending,
      isWriteSuccess,
      isWriteError,
      error: error ? (error as BaseError).shortMessage || error.message : null,
    });
  }, [hash, isPending, isWriteSuccess, isWriteError, error]);

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isConfirmError,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Log state changes for transaction receipt
  useEffect(() => {
    console.log("Transaction receipt state:", {
      isConfirming,
      isConfirmed,
      isConfirmError,
    });

    // Check receipt for Transfer event when confirmed
    if (isConfirmed && receipt) {
      const transferEvents = receipt.logs.filter((log) => {
        try {
          const transferEvent = Contract.abi.find(
            (x) => x.type === "event" && x.name === "Transfer"
          );
          const eventSignature = `${transferEvent?.name}(address,address,uint256)`;
          const eventTopic = keccak256(stringToHex(eventSignature));
          return (
            log.address.toLowerCase() === contractAddress.toLowerCase() &&
            log.topics[0] === eventTopic
          );
        } catch {
          return false;
        }
      });

      if (transferEvents.length > 0) {
        console.log("Transfer event found in receipt:", transferEvents);
        setSuccess(true);
      }
    }
  }, [isConfirming, isConfirmed, isConfirmError, receipt, contractAddress]);

  useWatchContractEvent({
    address: contractAddress,
    abi: Contract.abi,
    eventName: "Transfer",
    onLogs: (logs) => {
      console.log("Transfer event received:", logs);
      setSuccess(true);
    },
  });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false); // Reset success state on new submission
    const formData = new FormData(e.currentTarget);
    const tokenId = formData.get("tokenId") as string;
    console.log("Submitting mint with tokenId:", tokenId || "none");
    console.log("Contract address:", contractAddress);

    try {
      console.log("Initiating contract write...");
      writeContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: "mint",
        args: tokenId ? [BigInt(tokenId)] : [],
      });
      console.log("Contract write initiated");
    } catch (err) {
      console.error("Error writing contract:", err);
    }
  }

  const isLoading = isPending || isConfirming;

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          <input
            name="tokenId"
            type="number"
            placeholder="Token ID (optional)"
          />
        </div>
        <button disabled={isLoading} type="submit">
          {isLoading ? "Minting..." : "Mint NFT"}
        </button>
        {hash && <div>Transaction Hash: {hash}</div>}
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && <div>Transaction confirmed.</div>}
        {error && (
          <div>Error: {(error as BaseError).shortMessage || error.message}</div>
        )}
        {success && <div data-testid="success">Successfully minted NFT!</div>}
      </form>
    </div>
  );
}
