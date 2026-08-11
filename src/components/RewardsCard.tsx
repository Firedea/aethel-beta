type RewardsCardProps = {
  balance: string;
  symbol: string;
  redeeming: boolean;
  onRedeem: (
    rewardName: string,
    cost: number,
    downloadUrl?: string
  ) => Promise<void>;
};

const rewards = [
  {
    id: "aethel-finanzas",
    name: "Aethel Control Financiero",
    description: "Plantilla premium de Excel",
    icon: "XL",
    cost: 250,
    available: true,
    downloadUrl:
      "/rewards/Aethel_Control_Financiero.xlsx",
  },
  {
    id: "google-play",
    name: "Google Play",
    description: "$100 MXN",
    icon: "▶",
    cost: 1000,
    available: false,
  },
  {
    id: "apple",
    name: "Apple",
    description: "$100 MXN",
    icon: "●",
    cost: 1000,
    available: false,
  },
  {
    id: "amazon",
    name: "Amazon",
    description: "$100 MXN",
    icon: "a",
    cost: 1000,
    available: false,
  },
  {
    id: "phone",
    name: "Recarga telefónica",
    description: "$100 MXN",
    icon: "☎",
    cost: 1000,
    available: false,
  },
  {
    id: "roblox",
    name: "Roblox",
    description: "$100 MXN",
    icon: "⬡",
    cost: 1000,
    available: false,
  },
];

export default function RewardsCard({
  balance,
  symbol,
  redeeming,
  onRedeem,
}: RewardsCardProps) {
  const currentBalance = Number.parseFloat(balance || "0");

  async function requestRedemption(
    rewardName: string,
    cost: number,
    available: boolean,
    downloadUrl?: string
  ) {
    if (!available) {
      alert("Esta recompensa todavía no tiene inventario.");
      return;
    }

    if (currentBalance < cost) {
      const missing = cost - currentBalance;

      alert(
        `Saldo insuficiente. Te faltan ${missing.toLocaleString(
          "es-MX"
        )} ${symbol}.`
      );

      return;
    }

    await onRedeem(rewardName, cost, downloadUrl);
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
      <div className="mb-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">
            Recompensas Aethel
          </h2>

          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400">
            Beta
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-400">
          Utiliza tus AETH para obtener recompensas disponibles.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {rewards.map((reward) => {
          const canRedeem =
            reward.available &&
            currentBalance >= reward.cost;

          const missing = Math.max(
            0,
            reward.cost - currentBalance
          );

          return (
            <article
              key={reward.id}
              className={`rounded-xl border p-4 ${
                reward.available
                  ? "border-amber-500/40 bg-slate-950"
                  : "border-slate-800 bg-slate-950 opacity-70"
              }`}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-sm font-bold text-black">
                  {reward.icon}
                </div>

                <div>
                  <h3 className="font-semibold">
                    {reward.name}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {reward.description}
                  </p>
                </div>
              </div>

              <p className="mb-3 text-sm font-medium text-amber-400">
                {reward.cost.toLocaleString("es-MX")}{" "}
                {symbol}
              </p>

              <button
                type="button"
                disabled={redeeming || !reward.available}
                onClick={() =>
                  requestRedemption(
                    reward.name,
                    reward.cost,
                    reward.available,
                    reward.downloadUrl
                  )
                }
                className={`w-full rounded-lg px-3 py-2 text-sm font-bold transition ${
                  canRedeem
                    ? "bg-amber-500 text-black hover:bg-amber-400"
                    : "bg-slate-800 text-slate-400"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {!reward.available
                  ? "Sin stock"
                  : redeeming
                    ? "Procesando..."
                    : canRedeem
                      ? "Canjear y descargar"
                      : `Faltan ${missing.toLocaleString(
                          "es-MX"
                        )} ${symbol}`}
              </button>
            </article>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        La plantilla digital está disponible. Las tarjetas se
        habilitarán únicamente cuando exista inventario.
      </p>
    </section>
  );
}