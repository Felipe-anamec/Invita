# Invita — Documentación de producto y desarrollo

**Versión:** 0.3.1 · **Actualizado:** 2026-11-06 · **Base:** fork de [RSVP to Me](https://github.com/joe-cole1/rsvp-to-me) · **Licencia:** AGPL-3.0-only · **Editor/agente:** **Cursor AI**.

## Objetivo

Plataforma autohospedable de eventos: un administrador inicial, muchos eventos, inscripción autónoma por QR, portada informativa y participación con encuestas, actividades, comentarios con fotos/GIFs y galerías. Caso inicial: asados de un edificio; el producto no se limita a esos eventos.

## Regla de implementación

**Reutilizar antes que reescribir.** Conservar Next.js, Prisma, PostgreSQL, Redis, eventos, QR, RSVP, roles, sesiones, encuestas, comentarios, traducciones y pruebas existentes en RSVP to Me. Personalizar marca, español latino y presentación. Ampliar solo donde existan brechas verificadas.

**Actualización multimedia v0.3:** el upstream **ya recodifica JPEG** (calidad 0.85 por defecto). Antes de cambiarlo, auditar y sanear salida: tipo real, dimensiones, orientación, límites y metadatos privados. Mantener 400 px para comentarios y 1200 px para galería. Usar R2/S3 como almacenamiento/entrega objetivo, pero tratar esa integración como independiente del formato. Fotos de galería → JPG individual / ZIP de JPG; GIFs externos sin almacenar archivos.

**Entorno acordado:** trabajar en **Cursor AI**, no Codex. Las guías `AGENTS.md` y `WORKFLOW.md` del proyecto original contienen instrucciones de su propio flujo; consultarlas y adaptar cuidadosamente las reglas del fork sin sobreescribirlas por accidente.

## Documentos

| Documento | Uso |
|---|---|
| [ESPECIFICACION_FUNCIONAL.md](ESPECIFICACION_FUNCIONAL.md) | Requisitos, participantes y pruebas de aceptación. |
| [AUDITORIA_UPSTREAM.md](AUDITORIA_UPSTREAM.md) | Hallazgos reales del repositorio y diferencias. |
| [ARQUITECTURA_MULTIMEDIA.md](ARQUITECTURA_MULTIMEDIA.md) | Preservar JPEG, saneamiento y evolución R2/S3. |
| [DECISIONES.md](DECISIONES.md) | Acuerdos, bases provisionales, propuestas y pendientes. |
| [PLAN_DE_ARRANQUE.md](PLAN_DE_ARRANQUE.md) | Orden de tareas con Cursor AI y validaciones. |
| [LICENCIA_Y_COLABORACION.md](LICENCIA_Y_COLABORACION.md) | AGPL, atribución y colaboración con Joseph. |
| [HANDOFF_CURSOR.md](HANDOFF_CURSOR.md) | Prompt para iniciar la primera sesión técnica en Cursor. |

## Estado del proyecto

La revisión documental tomó como referencia upstream `9d1e409322f4a08c19642ae449849d2c9c06e89d`. El fork público **[`Felipe-anamec/Invita`](https://github.com/Felipe-anamec/Invita)** ya fue creado y conserva su vínculo con Joseph Cole y la licencia AGPL-3.0-only. Aún es necesario clonarlo localmente, verificar HEAD, iniciar el entorno, ejecutar pruebas y decidir migraciones. **Estos documentos no implementan funcionalidades ni configuran servicios.**