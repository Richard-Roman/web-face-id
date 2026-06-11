# Guía Técnica de Integración: Backend (FastAPI) ↔ Frontend

Este documento define el contrato de la API y sirve como guía de integración para el desarrollo del Front-End (aplicación web, como tu archivo HTML actual, o aplicaciones móviles) contra el sistema de Reconocimiento Facial.

## 1. Consideraciones Generales

- **Base URL:** `http://34.41.144.88:8089` (o la IP donde esté levantado Uvicorn, ej: `http://192.168.0.10:8089`).
- **CORS:** El backend ya está configurado con `allow_origins=["*"]`, por lo que no deberías tener problemas de *Cross-Origin Resource Sharing* al consumir la API desde el navegador (localhost) o desde otros dominios.
- **Formato de Peticiones:** Los endpoints de lectura usan el estándar REST (`GET`). Los endpoints de verificación requieren **Multipart/Form-Data** para el envío de imágenes binarias.

---

## 2. Endpoints Disponibles

### 2.1. Estado del Servidor (Healthcheck)
Verifica si la API está viva, si el modelo `.pkl` se cargó exitosamente en memoria, el umbral global de seguridad, y datos de salud interna (uso de RAM y tiempo activo).

- **URL:** `/`
- **Método:** `GET`
- **Respuesta (200 OK - application/json):**
  ```json
  {
    "estado": "online",
    "modelo_cargado": true,
    "encodings_en_modelo": 29,
    "umbral_global": 0.45,
    "memoria_mb": 112.5,
    "uptime_segundos": 3450.2,
    "timestamp": "2026-06-10T16:30:00.000000"
  }
  ```

### 2.2. Verificación Geométrica (Login Biométrica)
Endpoint principal para validar la identidad biométrica contra el modelo en memoria.

- **URL:** `/verificar`
- **Método:** `POST`
- **Headers:** `Content-Type: multipart/form-data`
- **Body Params:**
  - `imagen` (Requerido - File): El archivo binario de la foto capturada (jpg, png, webp).
  - `umbral` (Opcional - Float): Distancia máxima para aceptar al usuario. Por defecto usa `0.45` (o el valor configurado en el backend).
- **Respuesta (200 OK - application/json):**
  ```json
  {
    "rostro_detectado": true,
    "archivo": "captura_webcam.jpg",
    "timestamp": "2026-06-10T16:32:00.000000",
    "mensaje": "✓ Usuario verificado con 77.0% de similitud.",
    "distancia_minima": 0.2301,
    "distancia_media": 0.3150,
    "umbral": 0.45,
    "aceptado": true,
    "similitud": 77.0,
    "similitud_minima": 55.0
  }
  ```

### 2.3. Evaluación por Lote (Testing Masivo)
Envía múltiples imágenes al mismo tiempo para obtener métricas agregadas (ideal para tu archivo `testing_masivo.html`).

- **URL:** `/evaluar-lote`
- **Método:** `POST`
- **Headers:** `Content-Type: multipart/form-data`
- **Body Params:**
  - `imagenes` (Requerido - Array of Files): Múltiples archivos binarios. Enviar el campo como array (ej: varios `append('imagenes', archivo)` en el FormData).
  - `umbral` (Opcional - Float): Umbral de validación.
- **Respuesta (200 OK - application/json):**
  ```json
  {
    "total_imagenes": 50,
    "con_rostro_detectado": 48,
    "aceptados": 45,
    "rechazados": 3,
    "tasa_aceptacion": 93.8,
    "umbral_usado": 0.45,
    "resultados": [
       {
         "archivo": "test1.jpg",
         "rostro_detectado": true,
         "aceptado": true,
         "distancia_minima": 0.25
       }
    ]
  }
  ```

### 2.4. Historial de Accesos (Auditoría)
Devuelve los últimos intentos de verificación en memoria (hasta 100 registros por defecto).

- **URL:** `/historial`
- **Método:** `GET`
- **Query Params:**
  - `limite` (Opcional - Integer): Cantidad de registros a devolver (por defecto 20). Ejemplo: `/historial?limite=50`.
