type RewardsCardProps = {
  balance: string;
  symbol: string;
};

const rewards = [
  { id: "google-play", name: "Google Play", icon: "▶", cost: 1000 },
  { id: "apple", name: "Apple", icon: "●", cost: 1000 },
  { id: "amazon", name: "Amazon", icon: "a", cost: 1000 },
  { id: "phone", name: "Recarga telefónica", icon: "☎", cost: 1000 },
  { id: "roblox", name: "Roblox", icon: "⬡", cost: 1000 },
];

export default function RewardsCard({
  balance,
  symbol,
}: RewardsCardProps) {
  const currentBalance = Number.parseFloat(balance || "0");

  function simulateRedemption(rewardName: string, cost: number) {
    if (currentBalance < cost) {
      const missing = cost - currentBalance;

      alert(
        `Saldo insuficiente. Te faltan ${missing.toLocaleString(
          "es-MX"
        )} ${symbol}.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Simulación de canje:\n\n${rewardName} de $100 MXN\nCosto: ${cost.toLocaleString(
        "es-MX"
      )} ${symbol}\n\nEsta prueba no descontará tokens ni entregará una tarjeta real.`
    );

    if (confirmed) {
      alert(
        "Simulación aprobada. En la siguiente fase conectaremos el canje con la tesorería de Aethel."
      );
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
      <div className="mb-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Recompensas Aethel</h2>

          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400">
            Modo demo
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-400">
          Prueba el catálogo utilizando tu saldo en Base Sepolia.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {rewards.map((reward) => {
          const canRedeem = currentBalance >= reward.cost;
          const missing = Math.max(0, reward.cost - currentBalance);

          return (
            <article
              key={reward.id}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 font-bold text-black">
                  {reward.icon}
                </div>

                <div>
                  <h3 className="font-semibold">{reward.name}</h3>
                  <p className="text-sm text-slate-400">$100 MXN</p>
                </div>
              </div>

              <p className="mb-3 text-sm font-medium text-amber-400">
                {reward.cost.toLocaleString("es-MX")} {symbol}
              </p>

              <button
                type="button"
                onClick={() =>
                  simulateRedemption(reward.name, reward.cost)
                }
                className={`w-full rounded-lg px-3 py-2 text-sm font-bold transition ${
                  canRedeem
                    ? "bg-amber-500 text-black hover:bg-amber-400"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {canRedeem
                  ? "Simular canje"
                  : `Faltan ${missing.toLocaleString("es-MX")} ${symbol}`}
              </button>
            </article>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Catálogo de prueba. AETH en Base Sepolia no representa dinero real.
      </p>
    </section>
  );
}