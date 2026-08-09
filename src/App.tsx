import { useState } from "react";
import Header from "./components/Header";
import WalletCard from "./components/WalletCard";
import SendCard from "./components/SendCard";
import { useWallet } from "./hooks/useWallet";

function App() {
  const {
    account,
    balance,
    tokenName,
    symbol,
    supply,
    network,
    connectWallet,
    sendTokens,
  } = useWallet();

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
  if (!to || !amount) {
    alert("Escribe una dirección y una cantidad.");
    return;
  }

  try {
    setSending(true);

    await sendTokens(to, amount);

    setTo("");
    setAmount("");

    alert("Transferencia completada.");
  } catch (error) {
    console.error(error);
    alert("La transferencia no pudo completarse.");
  } finally {
    setSending(false);
  }
}

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-xl mx-auto">

        <Header
          tokenName={tokenName}
          symbol={symbol}
          supply={supply}
          network={network}
        />

        <button
          onClick={connectWallet}
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl"
        >
          Conectar Wallet
        </button>

        {account && (
          <>
            <WalletCard
              account={account}
              balance={balance}
              symbol={symbol}
              onCopy={() =>
                navigator.clipboard.writeText(account)
              }
            />

            <SendCard
              to={to}
              amount={amount}
              symbol={symbol}
              onToChange={setTo}
              onAmountChange={setAmount}
              onSend={handleSend}
              sending={sending}
            />
          </>
        )}

      </div>
    </div>
  );
}

export default App;