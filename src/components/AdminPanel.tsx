import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type AdminSection =
  | "resumen"
  | "usuarios"
  | "misiones"
  | "encuestas"
  | "recompensas";

type AdminUser = {
  user_id: string;
  email: string | null;
  full_name: string;
  created_at: string;
  missions_completed: number;
  aeth_earned: number;
  aeth_spent: number;
  aeth_balance: number;
};

export default function AdminPanel() {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [section, setSection] =
    useState<AdminSection>("resumen");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

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

  useEffect(() => {
    if (!authorized) return;

    async function loadUsers() {
      setUsersLoading(true);
      setUsersError("");

      const { data, error } = await supabase.rpc(
        "admin_list_users"
      );

      if (error) {
        console.error(
          "Error cargando usuarios:",
          error
        );

        setUsersError(
          "No pudimos cargar los usuarios."
        );

        setUsersLoading(false);
        return;
      }

      const normalizedUsers: AdminUser[] =
        (data ?? []).map((user: AdminUser) => ({
          ...user,
          missions_completed: Number(
            user.missions_completed
          ),
          aeth_earned: Number(user.aeth_earned),
          aeth_spent: Number(user.aeth_spent),
          aeth_balance: Number(user.aeth_balance),
        }));

      setUsers(normalizedUsers);
      setUsersLoading(false);
    }

    loadUsers();
  }, [authorized]);

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
            Esta sección es exclusiva para
            administradores de Aethel.
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

  const totalUsers = users.length;

  const totalMissions = users.reduce(
    (total, user) =>
      total + user.missions_completed,
    0
  );

  const totalAeth = users.reduce(
    (total, user) => total + user.aeth_earned,
    0
  );

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
                onClick={() =>
                  setSection(item.id)
                }
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

        <main className="min-w-0 flex-1 p-8">
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
                  value={
                    usersLoading
                      ? "—"
                      : totalUsers.toLocaleString(
                          "es-MX"
                        )
                  }
                />

                <AdminCard
                  title="AETH distribuidos"
                  value={
                    usersLoading
                      ? "—"
                      : `${totalAeth.toLocaleString(
                          "es-MX"
                        )} AETH`
                  }
                />

                <AdminCard
                  title="Misiones completadas"
                  value={
                    usersLoading
                      ? "—"
                      : totalMissions.toLocaleString(
                          "es-MX"
                        )
                  }
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
                  El suministro máximo no representa
                  la cantidad actualmente en
                  circulación.
                </p>
              </div>
            </div>
          )}

          {section === "usuarios" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900">
              <div className="border-b border-slate-800 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">
                      Usuarios registrados
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Consulta saldo y actividad de
                      los usuarios de Aethel.
                    </p>
                  </div>

                  {!usersLoading &&
                    !usersError && (
                      <span className="rounded-full bg-amber-500/15 px-3 py-1 text-sm font-semibold text-amber-400">
                        {totalUsers} usuarios
                      </span>
                    )}
                </div>
              </div>

              {usersLoading && (
                <p className="p-5 text-sm text-slate-400">
                  Cargando usuarios...
                </p>
              )}

              {!usersLoading && usersError && (
                <p className="p-5 text-sm text-red-400">
                  {usersError}
                </p>
              )}

              {!usersLoading &&
                !usersError &&
                users.length === 0 && (
                  <p className="p-5 text-sm text-slate-400">
                    Todavía no hay usuarios
                    registrados.
                  </p>
                )}

              {!usersLoading &&
                !usersError &&
                users.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-5 py-4">
                            Usuario
                          </th>

                          <th className="px-5 py-4">
                            Registro
                          </th>

                          <th className="px-5 py-4">
                            Misiones
                          </th>

                          <th className="px-5 py-4">
                            Ganados
                          </th>

                          <th className="px-5 py-4">
                            Gastados
                          </th>

                          <th className="px-5 py-4">
                            Saldo
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {users.map((user) => (
                          <tr
                            key={user.user_id}
                            className="border-b border-slate-800 last:border-0"
                          >
                            <td className="px-5 py-4">
                              <p className="font-semibold">
                                {user.full_name ||
                                  "Sin nombre"}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {user.email ||
                                  "Sin correo"}
                              </p>
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                              {new Date(
                                user.created_at
                              ).toLocaleDateString(
                                "es-MX"
                              )}
                            </td>

                            <td className="px-5 py-4">
                              {user.missions_completed}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-emerald-400">
                              +
                              {user.aeth_earned.toLocaleString(
                                "es-MX"
                              )}{" "}
                              AETH
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-red-400">
                              -
                              {user.aeth_spent.toLocaleString(
                                "es-MX"
                              )}{" "}
                              AETH
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 font-bold text-amber-400">
                              {user.aeth_balance.toLocaleString(
                                "es-MX"
                              )}{" "}
                              AETH
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
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