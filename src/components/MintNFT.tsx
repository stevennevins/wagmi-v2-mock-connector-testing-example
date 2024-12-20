import { useMintNFT } from "../hooks/useMintNFT";

interface MintNFTProps {
  contractAddress: `0x${string}`;
}

export default function MintNFT({ contractAddress }: MintNFTProps) {
  const { mint, success, error, isConfirming } = useMintNFT(contractAddress);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tokenId = formData.get("tokenId") as string;
    await mint(tokenId || undefined);
  }

  return (
    <div className="mint-nft-container">
      <form onSubmit={submit}>
        <div className="input-container">
          <input
            name="tokenId"
            type="number"
            placeholder="Token ID (optional)"
            disabled={isConfirming}
          />
        </div>
        <button className="mint-button" disabled={isConfirming} type="submit">
          {isConfirming ? "Minting..." : "Mint NFT"}
        </button>

        {isConfirming && <div data-testid="confirming" />}
        {error && <div data-testid="error" />}
        {success && <div data-testid="success" />}
      </form>
    </div>
  );
}
