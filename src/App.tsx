import { useAccount, useDisconnect } from "wagmi";
import Connect from "./Connect";
import SendEth from "./SendEth";

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
        <div>
          <h2>Send ETH</h2>
          <SendEth />
        </div>
      )}
    </>
  );
}

export default App;
