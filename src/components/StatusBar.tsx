type StatusBarProps = {
  status: string;
  txHash: string;
  sending: boolean;
};

export default function StatusBar({
  status,
  txHash,
  sending,
}: StatusBarProps) {
  if (!status && !sending && !txHash) {
    return null;
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      {sending ? (
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 animate-pulse rounded-full bg-amber-400" />

          <div>
            <p className="font-semibold text-amber-300">
              Procesando transacción
            </p>

            <p className="text-sm text-slate-400">
              Confirma en MetaMask y espera la confirmación de Base Sepolia.
            </p>
          </div>
        </div>
      ) : (
        <div>
          <p className="font-semibold text-emerald-400">
            {status || "Transacción confirmada"}
          </p>

          {txHash && (
            <p className="mt-2 break-all font-mono text-xs text-slate-400">
              TX: {txHash}
            </p>
          )}
        </div>
      )}
    </div>
  );
}