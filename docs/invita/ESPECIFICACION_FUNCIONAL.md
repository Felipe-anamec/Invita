# Invita — Especificación funcional

**Versión 0.3.0 — 2026-11-05**

## 1. Propósito y escenario inicial

Invita publica eventos y facilita la inscripción autónoma y la participación. El escenario de validación inicial es un asado en un edificio: el organizador publica un QR común en conserjería y ascensores; los vecinos abren la portada, ven fecha, lugar, cuota y fotografías del espacio; se inscriben y luego participan en encuestas, actividades, conversaciones y galerías.

**No es un gestor de venta de entradas ni una red social genérica.** Debe ampliarse a otros tipos de eventos sin introducir reglas de asados en el modelo de datos.

## 2. Actores y permisos

| Actor | Capacidades |
|---|---|
| Administrador inicial (1) | Gestionar eventos, inscripciones, cuota informativa, encuestas, contenidos, fotografías, moderación, QR y estadísticas. |
| Visitante no inscrito | Abrir URL/QR y consultar los datos marcados como públicos; iniciar inscripción. |
| Participante inscrito | Acceder a información adicional, votar, participar en actividades, comentar, seleccionar GIFs y subir fotos según permisos. |
| Invitado adicional/acompañante | Ya existe el concepto de plus-one en upstream; su modalidad en Invita queda pendiente de definición. |

La base upstream admite varios anfitriones/coanfitriones; **el alcance operativo inicial de Invita usa un solo administrador**, sin necesidad de eliminar roles o relaciones existentes.

## 3. Evento y portada

**Datos visibles previstos en portada pública:**
- Imagen hero de portada.
- Título y descripción.
- Fecha, hora y zona horaria del evento (para Chile, `America/Santiago` cuando corresponda).
- Nombre y dirección del recinto; fotos del lugar.
- Cuota o aporte por asistente (información administrativa, **no pasarela de pagos**).
- Mapa de Google Maps o vista integrada y enlace «Cómo llegar».
- Botón de inscripción y condiciones básicas, si aplica.

El organizador puede crear varios eventos sin que sus encuestas, comentarios, asistentes ni galerías se mezclen. La separación estricta de datos por `eventId` es requisito de seguridad.

**Diferenciación de visibilidad:** existirán datos públicos y datos accesibles solamente tras inscripción válida. La base upstream distingue PUBLIC/UNLISTED/PRIVATE para el evento entero; **la granularidad por sección requiere diseño adicional**, sin debilitar los controles de privacidad ya existentes.

## 4. QR e inscripción

- Cada evento tiene una URL y **un QR compartido** que lleva a la portada, no identifica a un visitante.
- El QR se descarga desde el panel y puede colocarse en afiches, ascensores y conserjería.
- La generación/descarga de QR **ya existe en upstream**; debe verificarse su formato, calidad imprimible y ubicación en la UI Invita.
- La inscripción pública no exige que el administrador invite individualmente a cada vecino.
- Inscripción y recuperación de acceso sin contraseña tradicional. **Se acordó usar correo electrónico y enlaces de acceso; se descartaron las preguntas de seguridad.**
- Envío transaccional mediante **Resend**. Evaluar usar el transporte SMTP ya implementado en upstream antes de agregar un adaptador propio.
- Sesión persistente para que el participante no tenga que autenticarse en cada visita, conforme a límites de seguridad.

**Advertencia de compatibilidad:** RSVP to Me permite RSVP a invitados sin cuenta, usando un enlace personal de edición; sus anfitriones usan magic links. Invita debe revisar y definir cómo integrar el email verificado con los participantes, evitando crear cuentas innecesarias y sin perder compatibilidad con RSVPs existentes.

## 5. Participación y coordinación

- Encuestas de selección simple o múltiple, opciones configurables y resultados según los permisos definidos por evento.
- Comentarios con texto y respuestas anidadas.
- Adjuntos fotográficos en comentarios; límite de imagen según política multimedia.
- Selector de GIFs desde proveedor externo. La selección se guarda como referencia del proveedor, **sin subir ni convertir el GIF**.
- Actividades y aportes coordinados: evaluar reutilizar `PotluckItem`/`PotluckClaim` en vez de crear otro sistema paralelo.
- Galería por evento y fotografías del lugar administradas por el organizador.

## 6. Política de fotografías y GIFs

**Revisión v0.3:** conservamos **JPEG/JPG** como formato inicial porque el upstream ya lo genera mediante `lib/client-image.ts`. No adoptamos WebP automáticamente. Primero se audita el código, se prueba el resultado y se integra saneamiento. El **destino** R2/S3 se diseña por separado del **formato**.

