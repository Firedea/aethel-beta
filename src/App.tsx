import { useState } from "react";
import Header from "./components/Header";
import WalletCard from "./components/WalletCard";
import SendCard from "./components/SendCard";
import RewardsCard from "./components/RewardsCard";
import RewardsCatalog from "./components/RewardsCatalog";
import MissionsCard from "./components/MissionsCard";
import RegisterCard from "./components/RegisterCard";
import RedemptionReceipt, {
  type RedemptionReceiptData,
} from "./components/RedemptionReceipt";
import { useWallet } from "./hooks/useWallet";

const TREASURY_ADDRESS =
  "0x747413C4f59f0587a05661DEbB19509F93b18a0c";

function loadLastReceipt(): RedemptionReceiptData | null {
  try {
    const saved = localStorage.getItem(
      "aethel:last-redemption"
    );

    if (!saved) return null;

    return JSON.parse(saved) as RedemptionReceiptData;
  } catch {
    return null;
  }
}

function App() {
  const {
    account,
    balance,
    tokenName,
    symbol,
    supply,
    network,
    sendTokens,
    addToken,
  } = useWallet();

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [receipt, setReceipt] =
    useState<RedemptionReceiptData | null>(
      loadLastReceipt
    );

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

  async function handleRedeem(
    rewardName: string,
    cost: number,
    downloadUrl?: string
  ) {
    const confirmed = window.confirm(
      `Canje de prueba:\n\n${rewardName}\nCosto: ${cost.toLocaleString(
        "es-MX"
      )} ${symbol}\n\nLos tokens se enviarán a la tesorería de Aethel.`
    );

    if (!confirmed) return;

    try {
      setRedeeming(true);

      const hash = await sendTokens(
        TREASURY_ADDRESS,
        cost.toString()
      );

      const newReceipt: RedemptionReceiptData = {
        reward: rewardName,
        cost,
        symbol,
        hash,
        wallet: account,
        treasury: TREASURY_ADDRESS,
        createdAt: new Date().toISOString(),
      };

      setReceipt(newReceipt);

      localStorage.setItem(
        "aethel:last-redemption",
        JSON.stringify(newReceipt)
      );

      alert("Canje confirmado. Comprobante guardado.");

      if (downloadUrl) {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download =
          "Aethel_Control_Financiero.xlsx";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error(error);

      alert(
        "El canje no pudo completarse. Revisa MetaMask antes de intentarlo nuevamente."
      );
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-xl space-y-6">
        <Header
          tokenName={tokenName}
          symbol={symbol}
          supply={supply}
          network={network}
        />
        
        <RegisterCard />
<MissionsCard />
<RewardsCatalog />
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

            <button
              onClick={addToken}
              className="w-full rounded-xl border border-amber-500 py-3 font-bold text-amber-400 hover:bg-amber-500/10"
            >
              Añadir AETH a MetaMask
            </button>

            <SendCard
              to={to}
              amount={amount}
              symbol={symbol}
              onToChange={setTo}
              onAmountChange={setAmount}
              onSend={handleSend}
              sending={sending}
            />

            <RewardsCard
              balance={balance}
              symbol={symbol}
              redeeming={redeeming}
              onRedeem={handleRedeem}
            />
            <RedemptionReceipt receipt={receipt} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;