import { useState, useEffect } from "react";
import {
    useWaitForTransactionReceipt,
    useWriteContract,
    usePublicClient,
} from "wagmi";
import { Contract } from "../utils/Contract";

export function useMintNFT(contractAddress: `0x${string}`) {
    const [success, setSuccess] = useState(false);
    const [txHash, setTxHash] = useState<`0x${string}`>();
    const [error, setError] = useState<Error | null>(null);

    const {
        data: hash,
        error: writeError,
        isPending,
        writeContract,
    } = useWriteContract();

    const publicClient = usePublicClient();

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
        error: waitError,
    } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    useEffect(() => {
        if (waitError) {
            console.error("Wait for receipt error:", waitError);
            setError(waitError);
        }
    }, [waitError]);

    useEffect(() => {
        if (!contractAddress || !publicClient) return;

        const unwatch = publicClient.watchContractEvent({
            address: contractAddress,
            abi: Contract.abi,
            eventName: "Transfer",
            onLogs(logs) {
                if (logs && logs.length > 0) {
                    const [log] = logs;
                    console.log("Processing Transfer event log:", {
                        blockNumber: log.blockNumber,
                        transactionHash: log.transactionHash,
                        args: log.args,
                    });
                    setSuccess(true);
                }
            },
        });

        return () => unwatch?.();
    }, [contractAddress, publicClient]);

    const mint = async (tokenId?: string) => {
        setSuccess(false);
        setError(null);
        setTxHash(undefined);

        try {
            writeContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "mint",
                args: tokenId ? [BigInt(tokenId)] : [],
            });
        } catch (err) {
            console.error("Error submitting transaction:", err);
            setError(err instanceof Error ? err : new Error("Unknown error occurred"));
        }
    };

    return {
        mint,
        success,
        error,
        txHash,
        isLoading: isPending || isConfirming,
        isConfirming,
        isConfirmed,
    };
}