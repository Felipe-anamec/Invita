import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Users,
  MessageSquare,
  ArrowRight,
  Sparkles,
  DollarSign,
} from "lucide-react";

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const events = await db.event.findMany({
    where: {
      visibility: "PUBLIC",
      status: { notIn: ["CANCELLED", "DELETED"] },
    },
    orderBy: {
      startAt: "asc",
    },
    take: 12,
    include: {
      host: {
        select: {
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      theme: true,
      rsvps: {
        select: {
          status: true,
        },
      },
      comments: {
        select: {
          id: true,
        },
      },
      photos: {
        select: {
          id: true,
        },
      },
    },
  });

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] bg-ground text-ink py-12 md:py-20">
      <div className="shell">
        {/* ── Grand Desktop-First Hero ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start pb-16 border-b border-line">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-signal" />
              <span className="tech-index">INVITA / ENCUENTROS COMUNITARIOS</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.88] text-ink uppercase">
              El punto de encuentro <br />
              <span className="text-signal">de tu comunidad.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted max-w-2xl font-sans leading-relaxed border-l-2 border-signal pl-4 my-2">
              Inscripción autónoma mediante un único código QR, cuotas informativas claras,
              encuestas en vivo, comentarios y galerías de recuerdos compartidos.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link href="/auth/sign-in" className="btn-invita btn-signal text-base py-3 px-6 h-12">
                <span>Acceder con tu correo</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <a
                href="#como-funciona"
                className="btn-invita text-base py-3 px-6 h-12 bg-transparent"
              >
                Cómo funciona
              </a>
            </div>
          </div>

          {/* Quick Info Sheet (Right Col in Desktop) */}
          <div className="lg:col-span-4 card-sheet p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <span className="tech-index text-xs">ESTADO DE ACCESO</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-ink">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ABIERTO
              </span>
            </div>

            <div className="flex flex-col gap-4 text-sm font-sans">
              <div className="flex items-start gap-3">
                <span className="font-mono text-signal font-bold">01</span>
                <div>
                  <strong className="block text-ink">Sin contraseñas</strong>
                  <span className="text-muted">
                    Inicio de sesión rápido con enlaces mágicos a tu correo.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-mono text-signal font-bold">02</span>
                <div>
                  <strong className="block text-ink">QR Único por Evento</strong>
                  <span className="text-muted">
                    Imprímelo en conserjería o compártelo por WhatsApp.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-mono text-signal font-bold">03</span>
                <div>
                  <strong className="block text-ink">Cuotas y Coordinación</strong>
                  <span className="text-muted">
                    Informa el aporte sugerido y coordina platos o bebidas.
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-line pt-4 text-xs font-mono text-muted">
              HORA CHILE · AMERICA/SANTIAGO
            </div>
          </div>
        </div>

        {/* ── Active / Upcoming Events Section ────────────────────────────────── */}
        <section className="pt-16" id="eventos">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-line">
            <div>
              <span className="tech-index">AGENDA PÚBLICA</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ink uppercase mt-1">
                Próximos Encuentros
              </h2>
            </div>
            <span className="text-xs font-mono text-muted uppercase">
              {events.length} {events.length === 1 ? "evento activo" : "eventos activos"}
            </span>
          </div>

          {events.length === 0 ? (
            <div className="card-sheet p-12 text-center flex flex-col items-center justify-center gap-4 my-8">
              <div className="w-12 h-12 bg-signal/10 border border-signal flex items-center justify-center text-signal font-mono font-bold text-xl">
                00
              </div>
              <h3 className="font-display text-2xl font-bold uppercase text-ink">
                No hay eventos públicos activos aún
              </h3>
              <p className="text-muted max-w-md text-sm">
                Inicia sesión como organizador para publicar tu primer encuentro comunitario, asado
                o reunión de vecinos.
              </p>
              <Link href="/auth/sign-in" className="btn-invita btn-signal text-sm py-2 px-5 mt-2">
                Crear el primer evento
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event, idx) => {
                const goingCount = event.rsvps.filter((r) => r.status === "GOING").length;
                const coverUrl = event.theme?.coverImageUrl;
                const dateStr = new Intl.DateTimeFormat("es-CL", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: event.timezone || "America/Santiago",
                }).format(new Date(event.startAt));

                return (
                  <article
                    key={event.id}
                    className="card-sheet flex flex-col group overflow-hidden transition-transform hover:-translate-y-1"
                  >
                    {/* Cover Aspect Ratio 16:9 */}
                    <div className="relative w-full aspect-[16/9] bg-ink/5 border-b border-ink overflow-hidden">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={event.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-paper p-4 text-center">
                          <span className="font-mono text-signal text-xs font-bold tracking-widest uppercase">
                            INVITA #{String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="font-display font-bold text-lg text-ink uppercase mt-1">
                            {event.title}
                          </span>
                        </div>
                      )}

                      <div className="absolute top-3 left-3 bg-paper border border-ink px-2.5 py-1 text-xs font-mono font-bold uppercase text-ink shadow-sm">
                        {dateStr}
                      </div>

                      {event.feeDescription && (
                        <div className="absolute bottom-3 right-3 bg-signal text-white px-2.5 py-1 text-xs font-mono font-bold uppercase shadow-sm">
                          {event.feeDescription}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                      <div>
                        <h3 className="font-display text-xl font-bold uppercase text-ink leading-tight group-hover:text-signal transition-colors line-clamp-1">
                          {event.title}
                        </h3>

                        {event.locationName && (
                          <div className="flex items-center gap-1.5 text-xs text-muted mt-2">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-signal" />
                            <span className="truncate">{event.locationName}</span>
                          </div>
                        )}

                        {event.description && (
                          <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">
                            {event.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-line flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-3 text-muted">
                          <span className="flex items-center gap-1 font-bold text-ink">
                            <Users className="w-3.5 h-3.5 text-signal" />
                            {goingCount} inscritos
                          </span>
                          {event.comments.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" />
                              {event.comments.length}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/e/${event.slug}`}
                          className="font-bold text-ink hover:text-signal uppercase flex items-center gap-1"
                        >
                          Ver portada →
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Architectural Features Grid (Desktop 3-Cols) ───────────────────── */}
        <section className="pt-24 pb-12" id="como-funciona">
          <div className="border-t-2 border-ink pt-12">
            <span className="tech-index">DISEÑADO PARA LA CONVIVENCIA</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-ink uppercase mt-2 mb-12">
              Cómo opera Invita en tu comunidad
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card-sheet p-8 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-2xl font-bold text-signal">01</span>
                  <h3 className="font-display text-2xl font-bold uppercase text-ink mt-4 mb-2">
                    Llegada Autónoma
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Un cartel con código QR impreso en el ascensor o la entrada. Cualquier vecino
                    escanea y ve fecha, hora, cuota y fotos del espacio sin pasos previos.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-line text-xs font-mono text-muted uppercase">
                  QR COMPARTIDO · IMPRIMIBLE
                </div>
              </div>

              <div className="card-sheet p-8 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-2xl font-bold text-signal">02</span>
                  <h3 className="font-display text-2xl font-bold uppercase text-ink mt-4 mb-2">
                    Cuentas Claras
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Informa la cuota por persona y coordina aportes en carne, ensaladas o
                    bebestibles para que nada sobre ni falte.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-line text-xs font-mono text-muted uppercase">
                  CUOTA INFORMATIVA · APORTES
                </div>
              </div>

              <div className="card-sheet p-8 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-2xl font-bold text-signal">03</span>
                  <h3 className="font-display text-2xl font-bold uppercase text-ink mt-4 mb-2">
                    Memoria Compartida
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Muro interactivo para coordinar detalles y galería de fotos colaborativa con
                    descargas directas en JPG o archivo ZIP completo.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-line text-xs font-mono text-muted uppercase">
                  GALERÍA · FOTOS SANEADAS
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <footer className="mt-20 pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted">
          <div>INVITA · PLATAFORMA DE ENCUENTROS COMUNITARIOS · LICENCIA AGPL-3.0</div>
          <div className="flex items-center gap-6">
            <Link href="/auth/sign-in" className="hover:text-ink">
              Iniciar sesión
            </Link>
            <span>·</span>
            <span>Chile (America/Santiago)</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
