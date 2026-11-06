# Invita — Guía de inicio para Cursor AI

**Versión:** 0.3.1 · **Actualizado:** 2026-11-06 · **Entorno elegido:** **Cursor AI**. No usar Codex como herramienta del proyecto Invita.

## Prompt de inicio recomendado para Cursor

> Vamos a trabajar en **Invita** (`Felipe-anamec/Invita`), un fork público de `joe-cole1/rsvp-to-me` bajo AGPL-3.0-only. Quiero aprovechar todo lo que ya funciona antes de modificar nada. Lee la documentación propia en `docs/invita/` y examina los archivos originales `ARCHITECTURE.md`, `CONTRIBUTING.md`, `AGENTS.md`, `WORKFLOW.md` y la guía de desarrollo local. Estos dos últimos reflejan el flujo del proyecto original con Codex; **yo trabajaré en Cursor AI**, así que no los interpretes como obligación de usar Codex. Sugiere, por separado y sin sobrescribir el original inadvertidamente, reglas de proyecto para Cursor cuando sea necesario.
>
> La primera tarea es **solo diagnosticar y preparar el entorno**: muestra SHA del fork, remotos, estado Git, dependencias, Node exacto del repositorio y servicios PostgreSQL/Redis. Propón cómo ejecutar la base original y pruebas de humo sin sobrescribir datos ni secrets. No cambies código ni migres datos sin mi aprobación explícita.
>
> Prioridad: conservar funcionalidades de RSVP to Me (QR por evento, RSVP, encuestas, comentarios, panel y autenticación), adaptar branding y español latino, y evaluar Resend usando SMTP existente. No reimplementes módulos resueltos.
>
> **Política multimedia corregida:** el upstream **ya recodifica imágenes a JPEG** con `lib/client-image.ts` (`quality=0.85` predeterminada). Mantén **JPEG como base provisional**: no implementes WebP ni cambies calidad sin auditar y justificar. Queremos sanear imágenes (validar contenido real, límites, orientación, tamaño, metadatos sensibles), fotos de comentario hasta **400 px** y de galería hasta **1200 px**. Aspiramos a R2/S3 para almacenamiento y entrega directa, con autorización y validación independiente, pero **migrar de local a R2 es una tarea separada de conservar JPEG**. Los GIFs se seleccionan de un servicio externo; no se almacenan. Las fotos de galería se descargan como JPG o ZIP con JPG, sin recomprimir por gusto. Los comentarios no tendrán botón de descarga.
>
> Entrega: inventario de lo existente, riesgos, diferencias reales, pruebas realizadas/no realizadas y el **menor cambio viable** con archivos afectados. Antes de editar, explícame el plan y solicita aprobación. Preserva el trabajo previo, no toques `main` directamente, ni publiques credenciales o datos reales de vecinos.

## Puntos a confirmar en el checkout

- Repositorio de trabajo: <https://github.com/Felipe-anamec/Invita>.
- Repositorio de origen: <https://github.com/joe-cole1/rsvp-to-me>.
- SHA inspeccionado en fase documental: `9d1e409322f4a08c19642ae449849d2c9c06e89d` (revalidar al clonar).
- Licencia: `AGPL-3.0-only`; conservar archivo `LICENSE`, atribución y código correspondiente.
- Node `.nvmrc`: `22.23.1`; npm compatible con `package.json`.
- En Windows, upstream recomienda WSL con checkout en su filesystem y Docker Desktop para PostgreSQL/Redis; no copiar procedimientos sin verificar el equipo disponible.
- En checkout nuevo, revisar `scripts/dev-sync.sh --deps` y guía local antes de ejecutarlo: aplica migraciones sobre base de desarrollo, que debe ser desechable.
- `lib/client-image.ts` procesa **JPEG** con canvas; `app/api/upload/route.ts` guarda local y actualmente autoriza solo a anfitriones/administradores; las fotos de participantes requieren arquitectura/permisos adicionales.
- `docs/invita/` contiene nuestras decisiones; los archivos del original mantienen valor como referencia técnica. No sobreescribir `AGENTS.md` o `WORKFLOW.md` para “convertirlos a Cursor” sin un cambio deliberado.

## Resultado requerido de la primera sesión

1. Estado de Git, remotos y SHA.
2. Entorno mínimo y estado real de arranque.
3. Pruebas de humo con resultado reproducible (QR, RSVP, encuestas, comentarios, login, carga de portada).
4. Auditoría del procesador JPEG: puntos de llamada, parámetros, metadatos y validaciones.
5. Rutas de archivos existentes y plan incremental R2/S3.
6. Lista de cambios priorizada con pruebas asociadas.
7. Aprobación del usuario antes de cualquier edición o migración.

## Consideraciones sobre reglas del editor

Cursor puede recibir directrices propias de proyecto en su mecanismo de reglas, según la versión instalada. Primero revisar la configuración disponible y crear reglas específicas de **Invita** en un cambio revisado; no borrar guías upstream ni asumir que todo lo orientado a Codex se aplicará automáticamente a Cursor.