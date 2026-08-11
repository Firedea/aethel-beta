export type RedemptionReceiptData = {
  reward: string;
  cost: number;
  symbol: string;
  hash: string;
  wallet: string;
  treasury: string;
  createdAt: string;
};

type RedemptionReceiptProps = {
  receipt: RedemptionReceiptData | null;
};

function shortenAddress(address: string) {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export default function RedemptionReceipt({
  receipt,
}: RedemptionReceiptProps) {
  if (!receipt) return null;

  const explorerUrl =
    `https://sepolia.basescan.org/tx/${receipt.hash}`;

  return (
    <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">
          Comprobante de canje
        </h2>

        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
          Confirmado
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-slate-400">Recompensa</p>
          <p className="font-semibold">{receipt.reward}</p>
        </div>

        <div>
          <p className="text-slate-400">Cantidad</p>
          <p className="font-semibold">
            {receipt.cost.toLocaleString("es-MX")}{" "}
            {receipt.symbol}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Wallet</p>
          <p>{shortenAddress(receipt.wallet)}</p>
        </div>

        <div>
          <p className="text-slate-400">Tesorería</p>
          <p>{shortenAddress(receipt.treasury)}</p>
        </div>

        <div>
          <p className="text-slate-400">Fecha</p>
          <p>
            {new Date(receipt.createdAt).toLocaleString(
              "es-MX"
            )}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Hash</p>
          <p className="break-all font-mono text-xs">
            {receipt.hash}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() =>
            navigator.clipboard.writeText(receipt.hash)
          }
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold hover:bg-slate-700"
        >
          Copiar hash
        </button>

        <a
          href={explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-center text-sm font-bold text-black hover:bg-emerald-400"
        >
          Ver en BaseScan
        </a>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Este comprobante se guarda solamente en este dispositivo.
      </p>
    </section>
  );
}