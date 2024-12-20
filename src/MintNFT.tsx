import { useState } from "react";
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

  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useWatchContractEvent({
    address: contractAddress,
    abi: Contract.abi,
    eventName: "Transfer",
    onLogs: () => setSuccess(true),
  });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tokenId = formData.get("tokenId") as string;
    writeContract({
      address: contractAddress,
      abi: Contract.abi,
      functionName: "mint",
      args: tokenId ? [BigInt(tokenId)] : [],
    });
  }

  const isLoading = isPending || !isConfirmed;

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
