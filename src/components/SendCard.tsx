type SendCardProps = {
  to: string;
  amount: string;
  symbol: string;
  onToChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSend: () => void;
  sending?: boolean;
};

export default function SendCard({
  to,
  amount,
  symbol,
  onToChange,
  onAmountChange,
  onSend,
  sending = false,
}: SendCardProps) {
  return (
    <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
      <h3 className="text-xl font-semibold text-white">
        Enviar {symbol || "AETH"}
      </h3>

      <input
        className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 outline-none focus:border-amber-400"
        placeholder="Dirección destino"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        disabled={sending}
      />

      <input
        className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 outline-none focus:border-amber-400"
        placeholder="Cantidad"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        disabled={sending}
      />

      <button
        onClick={onSend}
        disabled={sending}
        className="mt-5 w-full rounded-xl bg-amber-500 py-3 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sending ? "Procesando transacción..." : "Enviar"}
      </button>
    </div>
  );
}