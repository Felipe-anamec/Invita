"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { sendMagicLinkAction } from "@/app/actions/auth";
import { useCaptcha } from "@/components/ui/CaptchaProvider";
import Link from "next/link";
import { ArrowRight, Mail, AlertTriangle, CheckCircle2 } from "lucide-react";

function TokenError() {
  const searchParams = useSearchParams();
  if (searchParams.get("error") !== "invalid-token") return null;
  return (
    <div className="bg-signal/10 border border-signal p-4 mb-6 flex items-start gap-3 text-sm text-ink font-sans">
      <AlertTriangle className="w-5 h-5 text-signal flex-shrink-0 mt-0.5" />
      <div>
        <strong className="block font-bold">Enlace expirado o ya utilizado</strong>
        <span>Por favor ingresa tu correo para solicitar un nuevo enlace de acceso.</span>
      </div>
    </div>
  );
}

export default function SignInForm({
  openRegistration,
  redirect,
}: {
  openRegistration: boolean;
  redirect?: string;
}) {
  const [identifier, setIdentifier] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { runWithCaptcha } = useCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAuthFailed(false);
    setLoading(true);

    let result;
    try {
      result = await runWithCaptcha("signin", (token) =>
        sendMagicLinkAction(identifier, redirect, token)
      );
    } catch (reason) {
      setLoading(false);
      setError(reason instanceof Error ? reason.message : "Error en verificación de seguridad");
      return;
    }

    setLoading(false);
    if (result.error === "auth_failed") {
      setAuthFailed(true);
    } else if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error ?? "Ocurrió un error inesperado al procesar la solicitud.");
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-xl">
        <div className="card-sheet p-8 sm:p-12 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-line pb-4 mb-8">
            <span className="tech-index">INVITA / ACCESO DIRECTO</span>
            <span className="text-xs font-mono font-bold text-muted">SIN CONTRASEÑAS</span>
          </div>

          <Suspense>
            <TokenError />
          </Suspense>

          {submitted ? (
            <div className="flex flex-col gap-6 py-4">
              <div className="w-12 h-12 bg-signal/10 border border-signal flex items-center justify-center text-signal">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <span className="tech-index text-xs">REVISA TU CORREO</span>
                <h2 className="font-display text-3xl font-bold uppercase text-ink mt-1">
                  Enlace mágico enviado
                </h2>
                <p className="text-muted mt-3 text-sm leading-relaxed">
                  Hemos enviado un enlace de inicio de sesión a{" "}
                  <strong className="text-ink font-mono">{identifier}</strong>. Haz clic en el
                  enlace del correo para ingresar automáticamente.
                </p>
              </div>

              <div className="pt-6 border-t border-line flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setIdentifier("");
                  }}
                  className="text-xs font-mono font-bold uppercase text-ink hover:text-signal underline cursor-pointer"
                >
                  ← Usar otro correo
                </button>
                <Link
                  href="/"
                  className="text-xs font-mono font-bold uppercase text-muted hover:text-ink"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          ) : authFailed ? (
            <div className="flex flex-col gap-6 py-4">
              <div className="w-12 h-12 bg-red-100 border border-red-500 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <span className="tech-index text-xs text-red-600">ACCESO RESTRINGIDO</span>
                <h2 className="font-display text-3xl font-bold uppercase text-ink mt-1">
                  Cuenta no registrada
                </h2>
                <p className="text-muted mt-3 text-sm leading-relaxed">
                  El registro requiere un código de invitación o que la inscripción esté abierta. Si
                  eres anfitrión, contacta al administrador.
                </p>
              </div>

              <div className="pt-6 border-t border-line">
                <button
                  type="button"
                  onClick={() => {
                    setAuthFailed(false);
                    setIdentifier("");
                  }}
                  className="btn-invita text-xs py-2 px-4"
                >
                  Intentar con otra cuenta
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink uppercase">
                  Iniciar Sesión
                </h1>
                <p className="text-sm text-muted mt-2">
                  Ingresa tu correo para recibir un enlace de acceso directo. No necesitas recordar
                  contraseñas.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-400 p-3 text-xs text-red-700 font-mono">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono uppercase font-bold tracking-wider text-ink">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="vecino@comunidad.cl"
                    className="w-full bg-ground border border-ink text-ink font-sans text-base px-4 py-3 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-signal rounded-none"
                  />
                  <Mail className="w-5 h-5 text-muted absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-invita btn-signal text-sm py-3.5 px-6 font-mono font-bold uppercase flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? "Enviando enlace..." : "Continuar con Enlace Mágico"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-line text-center">
                <span className="text-xs text-muted font-sans">
                  {openRegistration ? "¿No tienes cuenta? " : "¿Nuevo anfitrión? "}
                  <Link
                    href="/auth/register"
                    className="font-bold text-ink underline hover:text-signal ml-1"
                  >
                    Crear cuenta aquí
                  </Link>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
