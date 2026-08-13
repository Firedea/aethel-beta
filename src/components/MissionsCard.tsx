import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Mission = {
  id: string;
  title: string;
  description: string;
  reward: number;
};

type MissionCompletion = {
  mission_id: string;
  reward: number;
};

const missions: Mission[] = [
  {
    id: "complete_profile",
    title: "Completa tu perfil",
    description:
      "Asegúrate de que tu nombre esté guardado correctamente en Aethel.",
    reward: 10,
  },
  {
    id: "daily_checkin_beta",
    title: "Haz tu check-in de hoy",
    description:
      "Registra tu entrada diaria para comenzar tu racha.",
    reward: 10,
  },
  {
    id: "movie_recommendation",
    title: "Recomienda una película",
    description:
      "Cuéntanos una película que recomendarías a alguien más.",
    reward: 10,
  },
  {
    id: "aethel_goal",
    title: "¿Qué te gustaría conseguir con Aethel?",
    description:
      "Dinos qué recompensa o beneficio te gustaría obtener usando Aethel.",
    reward: 20,
  },
];

export default function MissionsCard() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [balance, setBalance] = useState(0);

  const [movie, setMovie] = useState("");
  const [goal, setGoal] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingMission, setSavingMission] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCompletedMissions();
  }, []);

  async function loadCompletedMissions() {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setCompleted([]);
      setBalance(0);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("mission_completions")
      .select("mission_id, reward")
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      setMessage("No pudimos cargar tus misiones.");
      setLoading(false);
      return;
    }

    const rows =
      (data as MissionCompletion[] | null) ?? [];

    const today = new Date().toLocaleDateString("en-CA", {
  timeZone: "America/Mexico_City",
});

const completedIds = rows.map(
  (mission) => mission.mission_id
);

const normalizedCompleted = completedIds.map((id) => {
  if (id === `daily_checkin_beta:${today}`) {
    return "daily_checkin_beta";
  }

  return id;
});

setCompleted(normalizedCompleted);

    setBalance(
      rows.reduce(
        (total, mission) => total + mission.reward,
        0
      )
    );

    setLoading(false);
  }

  async function completeMission(
    mission: Mission,
    answer?: string
  ) {
    if (completed.includes(mission.id)) {
      return;
    }

    setSavingMission(mission.id);
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage(
        "Necesitas iniciar sesión para completar misiones."
      );
      setSavingMission(null);
      return;
    }

    const { error } = await supabase.rpc(
  "complete_mission",
  {
    p_mission_id: mission.id,
    p_answer: answer?.trim() || null,
  }
);

    if (error) {
      console.error(error);

      if (error.code === "23505") {
        setMessage(
          "Esta misión ya había sido completada."
        );

        await loadCompletedMissions();
      } else {
        setMessage(
          "No pudimos guardar la misión. Inténtalo nuevamente."
        );
      }

      setSavingMission(null);
      return;
    }

    setCompleted((current) => [
      ...current,
      mission.id,
    ]);

    setBalance(
      (current) => current + mission.reward
    );

    setMessage(
      `Misión completada. Ganaste ${mission.reward} AETH.`
    );

    setSavingMission(null);
  }

  if (loading) {
    return (
      <section className="rounded-3xl border border-amber-400/20 bg-slate-900/80 p-6">
        <p className="text-slate-400">
          Cargando tus misiones...
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-amber-400/20 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
            Primeros pasos
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Misiones Aethel
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Completa actividades sencillas y comienza
            a ganar AETH.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-right">
          <p className="text-xs text-slate-400">
            Tu saldo
          </p>

          <p className="text-xl font-black text-amber-300">
            {balance} AETH
          </p>
        </div>
      </div>

      {message && (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
          {message}
        </div>
      )}

      <div className="mt-6 space-y-4">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-white">
                Completa tu perfil
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Asegúrate de que tu nombre esté
                guardado correctamente.
              </p>
            </div>

            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
              +10 AETH
            </span>
          </div>

          <button
            type="button"
            disabled={
              completed.includes("complete_profile") ||
              savingMission === "complete_profile"
            }
            onClick={() =>
              completeMission(missions[0])
            }
            className="mt-4 w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {completed.includes("complete_profile")
              ? "Misión completada ✓"
              : savingMission === "complete_profile"
              ? "Guardando..."
              : "Completar misión"}
          </button>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-white">
                Check-in de hoy
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Registra tu entrada diaria a Aethel.
              </p>
            </div>

            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
              +10 AETH
            </span>
          </div>

          <button
            type="button"
            disabled={
              completed.includes("daily_checkin_beta") ||
              savingMission === "daily_checkin_beta"
            }
            onClick={() =>
              completeMission(missions[1])
            }
            className="mt-4 w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {completed.includes("daily_checkin_beta")
              ? "Check-in completado ✓"
              : savingMission === "daily_checkin_beta"
              ? "Guardando..."
              : "Hacer check-in"}
          </button>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-white">
                Recomienda una película
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Cuéntanos qué película recomendarías.
              </p>
            </div>

            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
              +10 AETH
            </span>
          </div>

          <input
            type="text"
            placeholder="Ejemplo: Interestelar"
            value={movie}
            onChange={(event) =>
              setMovie(event.target.value)
            }
            disabled={completed.includes(
              "movie_recommendation"
            )}
            className="mt-4 w-full rounded-xl bg-slate-800 p-3 text-white disabled:opacity-50"
          />

          <button
            type="button"
            disabled={
              !movie.trim() ||
              completed.includes(
                "movie_recommendation"
              ) ||
              savingMission ===
                "movie_recommendation"
            }
            onClick={() =>
              completeMission(
                missions[2],
                movie
              )
            }
            className="mt-3 w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {completed.includes(
              "movie_recommendation"
            )
              ? "Misión completada ✓"
              : savingMission ===
                "movie_recommendation"
              ? "Guardando..."
              : "Enviar recomendación"}
          </button>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-white">
                ¿Qué te gustaría conseguir con Aethel?
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Puede ser una tarjeta, un juego, una
                membresía, un descuento o algo diferente.
              </p>
            </div>

            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
              +20 AETH
            </span>
          </div>

          <textarea
            placeholder="Me gustaría conseguir..."
            value={goal}
            onChange={(event) =>
              setGoal(event.target.value)
            }
            disabled={completed.includes(
              "aethel_goal"
            )}
            className="mt-4 min-h-24 w-full rounded-xl bg-slate-800 p-3 text-white disabled:opacity-50"
          />

          <button
            type="button"
            disabled={
              !goal.trim() ||
              completed.includes("aethel_goal") ||
              savingMission === "aethel_goal"
            }
            onClick={() =>
              completeMission(
                missions[3],
                goal
              )
            }
            className="mt-3 w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {completed.includes("aethel_goal")
              ? "Misión completada ✓"
              : savingMission === "aethel_goal"
              ? "Guardando..."
              : "Enviar respuesta"}
          </button>
        </article>
      </div>
    </section>
  );
}