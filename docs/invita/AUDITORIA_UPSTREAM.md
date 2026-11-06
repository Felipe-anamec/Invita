# Invita — Auditoría de aprovechamiento de RSVP to Me

**Corte:** 2026-11-05 · **Documentación Invita v0.3**. **Base inspeccionada:** [RSVP to Me](https://github.com/joe-cole1/rsvp-to-me), referencia [9d1e409](https://github.com/joe-cole1/rsvp-to-me/commit/9d1e409322f4a08c19642ae449849d2c9c06e89d).

**Tipo de revisión:** inspección de código/documentación mediante GitHub. Sin clonar, ejecutar, probar integraciones ni medir rendimiento. El estado «Existe» acredita presencia en el repositorio, **no** calidad o ajuste completo a Invita.

## 1. Inventario de subsistemas

| Necesidad de Invita | Evidencia actual del upstream | Decisión de trabajo |
|---|---|---|
| Stack Next.js/React | `package.json`: Next.js 16.4.4, React 19.3.1, TypeScript | Reutilizar; respetar versiones fijadas. |
| Datos PostgreSQL / Prisma | `prisma/schema.prisma`, Prisma 7 | Reutilizar; no reemplazar ORM. |
| Redis | `lib/redis.ts`, `lib/capacityLock.ts`, `lib/rateLimit.ts` | Conservar al inicio; revisar dependencia real antes de simplificar. |
| Auth de anfitriones | `app/actions/auth.ts`, `lib/auth.ts`, `lib/session.ts` | Reutilizar. |
| Acceso/edición de invitados | `RSVP.editToken`, `lib/eventAccess.ts`, `app/e/[slug]/rsvp/` | Auditar antes de agregar magic links para participantes. |
| Panel de eventos | `app/(app)/dashboard/`, `app/(app)/admin/` | Rebranding, no reconstruir. |
| Portada de evento | `app/e/[slug]/page.tsx`, `components/event/EventPage.tsx` | Rediseñar sobre arquitectura existente. |
| Enlace y QR del evento | `docs/host/inviting-guests.md`; `components/event/event-page/ShareQrModal.tsx`, `HostBar.tsx`, paquete `qrcode` | **Existe:** evaluar resolución/descarga imprimible. |
| Ubicación | `Event.locationName`, `Event.locationAddress`, `lib/calendar.ts#buildGoogleMapsUrl` | Enlace existe; mapa embebido por evaluar. |
| Cuota/aporte monetario informativo | No se identificó campo especializado en `Event` | **Agregar** si no lo cubre una sección configurable. |
| Foto hero | `EventTheme.coverImageUrl`, estilos/temas | Reutilizar modelo; migrar estrategia de archivos con cuidado. |
| Fotos del recinto y galería | No se identificó módulo de galería | **Agregar** entidad, UI, permisos y API de metadatos. |
| Encuestas | `Poll`, `PollOption`, `PollVote`; guía de encuestas | Reutilizar. |
| Coordinación de comida/aportes | `PotluckItem`, `PotluckClaim` | Reutilizar o adaptar antes de inventar «actividades». |
| Comentarios anidados | `Comment`, `app/actions/event/comments.ts` | Extender con multimedia, preservando autorización. |
| GIFs externos | No se identificó selector de GIFs en comentario | **Agregar** proveedor/referencia externa; no subir archivos GIF. |
| Envío de correo | `lib/email.ts` con Nodemailer SMTP / Cloudflare | **Evaluar Resend SMTP primero**; API propia solo si hay justificación. |
| Idiomas | `next-intl`, `messages/en-US.json`, `messages/es-ES.json`, `messages/locales.json` | Adaptar `es-419` o estrategia equivalente; no traducir todo desde cero. |
| Procesamiento actual de imágenes | `lib/client-image.ts`: canvas → **JPEG**, calidad 0.85 por defecto | **Conservar y auditar**; incorporar saneamiento/validación y parametrizar 400/1200 px sin cambiar formato por defecto. |
| Subidas actuales | `app/api/upload/route.ts`: recibe bytes y escribe `data/uploads/` (solo HOST/ADMIN en la ruta actual) | Mantener compatibilidad, diseñar R2/S3 por separado y autorización de subida para participantes. |
| Lectura actual de archivos | `app/api/uploads/[filename]/route.ts`: lee archivo local | Migración/referencias para nuevos archivos, sin romper URLs antiguas. |
| Pruebas | `test:*`, Playwright, `tests/regression/`, `scripts/preflight.sh` | Mantener y ampliar. |
| Seguridad | `lib/eventAccess.ts`, `lib/auth-guards.ts`, Turnstile, CSP, límites de tasa | Integrar nuevos módulos en estos controles. |
| Licencia/contribución | `LICENSE`, `CONTRIBUTING.md`, `AGENTS.md`, `WORKFLOW.md` | Cumplir AGPL-3.0-only y flujo upstream. |

## 2. Brechas arquitectónicas importantes

### A. Participante inscrito frente a usuario autenticado

La identidad `User` y el acceso del invitado mediante `RSVP.editToken` tienen límites distintos. **No asociar automáticamente cualquier sesión que comparta un correo con una inscripción sin verificar el vínculo autorizado.** Hay que revisar las rutas de recuperación, edición, deduplicación y permisos antes de introducir el nuevo flujo con Resend.

### B. Páginas públicas frente a secciones restringidas

Upstream ya ofrece modalidades `PUBLIC`, `UNLISTED` y `PRIVATE`, pero protegen el evento como un todo. Invita quiere mostrar portada pública y contenido ampliado para inscritos. Agregar permisos por sección o un módulo de área participante sin debilitar `lib/eventAccess.ts` ni filtrar información en metadatos, enlaces sociales, API, calendario o galerías.

### C. JPEG existente frente a almacenamiento local

**No confundir formato con infraestructura.** `lib/client-image.ts` ya entrega JPEG; **no reemplazarlo por WebP sin una comparación aprobada**. Auditar si el resultado realmente se sanea (orientación, EXIF/GPS, contenido decodificable, límites, calidad, transparencia) y reutilizar el procesador que ya funciona.

La ruta upstream `/api/upload` acepta bytes y los escribe en `data/uploads`; `/api/uploads/[filename]` los lee. Esto **sí** difiere de nuestro objetivo R2/S3 y carga/lectura directa, pero el cambio de ubicación **no requiere** cambiar JPEG. Mantener compatibilidad con archivos existentes y verificar que la ruta solo permita actualmente carga HOST/ADMIN. Diseñar permisos específicos para participantes antes de añadir imágenes en comentarios y galerías.

### D. QR existente no significa flujo comunitario terminado

El QR y la URL compartible ya existen. La tarea no es «generar un QR» sino verificar impresión, contenido público, inscripción, autenticación, control de spam y experiencia móvil para vecinos.

## 3. Puntos de entrada concretos para Cursor AI

- Inicio: `ARCHITECTURE.md`, `AGENTS.md`, `WORKFLOW.md`, `CONTRIBUTING.md`.
- Modelos: `prisma/schema.prisma`.
- Evento: `app/e/[slug]/page.tsx`, `components/event/EventPage.tsx`, `components/event/event-page/`.
- QR: `components/event/HostBar.tsx`, `components/event/event-page/ShareQrModal.tsx`.
- Inscripción: `app/e/[slug]/rsvp/page.tsx`, `app/actions/event/rsvp.ts`, `lib/eventAccess.ts`, `lib/session.ts`.
- Comentarios: `app/actions/event/comments.ts`, modelo `Comment`.
- Fotos: `lib/client-image.ts`, `app/api/upload/route.ts`, `app/api/uploads/[filename]/route.ts`.
- Mail: `lib/email.ts`, `docs/admin/email.md`.
- Localización: `messages/locales.json`, `messages/es-ES.json`, `messages/en-US.json`, `i18n/`.
- Validaciones: `lib/schemas.ts`, `lib/auth-guards.ts`, `lib/captcha.ts`.
- Tests: `tests/`, `tests/regression/`, `scripts/preflight.sh`.

## 4. Comprobaciones obligatorias antes del primer cambio

1. Clonar el **fork** y registrar el SHA exacto de upstream (`git rev-parse HEAD`).
2. Ejecutar entorno local **sin** adaptar código y comprobar inicio de sesión, crear evento, QR, RSVP, comentarios y encuestas.
3. Verificar sesión de usuario/RSVP, ruta de QR y modos de privacidad en navegador real.
4. Obtener un inventario real de endpoints de subida, usos de URLs locales y parámetros del compresor JPEG. Verificar metadatos/EXIF y autorización de host frente a participante.
5. Probar el `es-ES` upstream; documentar cambios que requiere español latino.
6. Leer los ADRs pertinentes antes de cambios a almacenamiento, auth o permisos.
7. No eliminar Redis, Cloudflare worker opcional, SMTP ni roles hasta demostrar necesidad.
8. Preparar una migración de datos retrocompatible antes de modificar Prisma; no modificar el formato JPEG por la sola incorporación de R2/S3.

## 5. Fuentes verificadas

- [Mapa de arquitectura](https://github.com/joe-cole1/rsvp-to-me/blob/main/ARCHITECTURE.md)
- [Esquema Prisma](https://github.com/joe-cole1/rsvp-to-me/blob/main/prisma/schema.prisma)
- [Guía QR/compartir](https://github.com/joe-cole1/rsvp-to-me/blob/main/docs/host/inviting-guests.md)
- [Guía de encuestas y comentarios](https://github.com/joe-cole1/rsvp-to-me/blob/main/docs/host/polls-potluck-comments.md)
- [Guía de desarrollo local](https://github.com/joe-cole1/rsvp-to-me/blob/main/docs/admin/local-development.md)
- [Guía de correo](https://github.com/joe-cole1/rsvp-to-me/blob/main/docs/admin/email.md)