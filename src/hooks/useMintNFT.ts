import { useEffect } from "react";
import {
    useWaitForTransactionReceipt,
    useWriteContract,
    usePublicClient
} from "wagmi";
import { Contract } from "../utils/Contract";

type MintNFTHook = {
    mint: (tokenId?: string) => Promise<void>;
    txHash: `0x${string}` | undefined;
    error: Error | null;
    isConfirming: boolean;
    success: boolean;
};

export function useMintNFT(contractAddress: `0x${string}`): MintNFTHook {
    const {
        data: txHash,
        error: writeError,
        isPending,
        writeContract,
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error: waitError,
    } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const publicClient = usePublicClient();

    // Watch for Transfer events to determine success
    useEffect(() => {
        if (!contractAddress || !publicClient || !txHash) return;

        const unwatch = publicClient.watchContractEvent({
            address: contractAddress,
            abi: Contract.abi,
            eventName: "Transfer",
            onLogs(logs) {
                if (logs && logs.length > 0) {
                    const [log] = logs;
                    console.log("Transfer event:", {
                        blockNumber: log.blockNumber,
                        transactionHash: log.transactionHash,
                        args: log.args,
                    });
                }
            },
        });

        return () => unwatch?.();
    }, [contractAddress, publicClient, txHash]);

    const mint = async (tokenId?: string) => {
        try {
            writeContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "mint",
                args: tokenId ? [BigInt(tokenId)] : [],
            });
        } catch (err) {
            console.error("Mint error:", err);
        }
    };

    return {
        mint,
        txHash,
        error: writeError || waitError,
        isConfirming: isPending || isConfirming,
        success: isConfirmed,
    };
}