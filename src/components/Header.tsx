type HeaderProps = {
  tokenName: string;
  symbol: string;
  supply: string;
  network: string;
};

export default function Header({
  tokenName,
  symbol,
  supply,
  network,
}: HeaderProps) {
  const numericSupply = Number(supply);

  const displayedSupply =
    supply && Number.isFinite(numericSupply)
      ? new Intl.NumberFormat("es-MX", {
          maximumFractionDigits: 2,
        }).format(numericSupply)
      : "1,000,000";

  const displayedNetwork = network
    ? network.replace("base-sepolia", "Base Sepolia")
    : "Base Sepolia · 84532";

  return (
    <header className="relative mb-8 overflow-hidden rounded-3xl border border-amber-400/20 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 p-6 shadow-2xl shadow-black/30">
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-amber-300/20 bg-slate-950 shadow-lg shadow-amber-950/40">
            <img
              src="/aethel.png"
              alt="Símbolo de Aethel"
              className="absolute -top-1.5 left-1/2 h-[150%] w-[150%] max-w-none -translate-x-1/2 object-cover mix-blend-screen"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
              Ecosistema digital
            </p>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
              {tokenName || "Aethel"}
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              {symbol || "AETH"} · Recompensas en blockchain
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Suministro
            </p>

            <p className="mt-1 text-lg font-bold text-white">
              {displayedSupply}
            </p>

            <p className="text-xs font-semibold text-amber-400">
              {symbol || "AETH"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Red
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />

              <p className="text-sm font-bold text-white">
                {displayedNetwork}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}