import { useAccount, useDisconnect } from "wagmi";
import Connect from "./Connect";
import SendEth from "./SendEth";
import MintNFT from "./MintNFT";

// This is just for demo purposes. In a real app, you'd want to get this from environment variables or deployment
const CONTRACT_ADDRESS = "0xfba3912ca04dd458c843e2ee08967fc04f3579c2" as const;

function App() {
  const account = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === "connected" && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <Connect />

      {account.status === "connected" && (
        <>
          <div>
            <h2>Send ETH</h2>
            <SendEth />
          </div>
          <div>
            <MintNFT contractAddress={CONTRACT_ADDRESS} />
          </div>
        </>
      )}
    </>
  );
}

export default App;
