# Informe Técnico: Sistema de Reconocimiento Facial Biométrico (RedShield)

**Versión:** 1.0.0
**Fecha:** Junio 2026
**Clasificación:** Uso interno / Documentación técnica

---

## 1. Descripción del Sistema

**RedShield** es una plataforma web de reconocimiento facial biométrico compuesta por dos capas: un **backend de inferencia** basado en FastAPI (Python) desplegado en la nube, y un **frontend web** moderno construido con Vite + TailwindCSS que actúa como interfaz operacional. El sistema permite verificar identidades en tiempo real mediante análisis de similitud facial sobre un modelo de encodings pre-entrenados.

---

## 2. Arquitectura General

```
┌─────────────────────────────┐           ┌──────────────────────────────────┐
│        FRONTEND (Web)       │  HTTP/    │        BACKEND (FastAPI)         │
│                             │  REST     │                                  │
│  index.html     (Dashboard) │ ────────► │  GET /             (Healthcheck) │
│  autenticacion.html         │ ────────► │  POST /verificar   (Biometría)   │
│  testing_masivo.html        │ ────────► │  POST /evaluar-lote(Batch/QA)    │
│                             │ ────────► │  GET  /historial   (Auditoría)   │
│  Vite + TailwindCSS         │ ────────► │  DELETE /historial (Limpieza)    │
│  Vanilla JS (ES6 Modules)   │           │                                  │
└─────────────────────────────┘           │  Uvicorn · 34.41.144.88:8089     │
                                          └──────────────────────────────────┘
```

**Comunicación:** REST sobre HTTP. El backend acepta imágenes como `multipart/form-data`. Permite CORS con `allow_origins=["*"]`.

---

## 3. Funcionalidades del Modelo de Reconocimiento Facial

El núcleo del sistema es un modelo de encodings faciales cargado en memoria en el backend. Estas son las operaciones que expone y lo que hace en cada una:

### 3.1. Verificación Biométrica Individual (`POST /verificar`)

Compara una imagen enviada contra todos los encodings registrados en el modelo. Devuelve una decisión binaria de aceptación o rechazo basada en métricas de distancia euclidiana.

**Parámetros de entrada:**
| Campo | Tipo | Descripción |
|---|---|---|
| `imagen` | `File` (jpg/png/webp) | Foto a verificar |
| `umbral` | `Float` (opcional) | Distancia máxima aceptada. Default: `0.45` |

**Respuesta del modelo:**
| Campo | Tipo | Descripción |
|---|---|---|
| `rostro_detectado` | `bool` | Si se identificó un rostro en la imagen |
| `aceptado` | `bool` | Decisión final: Match o Rechazo |
| `similitud` | `float` | Porcentaje de similitud con el mejor encoding (ej: `77.0%`) |
| `similitud_minima` | `float` | Umbral mínimo de similitud equivalente al umbral configurado |
| `distancia_minima` | `float` | Distancia euclidiana al encoding más cercano (ej: `0.2301`) |
| `distancia_media` | `float` | Promedio de distancias respecto a todos los encodings |
| `umbral` | `float` | Umbral que se aplicó en esta comparación |
| `mensaje` | `string` | Descripción legible del resultado |

**Lógica de decisión:**
- Si `distancia_minima <= umbral` → `aceptado: true` (Match confirmado)
- Si `distancia_minima > umbral` → `aceptado: false` (Rechazo / posible impostor)
- Si no se detecta rostro → `rostro_detectado: false` (sin comparación)

> La `similitud` es la representación porcentual derivada de la distancia euclidiana. Valores cercanos al 100% indican alta correspondencia con el sujeto registrado.

---

### 3.2. Evaluación por Lote (`POST /evaluar-lote`)

Procesa múltiples imágenes en una sola petición. Diseñado para escenarios de QA/testing masivo para medir el rendimiento del modelo sobre datasets biométricos.

**Parámetros de entrada:**
| Campo | Tipo | Descripción |
|---|---|---|
| `imagenes` | `Array<File>` | Múltiples imágenes enviadas bajo el mismo key |
| `umbral` | `Float` (opcional) | Umbral de clasificación aplicado al lote completo |

