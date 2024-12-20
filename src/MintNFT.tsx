import { useState, useEffect } from "react";
import {
  type BaseError,
  useWaitForTransactionReceipt,
  useWriteContract,
  useWatchContractEvent,
} from "wagmi";
import { Contract } from "./utils/Contract";

interface MintNFTProps {
  contractAddress: `0x${string}`;
}

export default function MintNFT({ contractAddress }: MintNFTProps) {
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}`>();
  const [error, setError] = useState<Error | null>(null);

  const {
    data: hash,
    error: writeError,
    isPending,
    writeContract
  } = useWriteContract();

  useEffect(() => {
    if (isPending) {
      setError(null);
    }
  }, [isPending]);

  useEffect(() => {
    if (hash) {
      console.log("Transaction submitted, hash:", hash);
      setTxHash(hash);
      setError(null);
    }
  }, [hash]);

  useEffect(() => {
    if (writeError) {
      console.error("Write contract error:", writeError);
      setError(writeError);
    }
  }, [writeError]);

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: waitError
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (waitError) {
      console.error("Wait for receipt error:", waitError);
      setError(waitError);
    }
  }, [waitError]);

  useWatchContractEvent({
    address: contractAddress,
    abi: Contract.abi,
    eventName: "Transfer",
    onLogs: (logs) => {
      console.log("Transfer event received with logs:", logs);
      if (logs && logs.length > 0) {
        const [log] = logs;
        console.log("Processing Transfer event log:", {
          from: log.args?.from,
          to: log.args?.to,
          tokenId: log.args?.tokenId?.toString()
        });
        setSuccess(true);
      }
    },
    strict: true,
    pollingInterval: 1000, // Poll every second
    batch: false // Process events one at a time
  });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    setTxHash(undefined);

    const formData = new FormData(e.currentTarget);
    const tokenId = formData.get("tokenId") as string;

    try {
      console.log("Preparing mint transaction...");
      writeContract({
        abi: Contract.abi,
        address: contractAddress,
        functionName: "mint",
        args: tokenId ? [BigInt(tokenId)] : [],
      });
    } catch (err) {
      console.error("Error submitting transaction:", err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    }
  }

  const isLoading = isPending || isConfirming;

  return (
    <div>
      <h2>Mint NFT</h2>
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
        {txHash && <div>Transaction Hash: {txHash}</div>}
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
