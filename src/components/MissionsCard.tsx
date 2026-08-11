import { useState } from "react";

type MissionsCardProps = {
  account: string;
  symbol: string;
};

const missions = [
  {
    title: "Seguir @aethel08",
    description: "Sigue la cuenta y envía tu wallet pública por mensaje.",
    reward: 25,
  },
  {
    title: "Conectar tu wallet",
    description: "Entra a Aethel desde MetaMask y conecta Base Sepolia.",
    reward: 50,
  },
  {
    title: "Probar una transferencia",
    description: "Realiza una transferencia y conserva su comprobante.",
    reward: 75,
  },
  {
    title: "Enviar comentarios",
    description: "Cuéntanos qué mejorarías o reporta un error real.",
    reward: 100,
  },
];

export default function MissionsCard({
  account,
  symbol,
}: MissionsCardProps) {
  const [copied, setCopied] = useState(false);
  const tokenSymbol = symbol || "AETH";

  const total = missions.reduce(
    (sum, mission) => sum + mission.reward,
    0
  );

  const requestMessage = `Hola, quiero participar en Misiones Aethel Beta.

Wallet pública: ${account}

Misiones completadas:
- Seguir @aethel08
- Conectar wallet
- Probar transferencia
- Enviar comentarios`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(requestMessage);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch {
      window.prompt(
        "Copia este mensaje para enviarlo por Instagram:",
        requestMessage
      );
    }
  }

  return (
    <section className="rounded-3xl border border-amber-400/20 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
            Programa Beta
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Misiones Aethel
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Completa actividades y recibe hasta {total}{" "}
            {tokenSymbol} de prueba.
          </p>
        </div>

        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
          Activo
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {missions.map((mission, index) => (
          <article
            key={mission.title}
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 font-black text-amber-400">
              {index + 1}
            </span>

            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-white">
                {mission.title}
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                {mission.description}
              </p>
            </div>

            <span className="whitespace-nowrap rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
              +{mission.reward} {tokenSymbol}
            </span>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 hover:bg-amber-300"
        >
          {copied ? "Solicitud copiada" : "Copiar solicitud"}
        </button>

        <a
          href="https://www.instagram.com/aethel08/"
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-white/10 px-4 py-3 text-center font-bold text-white hover:bg-white/5"
        >
          Abrir @aethel08
        </a>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        Validación manual durante la beta. Comparte únicamente tu
        dirección pública 0x. Nunca envíes tu frase secreta.
      </p>
    </section>
  );
}