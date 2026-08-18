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

  const [joiningRewardId, setJoiningRewardId] =
    useState<number | null>(null);

  const [waitlistMessages, setWaitlistMessages] = useState<
    Record<number, string>
  >({});

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

  async function joinWaitlist(rewardId: number) {
    setJoiningRewardId(rewardId);

    setWaitlistMessages((current) => ({
      ...current,
      [rewardId]: "",
    }));

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setWaitlistMessages((current) => ({
        ...current,
        [rewardId]: "Inicia sesión para apuntarte.",
      }));

      setJoiningRewardId(null);
      return;
    }

    const { error } = await supabase
      .from("reward_waitlist")
      .insert({
        user_id: user.id,
        reward_id: rewardId,
      });

    if (error) {
      if (error.code === "23505") {
        setWaitlistMessages((current) => ({
          ...current,
          [rewardId]: "Ya estás en la lista de espera.",
        }));
      } else {
        console.error("Error en waitlist:", error);

        setWaitlistMessages((current) => ({
          ...current,
          [rewardId]: "No pudimos agregarte. Intenta otra vez.",
        }));
      }

      setJoiningRewardId(null);
      return;
    }

    setWaitlistMessages((current) => ({
      ...current,
      [rewardId]: "Listo. Te avisaremos cuando esté disponible.",
    }));

    setJoiningRewardId(null);
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
        <p className="text-sm text-red-400">
          {error}
        </p>
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
                    <>
                      <span className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
                        Sin stock
                      </span>

                      <button
                        type="button"
                        disabled={joiningRewardId === reward.id}
                        onClick={() => joinWaitlist(reward.id)}
                        className="mt-4 w-full rounded-lg border border-amber-500 px-3 py-2 text-sm font-bold text-amber-400 transition hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {joiningRewardId === reward.id
                          ? "Guardando..."
                          : "Avísame"}
                      </button>

                      {waitlistMessages[reward.id] && (
                        <p className="mt-2 text-xs text-slate-400">
                          {waitlistMessages[reward.id]}
                        </p>
                      )}
                    </>
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