# Invita — Licencia, atribución y colaboración con el upstream

**Corte:** 2026-11-05. Esto es una guía operativa de buenas prácticas, no asesoría jurídica.

## 1. Licencia confirmada

El repositorio **RSVP to Me** de Joseph Cole publicó [`LICENSE`](https://github.com/joe-cole1/rsvp-to-me/blob/main/LICENSE) con GNU Affero General Public License, **versión 3 solamente** (`AGPL-3.0-only`). El [`package.json`](https://github.com/joe-cole1/rsvp-to-me/blob/main/package.json) y el [`README.md`](https://github.com/joe-cole1/rsvp-to-me/blob/main/README.md) reflejan la licencia. El README identifica copyright 2026 de Joseph Cole y colaboradores.

La licencia permite copiar, modificar, alojar, redistribuir y usos comerciales bajo sus condiciones. Una versión modificada servida por red queda sujeta al deber de ofrecer a sus usuarios el **código fuente correspondiente** de esa versión, conforme a AGPL-3.0; se conservan avisos, licencia y notas de modificaciones. No deben publicarse secretos, bases de datos, datos de residentes ni material privado.

## 2. Obligaciones prácticas de Invita

- Preservar el texto original de `LICENSE` sin modificarlo, más avisos de terceros pertinentes.
- Mantener atribución a **RSVP to Me / Joseph Cole y colaboradores** en código y documentación pertinente.
- Marcar los archivos modificados con avisos razonables de cambio cuando aplique.
- Mantener visible una vía para que los usuarios obtengan el código fuente correspondiente a la versión que usan, conforme a AGPL.
- No usar la denominación ni identidad gráfica de Joseph como si respaldara oficialmente Invita; diferenciar claramente proyectos.
- Revisar licencias adicionales de iconos, fuentes, fotos de portada y servicios de GIFs.
- Documentar y conservar derechos de autor de las contribuciones originales de Invita.

## 3. Contribución recíproca

Joseph respondió positivamente en el [issue #796](https://github.com/joe-cole1/rsvp-to-me/issues/796), anunció AGPL-3.0 y expresó interés por las contribuciones. Ahora existe [`CONTRIBUTING.md`](https://github.com/joe-cole1/rsvp-to-me/blob/main/CONTRIBUTING.md).

**Regla de trabajo:** las funciones genéricas son candidatas para el upstream; marca, diseño propio y necesidades comunitarias específicas permanecen en el fork si no son generales.

Ejemplos potencialmente genéricos: mejoras de traducción, subida directa a storage compatible S3, imágenes en comentarios, galería colaborativa y mejor validación de archivos. **No enviarlas sin consultar antes**: el mantenedor pide abrir un issue para funcionalidades sustanciales y esperar acuerdo de alcance.

**Flujo de contribución:** comprobar issues/PRs existentes → conversar alcance → rama pequeña → pruebas → documentación → PR contra `joe-cole1/rsvp-to-me:main` → seguimiento de revisión.

La contribución a upstream se ofrece bajo AGPL-3.0-only sin transferencia obligatoria de copyright, según `CONTRIBUTING.md`.

## 4. Seguridad y colaboración responsable

- No reportar públicamente vulnerabilidades explotables; usar reporte privado de seguridad o consultar canal privado primero.
- No subir `.env`, credenciales de Resend/R2, magic links, edit tokens, cookies, capturas con correos/identidades ni datos reales del edificio.
- No dar por aprobado un issue abierto; la aceptación de PR la determina el mantenedor.
- No fusionar cambios de rebranding de Invita en PRs técnicos destinados al upstream.

## 5. Nota para el repositorio Invita

Agregar en el README de Invita, cuando exista, una sección equivalente a:

> Invita is a modified fork of [RSVP to Me](https://github.com/joe-cole1/rsvp-to-me), originally developed by Joseph Cole and contributors. The covered software is distributed under GNU AGPL v3.0 only. See LICENSE and the source-code link for the running version. Invita is an independent project and is not an official release of RSVP to Me.

El enlace de fuente debe apuntar a la **versión pública real de Invita** que corresponda a su despliegue; no basta enlazar únicamente el upstream si hay modificaciones propias.