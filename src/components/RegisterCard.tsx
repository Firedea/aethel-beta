import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Turnstile } from "@marsidev/react-turnstile";
import { supabase } from "../lib/supabase";

export default function RegisterCard() {
  const [name, setName] = useState("");
  const [profileName, setProfileName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState<User | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleRegister() {
    if (!name.trim()) {
      setMessage("Escribe tu nombre.");
      return;
    }

    if (!email || !password) {
      setMessage("Escribe tu correo y contraseña.");
      return;
    }

    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!turnstileSiteKey) {
      setMessage("Falta configurar la protección anti-bot.");
      return;
    }

    if (!captchaToken) {
      setMessage("Completa la verificación de seguridad.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    captchaToken,
    data: {
      full_name: name.trim(),
    },
  },
});

    if (error) {
      setMessage(error.message);
      setCaptchaToken(null);
      setLoading(false);
      return;
    }

    if (data.user) {
      setMessage(
        "Cuenta creada. Revisa tu correo para confirmar tu cuenta y después inicia sesión."
      );
    }

    setCaptchaToken(null);
    setLoading(false);
  }

  async function handleLogin() {
    if (!email || !password) {
      setMessage("Escribe tu correo y contraseña.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      setUser(data.user);
    }

    setLoading(false);
  }

  async function handleSaveName() {
    if (!profileName.trim()) {
      setMessage("Escribe tu nombre.");
      return;
    }

    setSavingName(true);
    setMessage("");

    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: profileName.trim(),
      },
    });

    if (error) {
      setMessage(error.message);
      setSavingName(false);
      return;
    }

    if (data.user) {
      setUser(data.user);
      setProfileName("");
      setMessage("Nombre actualizado.");
      setSettingsOpen(false);
    }

    setSavingName(false);
  }

  async function handleLogout() {
    setLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setUser(null);
    setSettingsOpen(false);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <p className="text-gray-400">Cargando Aethel...</p>
      </div>
    );
  }

  if (user) {
    const displayName =
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Usuario";

    return (
      <div className="relative max-w-md mx-auto rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700 bg-gray-950 text-xl text-white hover:bg-gray-800"
          aria-label="Abrir menú"
        >
          ☰
        </button>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          Cuenta Aethel
        </p>

        <h2 className="mt-2 pr-14 text-2xl font-bold text-white">
          Hola {displayName} 👋
        </h2>

        <p className="mt-1 text-gray-400">Bienvenido a Aethel.</p>

        <p className="mt-4 text-sm text-gray-500">{user.email}</p>

        {message && (
          <p className="mt-4 text-sm text-gray-300">{message}</p>
        )}

        {settingsOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => setSettingsOpen(false)}
            />

            <aside className="fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] border-l border-gray-800 bg-gray-950 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  Mi cuenta
                </h3>

                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="rounded-lg px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="mt-6">
                <p className="text-sm text-gray-500">Nombre</p>

                <input
                  type="text"
                  placeholder={displayName}
                  value={profileName}
                  onChange={(event) =>
                    setProfileName(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl bg-gray-800 p-3 text-white"
                />

                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="mt-3 w-full rounded-xl bg-amber-400 p-3 font-bold text-black disabled:opacity-50"
                >
                  {savingName ? "Guardando..." : "Guardar nombre"}
                </button>
              </div>

              <div className="mt-8 border-t border-gray-800 pt-6">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-xl border border-red-500/30 p-3 font-semibold text-red-300 hover:bg-red-500/10"
                >
                  Cerrar sesión
                </button>
              </div>
            </aside>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto rounded-2xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-2xl font-bold text-white">
        Crear cuenta Aethel
      </h2>

      <p className="mt-2 text-sm text-gray-400">
        Crea tu cuenta para completar misiones, ganar AETH —los puntos
        de recompensa de Aethel— y desbloquear beneficios.
      </p>

      <input
        type="text"
        placeholder="Tu nombre"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="mt-6 w-full rounded-xl bg-gray-800 p-3 text-white"
      />

      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="mt-3 w-full rounded-xl bg-gray-800 p-3 text-white"
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="mt-3 w-full rounded-xl bg-gray-800 p-3 text-white"
      />

      {turnstileSiteKey ? (
        <div className="mt-4 flex justify-center">
          <Turnstile
            siteKey={turnstileSiteKey}
            options={{
              theme: "dark",
            }}
            onSuccess={(token) => {
              setCaptchaToken(token);
              setMessage("");
            }}
            onExpire={() => {
              setCaptchaToken(null);
            }}
            onError={() => {
              setCaptchaToken(null);
              setMessage(
                "No pudimos completar la verificación de seguridad."
              );
            }}
          />
        </div>
      ) : (
        <p className="mt-4 text-sm text-red-300">
          La protección anti-bot no está configurada.
        </p>
      )}

      <button
        type="button"
        onClick={handleRegister}
        disabled={loading || !captchaToken}
        className="mt-4 w-full rounded-xl bg-amber-400 p-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Creando cuenta..." : "Crear mi cuenta"}
      </button>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-800" />

        <span className="text-xs text-gray-500">
          YA TENGO CUENTA
        </span>

        <div className="h-px flex-1 bg-gray-800" />
      </div>

      <button
        type="button"
        onClick={handleLogin}
        disabled={loading}
        className="w-full rounded-xl border border-amber-400 p-3 font-bold text-amber-400 hover:bg-amber-400/10 disabled:opacity-50"
      >
        Iniciar sesión
      </button>

      {message && (
        <p className="mt-4 text-sm text-gray-300">{message}</p>
      )}
    </div>
  );
}