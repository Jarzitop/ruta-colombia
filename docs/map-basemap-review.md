# Mapa base del piloto: revisión de acceso, licencias y funcionamiento offline

Fecha de revisión: 7 de octubre de 2026. La cartografía y las rutas de transporte son capas independientes.

## Decisión implementada para el MVP en desarrollo

El mapa usa un estilo MapLibre **local, sin fuentes de tiles, fuentes tipográficas remotas ni API keys** (véase `src/map/TransitMap.tsx`). Dibuja únicamente paradas con coordenadas del catálogo y una línea si el itinerario corresponde **al patrón entero** y su geometría ya está en el dataset. No representa calles ni navegación peatonal; eso queda indicado en la interfaz.

- Permite probar y depurar cámara, gestos, selección e instrucciones sin proveedores externos.
- La lógica `findDirectItineraries` no depende del mapa; el usuario puede ocultarlo si la vista nativa presenta fallos.
- No ofrece descarga ni precarga de mapas de calle.
- En Android se probará `androidView="texture"` para comprobar si evita la pantalla negra reportada. **No se ha validado todavía en dispositivo**.
- El encuadre se basa en coordenadas de paradas documentadas. Si hay un recorrido parcial, no se dibuja la geometría completa como si fuera el tramo elegido.

## Alternativas consideradas para calles de Bogotá

### MapLibre Demo Tiles — descartado como mapa callejero

La documentación oficial indica que los tiles de demostración son para desarrollo y que la producción requiere estilo/tiles propios o proveedor externo. No sirven para validar un mapa detallado de Bogotá.

Fuente: https://maplibre.org/maplibre-react-native/docs/setup/getting-started/

### Servidor público de OpenStreetMap — no integrado

La política de `tile.openstreetmap.org` exige identificación de la app mediante User-Agent apropiado, atribución visible, respeto del cacheo y prohíbe las descargas masivas y el uso offline/pre-carga. No se verificó aún que MapLibre React Native satisface todas las condiciones HTTP y caché requeridas, por lo que **no se conecta al servidor** hasta esa verificación. Además, el servidor no ofrece SLA y puede limitar acceso por uso excesivo.

Fuente primaria: https://operations.osmfoundation.org/policies/tiles/

### MapTiler Cloud Free — candidato para mapa callejero online del piloto

MapTiler permite integrar mapas en apps móviles; el plan Free está orientado a pruebas y uso personal/no comercial, con cuota limitada. Necesita una **API key de una cuenta de MapTiler**. Deben mostrarse la atribución y el logotipo exigidos. No se permite descarga masiva de tiles para almacenar offline sin acuerdo apropiado. Superar los límites del plan gratuito puede suspender temporalmente el servicio; no activar planes facturables ni contratar otros sin autorización.

Fuentes primarias:
- https://www.maptiler.com/cloud/pricing/
- https://www.maptiler.com/terms/cloud/
- https://docs.maptiler.com/guides/credentials/api-key/

**Pendiente antes de integrar:** verificar con una clave propia del proyecto la cobertura de calles del sector piloto en Bogotá, el nivel de detalle visible, la política de restricciones de la clave en Android (User-Agent/HTTP origin), el consumo esperado, atribución exacta y el comportamiento al perder red. La clave del lado del cliente no debe asumirse secreta; debe limitarse a los dominios/aplicaciones y cuotas según permita el proveedor.

### Stadia Maps Free — alternativa de reserva

Ofrece mapas base gratuitos con límite mensual de créditos y prohibición de uso comercial en el plan gratuito. No se integra ahora para evitar dos proveedores y duplicación de cuentas. Si MapTiler no cumple el piloto, revisar sus requisitos de autenticación y atribución.

Fuente: https://stadiamaps.com/pricing/

## Regla de selección

Para la **próxima APK de integración** se mantendrá el fondo esquemático local, apto para probar el motor sin conexión, hasta completar el contrato y la elección segura de tiles. No se anunciará un mapa de calles offline. Si la muestra real de Bogotá llega antes de un proveedor, el viaje directo se puede validar por paradas y texto sin bloquearse.

Antes de una distribución pública se exige: mapa base de calles legalmente utilizable, atribución correcta, gestión de costos y degradación limpia cuando fallen los tiles. El proveedor queda por definir, no se ha contratado ninguno.
