# Invita — Plan de arranque en Cursor AI

**Versión 0.3.1 — 2026-11-06.** Priorizamos cambios mínimos sobre RSVP to Me y verificaciones antes de refactorizar. El fork público ya existe en [`Felipe-anamec/Invita`](https://github.com/Felipe-anamec/Invita); su ejecución y adaptación todavía están pendientes.

## P0 — Preparar y ejecutar el fork

- [x] Crear fork público `Felipe-anamec/Invita` desde `joe-cole1/rsvp-to-me`, conservando AGPL-3.0-only.
- [ ] Clonar fork, configurar remoto `upstream`, conservar SHA inicial y comprobar árbol Git limpio.
- [ ] Abrir en **Cursor AI**; leer `docs/invita/`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `AGENTS.md` y `WORKFLOW.md` como referencia del original. Los dos últimos mencionan Codex por su propio desarrollo: Invita usará Cursor.
- [ ] Verificar versión de Node en `.nvmrc` (`22.23.1` en la inspección), npm compatible, WSL y Docker según el entorno real.
- [ ] Crear `.env` **solo local** con claves de desarrollo. PostgreSQL y Redis en contenedores desechables; no conectar a bases con datos reales para scripts de sincronización.
- [ ] Seguir `docs/admin/local-development.md`; en checkout fresco revisar `scripts/dev-sync.sh --deps`; arrancar `npm run dev`.
- [ ] Probar flujo original: administración, evento, portada, QR, RSVP, encuesta, comentario, imagen de portada y enlace de ubicación.
- [ ] Guardar reporte de primera ejecución y resultados. Mantener `docs/invita/` versionado y actualizado dentro del fork.

**Criterio de P0:** base funcional y verificable, sin cambios gratuitos ni secretos publicados.

## P1 — Personalización de Invita

| Clave | Acción | Criterio |
|---|---|---|
| I-01 | Marca, paleta y diseño propio | Preservar estructura y flujo de base; app identificable como Invita. |
| I-02 | Español latino | Revisar catálogo `es-ES`, decidir implementación `es-419`; sin claves rotas. |
| I-03 | Zona horaria Chile | `America/Santiago` cuando corresponde, con pruebas de fechas. |
| I-04 | Portada y cuota informativa | Reusar `EventInfoSection` y `Event`, añadir modelos solo si se justifica. |
| I-05 | Fotos del recinto y Google Maps | Reusar enlaces/portada; mapa embebido sujeto a diseño y costos. |
| I-06 | Inscripción comunitaria por QR | Aprovechar QR y RSVP existentes; probar flujo móvil. |
| I-07 | Resend y recuperación | Probar SMTP con dominio verificado; examinar acceso de participantes/edit tokens. |

## P2 — Multimedia con preservación JPEG

| Clave | Acción | Criterio |
|---|---|---|
| M-00 | **Auditoría de `lib/client-image.ts`** | Mapear quién lo usa, tamaños, calidad, errores, metadatos y tests. **No cambiar formato**. |
| M-01 | Saneamiento reutilizable de JPEG | Archivo resultante válido, orientación correcta, dimensiones ajustadas, sin EXIF/GPS y validación de bytes independientes. |
| M-02 | ADR de storage y privacidad | Decidir R2/S3, enlaces/firmas, cuarentena, protección de privados y estrategia de migración. |
| M-03 | Subida y lectura directa con R2/S3 | Mantener JPEG y compatibilidad de rutas locales, validación, prueba de permisos y rollback. |
| M-04 | Fotos adjuntas a comentarios | 400 px, moderación, relación a evento y usuario, sin botón de descarga. |
| M-05 | Galería de evento | 1200 px, orden, moderación, lectura y permisos. |
| M-06 | GIFs de proveedor externo | Selector e ID externo; sin persistir bytes. |
| M-07 | JPG individual y ZIP | Para JPGs existentes, descarga sin recodificación; ZIP asíncrono y controles de memoria. |
| M-08 | Optimización opcional por evidencia | Considerar workers/WebP/otra calidad **solo** con pruebas y aprobación; no tarea comprometida. |

**Secuencia de arquitectura sugerida:** primero medir JPEG/saneamiento; luego diseñar el storage R2; después implementar aportes multimedia. Si una función del original ya cumple el objetivo, reutilizarla.

## P3 — Validación y upstream

- [ ] Pruebas de privacidad entre eventos y permisos de subida de participantes.
- [ ] Tests de regresión de RSVP, QR, login, encuestas, comentarios, fotos y ZIP; preflight rápido o completo según cambio.
- [ ] Pruebas con móviles Android, redes lentas, galerías grandes y límites de memoria.
- [ ] Retención de fotografías, privacidad de vecinos, metadatos y borrado de objetos.
- [ ] Revisar contribuciones genéricas con Joseph mediante issues antes de PRs importantes.

## Convenciones de trabajo en Cursor AI

1. Empezar por lectura y diagnóstico; proponer antes de modificar.
2. Mantener limpio el Git tree y crear ramas por cambio; no editar directamente `main`.
3. Cambios mínimos y pruebas relevantes; no reemplazar componentes originales sin evidencia.
4. No tocar secretos, datos reales o producción por defecto; detenerse ante modificaciones preexistentes no explicadas.
5. Conservar compatibilidad AGPL y atribución; ofrecer mejoras genéricas como PRs separados al upstream si acepta.
6. Si son necesarios lineamientos del editor, crear reglas propias de Invita sin sobreescribir inadvertidamente `AGENTS.md` y `WORKFLOW.md` del upstream.
7. Usar `HANDOFF_CURSOR.md` como inicio de tarea, **no `HANDOFF_CODEX.md`**.