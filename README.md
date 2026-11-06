# Invita

**Invita** es una plataforma de código abierto para organizar eventos y facilitar la participación de sus asistentes: inscripciones, invitados, encuestas, coordinación, conversaciones y, progresivamente, fotografías y galerías colaborativas.

El primer caso de uso son actividades comunitarias —como un asado entre vecinos—, pero el producto está pensado para distintos tipos de eventos.

> **Estado actual:** este repositorio es el fork inicial de **RSVP to Me**. La aplicación todavía conserva gran parte de la interfaz, los flujos y la configuración originales. La identidad y las ampliaciones específicas de Invita están planificadas, **no implementadas**. No se debe confundir esta hoja de ruta con funcionalidades ya disponibles.

## Origen y agradecimientos

Invita es un **fork independiente** de [RSVP to Me](https://github.com/joe-cole1/rsvp-to-me), creado por **Joseph Cole** y colaboradores. Agradecemos el proyecto original y su disposición a recibir propuestas y contribuciones.

El software cubierto por este fork se distribuye bajo **GNU Affero General Public License, versión 3 exclusivamente (AGPL-3.0-only)**. Conservamos el archivo [LICENSE](LICENSE), el historial del repositorio y la atribución al proyecto original. Consulta [licencia y colaboración](docs/invita/LICENCIA_Y_COLABORACION.md) para más información.

Invita no es una distribución oficial de RSVP to Me. Las mejoras de carácter general podrán proponerse al proyecto original de forma separada.

## Qué existe hoy en la base

RSVP to Me ya proporciona gran parte de la infraestructura que aprovecharemos:

- Eventos con portada, fechas, ubicación y configuraciones de privacidad.
- Enlaces y códigos QR por evento, invitaciones, confirmaciones de asistencia (RSVP) y acompañantes.
- Encuestas, coordinación de aportes, comentarios con respuestas y administración.
- Inicio de sesión mediante enlaces mágicos, traducciones y notificaciones.
- Next.js, TypeScript, Prisma, PostgreSQL, Redis, pruebas y despliegue con Docker.

**Diferencias previstas para Invita:** español latinoamericano, presentación visual propia, fotos del lugar, mapas integrados, comentarios con fotografías o GIFs de un proveedor externo, galerías colaborativas y descargas JPG/ZIP. El almacenamiento de imágenes en R2/S3 es un objetivo arquitectónico; **actualmente el código original guarda archivos localmente**. Se preservará inicialmente el procesamiento JPEG existente, sujeto a auditoría y saneamiento.

## Documentación de Invita

La documentación funcional y el plan de trabajo se encuentran en **[docs/invita/](docs/invita/README.md)**:

- [Especificación funcional](docs/invita/ESPECIFICACION_FUNCIONAL.md)
- [Auditoría del upstream](docs/invita/AUDITORIA_UPSTREAM.md)
- [Arquitectura multimedia](docs/invita/ARQUITECTURA_MULTIMEDIA.md)
- [Registro de decisiones](docs/invita/DECISIONES.md)
- [Plan de arranque](docs/invita/PLAN_DE_ARRANQUE.md)
- [Guía de inicio en Cursor AI](docs/invita/HANDOFF_CURSOR.md)
- [Licencia y colaboración](docs/invita/LICENCIA_Y_COLABORACION.md)

La documentación original se conserva en [docs/admin/](docs/admin/) (instalación y operaciones), [docs/host/](docs/host/) (uso de eventos), [ARCHITECTURE.md](ARCHITECTURE.md) (mapa del código) y [CONTRIBUTING.md](CONTRIBUTING.md) (contribuciones al proyecto base). Parte de estos textos sigue refiriéndose a RSVP to Me mientras adaptamos el fork.

## Empezar a desarrollar

Para el desarrollo utilizaremos **Cursor AI**. El repositorio original recomienda **WSL en Windows**, Node `22.23.1` (archivo `.nvmrc`) y Docker para PostgreSQL/Redis. Antes de ejecutar migraciones o scripts de sincronización, utilizar una base de datos **local y desechable** y consultar la [guía de desarrollo original](docs/admin/local-development.md) y nuestra [guía para Cursor](docs/invita/HANDOFF_CURSOR.md).

Para mantener la relación con el proyecto original después de clonar este fork:

```bash
git remote add upstream https://github.com/joe-cole1/rsvp-to-me.git
git fetch upstream
```

No almacenar secretos, fotografías privadas ni datos reales de participantes en Git.

---

**Proyecto:** [Felipe-anamec/Invita](https://github.com/Felipe-anamec/Invita) · **Base:** [joe-cole1/rsvp-to-me](https://github.com/joe-cole1/rsvp-to-me) · **Licencia:** [AGPL-3.0-only](LICENSE)