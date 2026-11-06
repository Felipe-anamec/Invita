# Invita — Arquitectura multimedia conservadora

**Versión:** 0.3.0 · **Fecha:** 2026-11-05. **Principio:** no rehacer un procesador JPEG que ya existe si podemos sanear, ampliar o reutilizarlo. Cambiar el almacenamiento y cambiar el formato **son decisiones separadas**.

## 1. Lo que existe en RSVP to Me

- `lib/client-image.ts`: función `compressImage(file, { maxWidth, maxHeight, quality=0.85 })`. Decodifica mediante `Image`, escala manteniendo proporción sin ampliar y recodifica con `canvas.toBlob(..., 'image/jpeg', quality)`; retorna `File` JPG. La API es basada en `Promise`, pero decodificación/dibujo pueden ocupar el hilo principal: **no afirmar que usa un Web Worker**.
- `app/api/upload/route.ts`: recibe la imagen (hasta 8 MB), aplica controles y guarda bytes en `data/uploads/` mediante Next.js. Solo anfitriones/administradores pueden utilizar esta ruta tal como está; **no sirve directamente para que cualquier participante suba fotos**.
- `app/api/uploads/[filename]/route.ts`: lee y entrega archivos locales. La ruta de lectura no equivale a acceso directo a un bucket.

Estas observaciones se basan en la revisión del código, no en pruebas de navegador. Antes de modificar, seguir cada llamada al compresor, los tamaños reales que utiliza y las dependencias de los campos/URLs persistentes.

## 2. Política inicial (sin reescritura obligatoria)

| Recurso | Formato objetivo inicial | Lado mayor | Descarga oficial |
|---|---|---:|---|
| Foto de comentario | **JPEG** saneado | 400 px | No |
| Foto de galería | **JPEG** saneado | 1200 px | JPG individual / ZIP con JPGs |
| Hero / fotos del lugar | JPEG o formato actual, según auditoría | Por definir | Por definir |
| GIF en comentario | Recurso remoto del proveedor | Según proveedor | No |

Conservar aspecto original y no ampliar imágenes pequeñas. Mantener calidad **0.85** (valor ya implementado) como base de medición, no como garantía definitiva de resultado; decidir después si conviene 0.80 u otro valor. Los límites 400 y 1200 se mantienen como requisitos para los nuevos módulos de comentarios y galerías.

**No existe obligación de introducir WebP.** Una futura comparación JPEG/WebP requeriría razones medibles (peso, calidad, compatibilidad, costos, mantenimiento), aprobación y pruebas de regresión. Si la foto ya está en JPG, entregarla como JPG sin segunda compresión; la descarga de galería se limita a empaquetar los JPEG autorizados.

## 3. Saneamiento: qué debe verificarse

1. Aceptar inicialmente imágenes estáticas en formatos permitidos por la política y rechazar archivos no reconocidos, corruptos o excesivos. No confiar en extensión ni `file.type` declarados.
2. Leer la imagen, corregir orientación, ajustar al límite de píxeles y generar un JPEG nuevo: así se normaliza la estructura y se reduce la información ajena a la imagen.
3. **Comprobar** que el JPEG producido no contenga metadatos de localización, EXIF u otra información privada. La recodificación con canvas normalmente elimina metadatos, pero no asumirlo sin pruebas. Evitar conservar nombres originales con datos personales.
4. Para entradas transparentes, definir composición de fondo (JPG no soporta alfa); probar PNG con transparencia antes de habilitarlo.
5. Limitar píxeles decodificados, dimensiones de origen, tamaño y concurrencia para evitar archivos-bomba y saturación de móviles. Dar progreso, error y cancelación cuando corresponda.
6. **Verificar de forma independiente después de la subida**: tipo real, decodificación segura, tamaño, dimensiones y correspondencia de la carga autorizada. Una persona puede falsificar el proceso frontend: su salida no es una garantía de seguridad.
7. Moderación, borrado, límites de tasa y autorización por evento no dependen del formato.