| Tipo | Fuente | Persistencia objetivo | Presentación | Descarga oficial |
|---|---|---|---|---|
| Fotografía de comentario | Archivo del participante | JPEG saneado, lado mayor ≤400 px; R2/S3 tras integración | Comentario/hilo | No |
| Fotografía de galería | Archivo del participante | JPEG saneado, lado mayor ≤1200 px; R2/S3 tras integración | Galería | JPG individual o ZIP completo con JPG |
| GIF en comentario | Proveedor externo | ID y metadatos del proveedor; sin copiar GIF | Componente del proveedor | No |
| Hero y fotos del lugar | Archivos del organizador | Mantener funcionamiento original y evaluar R2/S3 | Portada/lugar | Por definir |

Conservar proporciones, no ampliar imágenes pequeñas, sanear la salida y eliminar datos privados como EXIF/GPS (con pruebas de que realmente se eliminan). La calidad JPEG inicial es la existente en upstream (`0.85` por defecto); el `80 %` anterior estaba vinculado a la propuesta WebP y **ya no es un cambio obligatorio**. La conversión se realiza asíncronamente donde sea posible, sin reescritura preventiva del procesador.

El cliente debe validar preliminarmente y recodificar, pero **no basta con confiar en el navegador**: la salida almacenada necesita comprobación independiente y permisos de publicación por evento. R2/S3 no está integrado en el upstream, cuyas rutas actuales reciben y entregan archivos desde Next.js y `data/uploads`.

## 7. Descargas de galería

- Botón de descarga para una fotografía de galería: el navegador recibe el JPEG autorizado y lo entrega como **JPG sin recomprimirlo innecesariamente**.
- Botón de descarga total: descarga los JPG autorizados y genera un **ZIP** de JPG, sin doble conversión.
- Mostrar progreso, errores por foto y opción de cancelar donde técnicamente sea viable.
- No añadir descarga oficial en fotos/GIFs de comentarios; **no intentar impedir el guardado mediante herramientas propias del navegador**.
- Para colecciones enormes, definir límites/reanudación/particiones antes de prometer funcionamiento ilimitado en móviles.

## 8. Administración y métricas

- Vista de eventos actuales, futuros y pasados.
- Gestión de fechas, horarios, portada, lugar, cuota y permisos.
- Inscripciones, aprobación, cupos y acompañantes cuando las reglas del evento así lo indiquen.
- Encuestas, votos, comentarios, fotos, moderación y reportes.
- Enlace y QR de cada evento, descargables.
- Exportaciones existentes upstream (CSV de asistentes, etc.) a preservar.

## 9. No objetivos del primer ciclo

- Pasarela de pagos, cobro en línea o comprobación automática de transferencias.
- Múltiples administradores operativos, aunque no se eliminará el soporte upstream.
- Almacenamiento de GIFs en el servidor o en R2.
- Retener fotos originales sin límite.
- Construir desde cero módulos que ya existen y funcionan en RSVP to Me.

## 10. Criterios de aceptación esenciales

1. Un vecino escanea un QR impreso y ve la portada de **ese** evento.
2. Desde la misma portada se inscribe sin invitación individual previa.
3. Una inscripción verificada puede acceder al contenido restringido de ese evento, pero no al de otro.
4. Un evento ofrece fecha, hora, cuota, dirección y «Cómo llegar»; si existe mapa integrado, sus errores no bloquean el resto de la página.
5. Un participante contesta una encuesta sin duplicar votos indebidamente.
6. Una foto de comentario se sanea y se guarda en JPEG con lado mayor ≤400 px; no publica datos EXIF/GPS ni un recurso sin verificar.
7. Una foto de galería se sanea y guarda en JPEG con lado mayor ≤1200 px, y se descarga como JPG sin recodificación superflua.
8. La galería completa es descargable como ZIP de JPGs, con tratamiento de errores.
9. Un GIF se reproduce a través de un proveedor externo sin persistir el archivo en nuestra infraestructura.
10. Una vez integrado R2/S3, el servidor Next.js no actúa como proxy de bytes en la carga o lectura habitual de fotos nuevas; sí controla permisos, referencias y publicación. Durante transición se conservan rutas locales para compatibilidad.
11. Un usuario no autorizado no puede obtener acceso a fotos privadas mediante adivinación de URLs ni reutilización de tokens de otro evento.

## 11. Decisiones aún pendientes

Modalidad de acompañantes; relación entre cuota y asistentes; aprobación/cierre; visibilidad por sección; moderación y retención; proveedor GIF; dimensiones de hero y recinto; límites de tamaño/cantidad y políticas de privacidad; mapa embebido y sus costos; identidad del invitado; privacidad del bucket y límites de ZIP; calidad JPEG definitiva y evidencia de saneamiento.