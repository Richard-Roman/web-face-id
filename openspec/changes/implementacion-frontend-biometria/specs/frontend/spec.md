# Frontend Biometría Specification

## Purpose
Especificar el comportamiento interactivo y de red de las tres vistas principales del frontend (Testing Masivo, Dashboard y Autenticación Biométrica), detallando cómo deben interactuar con el backend de FastAPI usando la arquitectura Vanilla JS + Vite.

## Requirements

### Requirement: Inicialización y Captura de Cámara
El sistema MUST inicializar la cámara web del usuario al acceder a la vista de "Autenticación Biométrica" mediante la API `navigator.mediaDevices.getUserMedia` y mostrar el feed.

#### Scenario: Acceso Exitoso a la Cámara
- GIVEN que el usuario navega a la vista de "Autenticación Biométrica"
- WHEN la página termina de cargar y el navegador solicita permisos de cámara
- THEN el usuario acepta el permiso y el feed de video se inyecta en la vista principal
- AND el botón de "Verificar Identidad" se habilita.

#### Scenario: Permiso de Cámara Denegado
- GIVEN que el usuario navega a la vista de "Autenticación Biométrica"
- WHEN el navegador solicita permisos de cámara y el usuario los deniega (o no hay dispositivo)
- THEN la UI muestra un fallback o banner indicando "Cámara no disponible"
- AND el botón primario de "Verificar Identidad" se deshabilita.

### Requirement: Envío y Verificación de Identidad
El sistema MUST capturar un frame del feed de video y enviarlo como un archivo binario mediante `FormData` (key: `imagen`) al endpoint `POST /verificar`.

#### Scenario: Verificación Exitosa (Match)
- GIVEN que el feed de cámara está activo
- WHEN el usuario hace clic en "Verificar Identidad"
- THEN se extrae un frame de video a blob y se envía a la API
- AND si la respuesta de la API contiene `aceptado: true`, se inyecta la clase CSS de éxito (overlay verde) durante 2 segundos.

#### Scenario: Rostro No Detectado o Rechazado
- GIVEN que el feed está activo pero el usuario está tapado o fuera de foco
- WHEN el usuario presiona "Verificar Identidad"
- THEN si la API responde `rostro_detectado: false`, se despliega el banner "Rostro no detectado" por 3 segundos
- AND si responde `aceptado: false`, se despliega el overlay de error (rojo).

### Requirement: Visualización de Dashboard
El sistema MUST consumir los endpoints `/` (Status) e `/historial` (Auditoría) para rellenar los datos duros de la UI en la vista Dashboard.

#### Scenario: Renderizado Dinámico de Tabla
- GIVEN que el usuario navega a la vista "Dashboard"
- WHEN el controlador JS (`dashboard.js`) se inicializa
- THEN efectúa un `fetch` GET a `http://34.41.144.88:8089/historial?limite=20`
- AND vacía la tabla HTML estática y la repuebla dinámicamente usando template literals con los datos recibidos (Timestamp, ID, Resultado).
- AND si el resultado fue `aceptado: true`, usa badge verde; si no, rojo.

### Requirement: Evaluación por Lotes (Testing Masivo)
El sistema MUST permitir la selección de múltiples archivos (`<input multiple>`) y procesarlos en una única petición a `/evaluar-lote` usando `FormData` con múltiples keys `imagenes`.

#### Scenario: Procesamiento de Lote de Imágenes
- GIVEN que el usuario está en la vista "Testing Masivo"
- WHEN selecciona 10 imágenes locales y presiona "Ejecutar"
- THEN la UI oculta los resultados previos y muestra un estado de carga (loader)
- AND ejecuta un POST a `/evaluar-lote` adjuntando las 10 imágenes en iteración.
- AND al resolver exitosamente, el JSON devuelto actualiza los elementos de texto en pantalla ("Tasa de Aceptación", "Coincidencia Positiva", etc.).