**Respuesta agregada del modelo:**
| Campo | Tipo | Descripción |
|---|---|---|
| `total_imagenes` | `int` | Cantidad total de imágenes procesadas |
| `con_rostro_detectado` | `int` | Imágenes donde el modelo detectó un rostro válido |
| `aceptados` | `int` | Imágenes clasificadas como identidad confirmada |
| `rechazados` | `int` | Imágenes rechazadas (fuera del umbral) |
| `tasa_aceptacion` | `float` | Porcentaje de aceptación sobre el total con rostro |
| `umbral_usado` | `float` | Umbral efectivo aplicado en esta evaluación |
| `resultados` | `Array` | Detalle por imagen: `archivo`, `rostro_detectado`, `aceptado`, `distancia_minima` |

---

### 3.3. Healthcheck del Modelo (`GET /`)

Expone el estado interno del sistema de inferencia en tiempo real. Permite monitorear la salud del modelo sin ejecutar una verificación.

**Datos expuestos:**
| Campo | Descripción |
|---|---|
| `estado` | `"online"` / `"offline"` |
| `modelo_cargado` | Si el archivo `.pkl` de encodings está activo en RAM |
| `encodings_en_modelo` | Cantidad de identidades registradas (actualmente: **29 sujetos**) |
| `umbral_global` | Umbral de distancia configurado por defecto (`0.45`) |
| `memoria_mb` | Consumo actual de RAM del proceso |
| `uptime_segundos` | Tiempo activo del servidor desde su último inicio |

---

### 3.4. Historial de Auditoría (`GET /historial` / `DELETE /historial`)

El modelo registra cada intento de verificación en memoria volátil. Este historial es consultable para trazabilidad de accesos.

**Datos por entrada:**
- `timestamp` — Marca de tiempo del intento
- `archivo` — Nombre del archivo enviado
- `rostro_detectado` — Si hubo rostro
- `aceptado` — Resultado de la verificación
- `distancia_minima` — Distancia al encoding más cercano
- `similitud` — Porcentaje de similitud calculado

**Limitación importante:** El historial vive en memoria RAM del proceso de Uvicorn. Al reiniciar el servidor, se pierde. Para persistencia real se requiere integrar una base de datos (SQLite / PostgreSQL).

---

## 4. Estado Actual del Modelo

| Parámetro | Valor |
|---|---|
| Encodings registrados | **29 identidades** |
| Umbral por defecto | **0.45** (distancia euclidiana) |
| Endpoint remoto | `http://34.41.144.88:8089` |
| Protocolo | HTTP (sin TLS) |

---

## 5. Módulos del Frontend

| Vista | Archivo | Funcionalidad |
|---|---|---|
| Dashboard | `index.html` + `dashboard.js` | Monitoreo en tiempo real: estado del modelo, encodings, RAM, uptime, tabla de auditoría con historial de accesos |
| Autenticación | `autenticacion-biometrica.html` + `autenticacion.js` | Captura de frame desde webcam vía WebRTC o carga manual de imagen, envío al modelo y presentación de resultado (Match / Rechazo) con métricas de similitud y distancia |
| Testing Masivo | `testing_masivo.html` + `testing_masivo.js` | Upload drag-and-drop de múltiples imágenes, disparo del batch, progreso en tiempo real y tabla de resultados individuales |

---

## 6. Restricciones y Consideraciones de Seguridad

> [!WARNING]
> **Cámara bloqueada en producción HTTP:** Los navegadores modernos (Chrome, Firefox, Safari) bloquean el acceso a `getUserMedia` (webcam) si la página no se sirve sobre HTTPS o desde `localhost`. Mientras el frontend opere sobre HTTP puro, la captura desde cámara no funcionará en producción.

> [!CAUTION]
> **Historial volátil:** Los registros de auditoría se pierden al reiniciar Uvicorn. No apto para entornos regulados que exijan trazabilidad persistente.

> [!NOTE]
> **CORS abierto:** El backend opera con `allow_origins=["*"]`. Válido para desarrollo y prototipos internos. Para producción se debe restringir al dominio del frontend.

---

## 7. Roadmap Técnico Recomendado

1. **HTTPS / TLS:** Configurar Nginx como reverse proxy con Certbot para habilitar el acceso a cámara en producción.
2. **Persistencia del historial:** Integrar SQLite o PostgreSQL en el backend para persistir registros de auditoría.
3. **CORS restrictivo:** Limitar `allow_origins` al dominio del frontend en producción.
4. **Autenticación de API:** Agregar un mecanismo de API Key o JWT para proteger los endpoints de escritura.
5. **Deploy frontend:** Servir el `/dist` de Vite desde Nginx en el mismo servidor o un CDN (Vercel/Cloudflare Pages).

---

*Documento generado como referencia técnica del estado actual del sistema. Sujeto a actualización.*
