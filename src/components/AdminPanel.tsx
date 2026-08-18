import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type AdminSection =
  | "resumen"
  | "usuarios"
  | "misiones"
  | "encuestas"
  | "recompensas";

export default function AdminPanel() {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [section, setSection] =
    useState<AdminSection>("resumen");

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAuthorized(false);
        setChecking(false);
        return;
      }

      const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) {
        setAuthorized(false);
        setChecking(false);
        return;
      }

      setAuthorized(true);
      setChecking(false);
    }

    checkAdmin();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-slate-400">
            Verificando acceso...
          </p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-bold">
            Acceso restringido
          </h1>

          <p className="mt-2 text-slate-400">
            Esta sección es exclusiva para administradores
            de Aethel.
          </p>

          <a
            href="/"
            className="mt-6 inline-block rounded-xl bg-amber-500 px-4 py-3 font-bold text-black"
          >
            Volver a Aethel
          </a>
        </div>
      </div>
    );
  }

  const menu: {
    id: AdminSection;
    label: string;
  }[] = [
    { id: "resumen", label: "Resumen" },
    { id: "usuarios", label: "Usuarios" },
    { id: "misiones", label: "Misiones" },
    { id: "encuestas", label: "Encuestas" },
    { id: "recompensas", label: "Recompensas" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="w-64 border-r border-slate-800 bg-slate-900 p-5">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Aethel
            </p>

            <h1 className="mt-1 text-xl font-bold">
              Panel de administración
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Gestión de Aethel Beta
            </p>
          </div>

          <nav className="space-y-2">
            {menu.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  section === item.id
                    ? "bg-amber-500 text-black"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <a
            href="/"
            className="mt-8 block rounded-xl border border-slate-700 px-4 py-3 text-center text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            Volver a Aethel
          </a>
        </aside>

        <main className="flex-1 p-8">
          <div className="mb-8">
            <p className="text-sm text-slate-500">
              Administración
            </p>

            <h2 className="text-3xl font-bold capitalize">
              {section}
            </h2>
          </div>

          {section === "resumen" && (
            <div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <AdminCard
                  title="Usuarios"
                  value="—"
                />

                <AdminCard
                  title="AETH distribuidos"
                  value="—"
                />

                <AdminCard
                  title="Misiones completadas"
                  value="—"
                />

                <AdminCard
                  title="Canjes"
                  value="—"
                />
              </div>

              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">
                  Suministro máximo
                </p>

                <p className="mt-2 text-3xl font-bold text-amber-400">
                  23,000,000 AETH
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  El suministro máximo no representa la
                  cantidad actualmente en circulación.
                </p>
              </div>
            </div>
          )}

          {section === "usuarios" && (
            <Placeholder
              title="Usuarios"
              text="Aquí podrás consultar usuarios, saldo AETH y misiones completadas."
            />
          )}

          {section === "misiones" && (
            <Placeholder
              title="Misiones"
              text="Aquí podrás crear, editar, activar y desactivar misiones."
            />
          )}

          {section === "encuestas" && (
            <Placeholder
              title="Encuestas"
              text="Aquí podrás revisar respuestas y aprobar recompensas."
            />
          )}

          {section === "recompensas" && (
            <Placeholder
              title="Recompensas"
              text="Aquí podrás administrar recompensas, costos y disponibilidad."
            />
          )}
        </main>
      </div>
    </div>
  );
}

function AdminCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

function Placeholder({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="text-xl font-bold">
        {title}
      </h3>

      <p className="mt-2 text-slate-400">
        {text}
      </p>
    </div>
  );
}