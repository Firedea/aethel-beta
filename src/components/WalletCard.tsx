type WalletCardProps = {
  account: string;
  balance: string;
  symbol: string;
  onCopy: () => void;
};

export default function WalletCard({
  account,
  balance,
  symbol,
  onCopy,
}: WalletCardProps) {
  return (
    <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-slate-400">
            Tu wallet
          </p>

          <p className="mt-1 font-mono text-sm text-slate-200">
            {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        </div>

        <button
          onClick={onCopy}
          className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Copiar
        </button>

      </div>

      <div className="mt-8">
        <p className="text-sm text-slate-400">
          Balance disponible
        </p>

        <h2 className="mt-2 text-5xl font-bold tracking-tight text-amber-300">
          {balance}
        </h2>

        <p className="mt-2 text-lg font-semibold text-slate-300">
          {symbol || "AETH"}
        </p>
      </div>

    </div>
  );
}