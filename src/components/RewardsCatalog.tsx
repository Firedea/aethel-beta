import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Reward = {
  id: number;
  title: string;
  description: string | null;
  cost_aeth: number;
  stock_quantity: number;
  active: boolean;
};

export default function RewardsCatalog() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRewards() {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      setAuthenticated(true);

      const { data, error } = await supabase
        .from("rewards")
        .select(
          "id, title, description, cost_aeth, stock_quantity, active"
        )
        .eq("active", true)
        .order("cost_aeth", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error("Error cargando recompensas:", error);
        setError("No pudimos cargar las recompensas.");
        setLoading(false);
        return;
      }

      setRewards(data ?? []);
      setLoading(false);
    }

    loadRewards();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadRewards();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

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
          Usa tus AETH — puntos de recompensa de Aethel —
          para desbloquear beneficios.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-slate-400">
          Cargando recompensas...
        </p>
      )}

      {!loading && !authenticated && (
        <p className="text-sm text-slate-400">
          Inicia sesión para ver las recompensas disponibles.
        </p>
      )}

      {!loading && authenticated && error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {!loading &&
        authenticated &&
        !error &&
        rewards.length === 0 && (
          <p className="text-sm text-slate-400">
            Todavía no hay recompensas publicadas.
          </p>
        )}

      {!loading && authenticated && rewards.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {rewards.map((reward) => {
            const available = reward.stock_quantity > 0;

            return (
              <article
                key={reward.id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <h3 className="font-semibold">
                  {reward.title}
                </h3>

                {reward.description && (
                  <p className="mt-1 text-sm text-slate-400">
                    {reward.description}
                  </p>
                )}

                <p className="mt-4 font-semibold text-amber-400">
                  {reward.cost_aeth.toLocaleString("es-MX")} AETH
                </p>

                <div className="mt-3">
                  {available ? (
                    <span className="inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                      Disponible
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
                      Sin stock
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}