- **Respuesta (200 OK - application/json):**
  ```json
  {
    "total": 15,
    "mostrando": 15,
    "entradas": [
      {
        "rostro_detectado": true,
        "aceptado": false,
        "distancia_minima": 0.65
      }
    ]
  }
  ```

### 2.5. Limpiar Historial
Vacía la memoria temporal del log de auditoría en el backend.

- **URL:** `/historial`
- **Método:** `DELETE`
- **Respuesta (200 OK - application/json):**
  ```json
  {
    "mensaje": "Historial limpiado."
  }
  ```

---

## 3. Ejemplos de Implementación en Frontend (Vanilla JS / Fetch)

> [!TIP]
> **Regla de oro con Multipart/Form-Data en Javascript:** NUNCA le agregues el header `Content-Type: multipart/form-data` a mano cuando uses `fetch`. La API Fetch genera automáticamente los "boundaries" (límites separadores) necesarios cuando le pasás un objeto `FormData`. Si forzás el header, vas a romper la solicitud.

### 3.1. Enviar una foto desde un formulario web (Simulando Login)

```javascript
// Asumiendo que tenés un <input type="file" id="foto" accept="image/*">
const inputFoto = document.getElementById('foto');

async function verificarIdentidad() {
    if (inputFoto.files.length === 0) {
        alert("Seleccioná o capturá una foto primero.");
        return;
    }

    const formData = new FormData();
    
    // ATENCIÓN: El key TIENE que ser 'imagen', es lo que espera FastAPI
    formData.append('imagen', inputFoto.files[0]); 
    // formData.append('umbral', 0.4); // Opcional, si querés sobreescribir el umbral

    try {
        const respuesta = await fetch('http://34.41.144.88:8089/verificar', {
            method: 'POST',
            body: formData 
        });

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const data = await respuesta.json();

        if (!data.rostro_detectado) {
            console.warn("No se detectó un rostro. Acercate más a la cámara.");
            return;
        }

        if (data.aceptado) {
            console.log(`¡Éxito! Usuario legítimo (Similitud: ${data.similitud}% / Min: ${data.similitud_minima}%)`);
            // Acá actualizarías el DOM para mostrar éxito
        } else {
            console.error(`Rechazado. Posible impostor. Similitud: ${data.similitud}% (Falta para llegar a ${data.similitud_minima}%)`);
            // Acá actualizarías el DOM para mostrar error/alerta
        }

    } catch (error) {
        console.error("Fallo la comunicación con el backend:", error);
    }
}
```

### 3.2. Enviar un lote de imágenes (Testing Masivo / QA)

Acabo de ver que estás posicionado en el archivo `testing_masivo.html`. Este código te sirve exacto para esa vista:

```javascript
// Asumiendo un <input type="file" id="fotosLote" accept="image/*" multiple>
const inputLote = document.getElementById('fotosLote');

async function evaluarBatch() {
    if (inputLote.files.length === 0) return;
    
    const formData = new FormData();
    
    // Iteramos y agregamos todas las fotos bajo el MISMO key 'imagenes'
    for (let i = 0; i < inputLote.files.length; i++) {
        formData.append('imagenes', inputLote.files[i]);
    }

    try {
        // Podés mostrar un spinner acá porque esto va a demorar dependiendo la cantidad de fotos
        const respuesta = await fetch('http://34.41.144.88:8089/evaluar-lote', {
            method: 'POST',
            body: formData
        });

        const data = await respuesta.json();
        
        console.log("Resumen del batch:");
        console.log(`Total evaluadas: ${data.total_imagenes}`);
        console.log(`Aceptadas: ${data.aceptados}`);
        console.log(`Rechazadas: ${data.rechazados}`);
        console.log(`Tasa de Aceptación: ${data.tasa_aceptacion}%`);
        
        // La lista 'data.resultados' tiene el detalle de CADA foto.
        console.table(data.resultados);

    } catch (error) {
        console.error("Error al evaluar el lote:", error);
    }
}
```