**Trabajo asíncrono:** aprovechar primero la API actual (`Promise` + `canvas.toBlob`), medir fluidez y solo añadir Web Worker/OffscreenCanvas si hace falta. Especial atención a móviles Android, memoria y redes lentas.

## 4. R2/S3: cambio de almacenamiento, no de formato

**Objetivo acordado:** archivos nuevos cargan y se leen entre navegador y R2/S3, sin que Next.js transporte los bytes en el flujo habitual. Next.js solo autoriza, emite permisos temporales, registra claves/metadata y gestiona publicación. Este flujo **todavía no está implementado en RSVP to Me**.

```text
Navegador
  -> recibe foto y obtiene JPEG saneado (procesador existente adaptado)
  -> solicita autorización de subida a Invita
  -> PUT directo a un objeto temporal R2/S3 (URL firmada)
  -> notifica ID de carga a Invita
       -> verificación independiente del objeto, sin confiar en cliente
       -> READY / REJECTED, vínculo con evento/autor/comentario o galería
  <- GET directo desde storage/CDN o URL autorizada
```

La publicación debe esperar a la verificación; considerar cuarentena, expiración, limpieza de objetos huérfanos y archivos antiguos. Resolver lectura de eventos privados con control de acceso real (por ejemplo URLs firmadas breves). No exponer claves del bucket en frontend; CORS y CSP restringidos. Diseñar compatibilidad con `data/uploads` para no romper portadas o avatares existentes.

**Fase inicial:** mantener rutas locales y formato actual mientras se ensaya R2/S3 en una ruta controlada. Migrar solo después de inventariar referencias y contar con pruebas.

## 5. Galerías y descargas

- **Una fotografía:** el cliente verifica autorización y descarga un **JPG**. Si el recurso almacenado es JPG, no debe recodificarlo. Si eventualmente se habilitara otro formato, la conversión se haría de forma asíncrona.
- **Galería completa:** obtener índice autorizado, descargar JPGs por lotes y generar un `.zip` con **cada foto en JPG**; progresión asíncrona, límite de concurrencia/memoria, estados de error y cancelación.
- No guardar un segundo JPG solo para descarga si el canon es ya JPEG.
- Las imágenes de comentario y GIFs no llevan control de descarga; no intentar bloquear «Guardar imagen como».
- Definir antes de producción pesos totales, límites de archivos y política de fallos parciales.

## 6. GIFs externos

Buscar en un proveedor que autorice el uso (a evaluar), mostrar en contenedor compatible y persistir solo el identificador, proveedor y metadatos que permita la API. No convertir ni subir GIFs. Respetar privacidad, moderación, políticas de contenido, CSP y atribución del proveedor; degradar con elegancia si el recurso desaparece.

## 7. Entidades y puntos de integración conceptuales

`MediaAsset`: objeto externo, evento, autor, tipo, estado, dimensiones, tamaño, clave opaca y vínculo con galería/comentario; **sin** asumir migración ya aprobada. `ExternalGif`: proveedor + ID + asociación al comentario. Mantener `EventTheme.coverImageUrl` y archivos locales operativos hasta resolver migración.

Archivos a inspeccionar antes de cambiar: `lib/client-image.ts`, `app/api/upload/route.ts`, `app/api/uploads/[filename]/route.ts`, `components/event/EventPage.tsx`, `prisma/schema.prisma`, `lib/eventAccess.ts`, `app/actions/event/comments.ts` y pruebas relacionadas.

## 8. Qué debe entregar primero Cursor AI

1. Inventario de llamadas a `compressImage`, formatos, dimensiones, calidad, límites y pruebas disponibles.
2. Demostración de JPEG saneado (incluida eliminación de GPS/EXIF), sin modificar código hasta aprobación.
3. Mapa de usos de `/api/upload` y URLs locales, incluida autorización actual por rol.
4. Propuesta **mínima** para persistir en R2/S3 manteniendo formato JPEG, con plan de transición y rollback.
5. Diseño de validación independiente y permisos privados, con costos/complejidad anotados.
6. Solo después: implementar comentarios fotográficos y galerías, reutilizando piezas existentes.