# Invita — Registro de decisiones

**Versión:** 0.3.0 · **Actualizado:** 2026-11-05.

**Estados:** **Acordado** = intención confirmada; **Existente upstream** = código presente en RSVP to Me, todavía sujeto a pruebas; **Base provisional** = conservar comportamiento original mientras se evalúa; **Propuesto** = no aprobado; **Pendiente** = no implementar sin decidir.

| ID | Estado | Decisión / hallazgo |
|---|---|---|
| D-001 | Acordado | Plataforma para eventos con inscripción autónoma y participación, no solo envío de invitaciones individuales. |
| D-002 | Acordado | Un administrador operativo inicial, múltiples eventos y decenas/cientos de inscritos como objetivo, sin afirmar rendimiento probado. |
| D-003 | Acordado · Existente upstream | URL compartida y QR público por evento; probar el flujo de impresión/inscripción. |
| D-004 | Acordado | Portada con hero, fecha/hora, lugar, cuota, fotos del lugar, e información ampliada para inscritos. |
| D-005 | Acordado | Email y enlace de acceso sin contraseña; descartadas preguntas de seguridad. Mantener sesión persistente con controles. |
| D-006 | Acordado | Resend para correos; evaluar transporte SMTP upstream antes de añadir un adaptador. |
| D-007 | Acordado | Aprovechar Next.js, Prisma, PostgreSQL y Redis existentes. |
| D-008 | Acordado | Fork de RSVP to Me, aprovechar lógica y arquitectura; Invita tendrá identidad visual y UI en español latinoamericano. |
| D-009 | Acordado | Respetar AGPL-3.0-only, conservar avisos/atribución y ofrecer código fuente correspondiente. |
| D-010 | Existente upstream | Licencia `LICENSE` y `CONTRIBUTING.md` publicados por Joseph Cole. |
| D-011 | Acordado · Parcial upstream | Fotos del lugar y Google Maps; ya existe enlace de Maps, falta revisar mapa embebido. |
| D-012 | Acordado | Comentarios con texto, fotos y GIFs elegidos en servicio externo. |
| D-013 | Acordado | GIFs externos referenciados por ID/proveedor; no subir, copiar ni convertir sus bytes. |
| D-014 | Acordado | Fotografías en comentarios: **lado máximo 400 px**, conservando relación de aspecto; sin descarga oficial. |
| D-015 | Acordado | Fotografías de galería: **lado máximo 1200 px**, conservando relación de aspecto; descarga JPG individual o ZIP de JPG. |
| D-016 | **Base provisional — sustituye v0.2** | **Conservar JPEG/JPG como formato de salida/almacenamiento inicial** y reutilizar el procesador existente. No convertir a WebP por sistema sin auditoría, medición y aprobación. |
| D-017 | Acordado · Evaluación técnica pendiente | Sanear imágenes al ingresar: validar tipo y límites, normalizar orientación/dimensiones, recodificar como imagen limpia, descartar metadatos privados (incluido GPS/EXIF), con validación independiente del navegador. |
| D-018 | Base provisional | `lib/client-image.ts` ya recodifica en JPEG, calidad `0.85` por defecto. **Conservar ese valor por ahora**, medir resultados y decidir luego si hace falta cambiar a `0.80`. |
| D-019 | Acordado | Usar almacenamiento externo R2/S3 para fotos; la ruta de subida/lectura directa sin tránsito de bytes por Next.js es diseño objetivo, sujeto a auditoría de migración y control de accesos. |
| D-020 | Acordado | Una imagen de galería se entrega en `.jpg` y la galería completa en `.zip` con JPGs; operaciones asíncronas. Si ya está en JPG, **no recodificar innecesariamente**. |
| D-021 | Acordado | Fotos y GIFs de comentarios sin botones de descarga; no intentar bloquear funciones nativas del navegador. |
| D-022 | Base provisional | Evitar conservar originales sin límite o duplicados innecesarios, pero auditar el flujo actual y las necesidades de migración antes de eliminarlo. |
| D-023 | Preferencia | Cloudflare R2 como opción principal, con interfaz compatible S3; falta configurar proveedor, bucket, políticas y costos. |
| D-024 | Acordado | Contribuir mejoras genéricas al upstream cuando el mantenedor acepte el alcance; separar rebranding propio de PRs técnicos. |
| D-025 | **Acordado — nuevo** | **Cursor AI será el entorno de trabajo de Invita, NO Codex.** Usar la guía `HANDOFF_CURSOR.md` y adaptar instrucciones propias del fork. |
| D-026 | Existente upstream | El proyecto original incluye QR, encuestas, comentarios anidados, RSVP, potluck y traducción `es-ES`. |
| D-027 | Existente upstream | Procesamiento `canvas → JPEG` asíncrono por `toBlob`; ruta actual `/api/upload` pasa por Next.js y guarda en `data/uploads/`. Formato y ubicación son asuntos separados. |
| D-028 | Pendiente | Identidad y permiso concreto de participantes cuando se integra Resend con `RSVP.editToken` y `User`. |
| D-029 | Pendiente | Acompañantes, cuotas por persona, aforo, moderación, visibilidad por sección, retención y proveedor de GIFs. |
| D-030 | Pendiente | Perfiles de hero, fotos del recinto, límites de archivos, calidad JPEG definitiva, estrategia de borrado y protección de recursos privados. |
| D-031 | Propuesto | Workers/OffscreenCanvas solo si el procesador actual bloquea la UI o no cumple requisitos, luego de pruebas en dispositivos reales. |

## Cambio de rumbo respecto de v0.2

La v0.2 establecía WebP 80 % como requisito inmediato. **Esa decisión queda reemplazada** por D-016/D-018: JPEG es la base inicial, porque RSVP to Me ya lo implementa. **Los tamaños 400/1200 px, el saneamiento, R2/S3 y las descargas JPG/ZIP siguen en el alcance.** Reutilizar JPEG no significa que el almacenamiento actual ya sea R2: hoy es local y pasa por la API; eso requiere trabajo independiente.

También queda retirada la guía `HANDOFF_CODEX.md` del paquete; el documento correcto es `HANDOFF_CURSOR.md`. El upstream conserva archivos llamados `AGENTS.md` y `WORKFLOW.md`, redactados para su propio desarrollo con Codex: sirven para estudiar reglas y arquitectura, **no definen nuestra herramienta de trabajo**.

## Historial

- **2026-11-04 · v0.1:** conceptualización, QR y participación.
- **2026-11-05 · v0.2:** auditoría de RSVP to Me, AGPL, plan y propuesta WebP.
- **2026-11-05 · v0.3:** herramienta Cursor AI; conservar JPEG mientras se audita, priorizar saneamiento e integración externa sin refactor gratuito.