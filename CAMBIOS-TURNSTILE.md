# Correcciones puntuales: formulario y Turnstile

Base: última copia Angular compartida previamente en esta conversación, **no una exportación verificada de la versión que hoy está publicada en GitHub**.

## Archivos de código modificados

- `src/app/shared/security/turnstile.service.ts`: si el script de Turnstile no carga o supera el tiempo de espera, se libera la promesa fallida y es posible volver a intentar. Se limpian temporizadores y escuchas; se configura callback de timeout.
- `src/app/pages/contact/contact.component.ts`: se evita un segundo envío mientras hay otro en curso; la interfaz espera un token válido; si falla el widget ofrece reintento; se limpian tokens vencidos y se muestran errores de conexión sin afectar los envíos exitosos.
- `src/app/pages/contact/contact.component.html`: botón de reintento, envío deshabilitado hasta completar Turnstile en producción.
- `src/app/pages/contact/contact.component.scss`: estilo discreto del botón de reintento.
- `src/app/pages/contact/contact-api.service.ts`: elimina barras finales de `apiUrl` antes de concatenar `/api/contact`.

## Lo que estas correcciones NO hacen

Los errores `401` de las solicitudes de Private Access Tokens, las advertencias de `powerPreference`, WOFF2 y los bloqueos `data:,` del iframe interno de Cloudflare pueden seguir viéndose en Chrome DevTools. No dependen del código de Angular cuando Turnstile resuelve correctamente el desafío; no se desactiva CSP para ocultarlos.

## MUY IMPORTANTE antes de subir a GitHub

La copia Angular compartida originalmente tenía valores de ejemplo en `src/environments/environment.prod.ts`.
Actualmente la web publicada funciona con valores reales. **Si reemplazás el repositorio completo con este ZIP sin conservar esos valores reales, el formulario podría dejar de funcionar.**

Recomendación: **usar el ZIP de parche** y copiar solamente los cinco archivos de código anteriores al repositorio que ya tenés funcionando en producción.

El parche NO modifica `environment.prod.ts`, ni la Site Key, ni el dominio, ni el diseño de la web, ni el backend.

## Pruebas realizadas en este entorno

- 20 archivos TypeScript procesados sin errores de sintaxis usando `typescript.transpileModule`.
- Prueba simulada de carga fallida y reintento del script Turnstile: correcta.
- Verificado que la acción de Turnstile continúa siendo `legal_contact_form`.

No se pudo ejecutar `npm run build` completo porque el contenedor no tiene dependencias Angular instaladas y Node disponible es 22.16.0 (el proyecto pide al menos 22.22.3). Una prueba en Cloudflare Pages sigue siendo necesaria.

## Verificación después del push

1. Comprobar que el build de Pages termina correctamente.
2. Recargar `/contacto` en ventana de incógnito.
3. Completar Turnstile, enviar una consulta de prueba, comprobar `POST .../api/contact` con `201` y correos.
4. En caso de error real de carga, comprobar que aparezca `Reintentar verificación de seguridad` y funcione al recuperar la conexión.
