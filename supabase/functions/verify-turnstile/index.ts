import { withSupabase } from "npm:@supabase/server@^1";

function getClientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    ""
  );
}

export default {
  fetch: withSupabase({ auth: "none" }, async (req) => {
    try {
      const { token } = await req.json();

      if (!token || typeof token !== "string") {
        return Response.json(
          {
            success: false,
            error: "Token de Turnstile requerido",
          },
          { status: 400 }
        );
      }

      const secret = Deno.env.get("CLOUDFLARE_SECRET_KEY");

      if (!secret) {
        console.error("CLOUDFLARE_SECRET_KEY no configurada");

        return Response.json(
          {
            success: false,
            error: "Configuración del servidor incompleta",
          },
          { status: 500 }
        );
      }

      const formData = new FormData();

      formData.append("secret", secret);
      formData.append("response", token);

      const ip = getClientIp(req);

      if (ip) {
        formData.append("remoteip", ip);
      }

      const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: formData,
        }
      );

      const outcome = await response.json();

      console.log("Turnstile result:", outcome);

      if (!outcome.success) {
        return Response.json(
          {
            success: false,
            error: "Verificación de seguridad rechazada",
            errorCodes: outcome["error-codes"] ?? [],
          },
          { status: 403 }
        );
      }

      if (
        outcome.hostname &&
        outcome.hostname !== "aethel-app-eight.vercel.app"
      ) {
        console.error(
          "Hostname Turnstile inesperado:",
          outcome.hostname
        );

        return Response.json(
          {
            success: false,
            error: "Dominio no autorizado",
          },
          { status: 403 }
        );
      }

      return Response.json({
        success: true,
      });
    } catch (error) {
      console.error("verify-turnstile error:", error);

      return Response.json(
        {
          success: false,
          error: "No se pudo verificar Turnstile",
        },
        { status: 500 }
      );
    }
  }),
};