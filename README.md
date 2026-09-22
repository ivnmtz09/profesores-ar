# Profesores de Sistemas — Uniguajira (AR) 🎓

Proyecto académico de **Realidad Aumentada Web (WebAR)** para la asignatura de
**Internet de las Cosas (IoT)** — Universidad de La Guajira.

Tarjetas físicas de docentes cobran vida: al apuntar la cámara del celular a la
foto de un profesor, aparece su modelo 3D y una ficha informativa flotante.

---

## 🚀 Tecnologías

| Tecnología | Uso |
|---|---|
| **MindAR.js** | Reconocimiento de imagen (image tracking) en el navegador |
| **Three.js** | Renderizado 3D del modelo sobre el target detectado |
| **Firebase Firestore** | Base de datos con la información de cada docente |
| **Firebase Hosting** | Despliegue con HTTPS (necesario para acceso a cámara) |

---

## 📁 Estructura del Proyecto

```
profesores-ar/
├── public/
│   ├── targets/          ← archivos .mind (uno por docente)
│   ├── models/           ← archivos .glb (uno por docente)
│   └── img/              ← fotos de los docentes para la galería
├── src/
│   ├── index.html        ← landing page con galería de docentes
│   ├── ar.html           ← página AR (MindAR + Three.js)
│   ├── css/style.css     ← estilos de la app
│   └── js/
│       ├── ar-init.js        ← inicialización de MindAR y Three.js
│       ├── firebase-config.js ← conexión a Firebase/Firestore
│       └── ficha.js          ← carga de datos y overlay informativo
├── firebase.json         ← configuración de Firebase Hosting
├── .firebaserc           ← alias del proyecto Firebase
└── README.md
```

---

## ⚙️ Configuración paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/profesores-ar.git
cd profesores-ar
```

### 2. Configurar Firebase

1. Crea un proyecto en [console.firebase.google.com](https://console.firebase.google.com/)
2. Registra una app web y copia las credenciales
3. Edita `src/js/firebase-config.js` y reemplaza los placeholders con tus credenciales
4. Edita `.firebaserc` y reemplaza `TU-PROYECTO-FIREBASE-AQUI` con el ID de tu proyecto

### 3. Crear la colección en Firestore

En Firestore, crea una colección llamada **`docentes`**. Cada documento debe tener
como ID el identificador del docente (ej: `docente-1`) y estos campos:

| Campo | Tipo | Ejemplo |
|---|---|---|
| `nombre` | string | `"Prof. Juan Pérez"` |
| `materia` | string | `"Redes y Telecomunicaciones"` |
| `email` | string | `"jperez@uniguajira.edu.co"` |
| `oficina` | string | `"Bloque B, Oficina 201"` |
| `semestre` | string | `"2025-2"` |
| `descripcion` | string | `"Docente especializado en infraestructura de redes..."` |

### 4. Generar archivos `.mind` (targets de imagen)

Los archivos `.mind` se generan a partir de las fotos de los docentes usando el
compilador oficial de MindAR:

👉 [https://hiukim.github.io/mind-ar-js-doc/tools/compile](https://hiukim.github.io/mind-ar-js-doc/tools/compile)

1. Sube la foto de **un solo docente** por compilación
2. Descarga el archivo `.mind` resultante
3. Renómbralo como `docente-1.mind`, `docente-2.mind`, etc.
4. Colócalo en `public/targets/`

> **Tip:** Usa fotos con buen contraste y textura variada para mejor detección.

### 5. Colocar los modelos 3D

1. Genera los modelos 3D en [Tripo3D](https://www.tripo3d.ai/) u otra herramienta
2. Expórtalos en formato `.glb`
3. Nómbralos `docente-1.glb`, `docente-2.glb`, etc.
4. Colócalos en `public/models/`

### 6. Desplegar

```bash
# Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Probar localmente
firebase serve

# Desplegar a producción
firebase deploy
```

---

## 📱 ¿Cómo funciona?

```
QR en tarjeta → ar.html?id=docente-1 → Pide cámara
      ↓
Carga en paralelo:
  • Target .mind del docente
  • Modelo .glb del docente
  • Datos desde Firestore
      ↓
MindAR detecta la foto → Three.js muestra el modelo 3D
      ↓
Botón "Info" → Ficha flotante con datos del docente
```

---

## 👥 Créditos

- **Universidad de La Guajira** — Programa de Ingeniería de Sistemas
- **Asignatura:** Internet de las Cosas (IoT)
- **Año:** 2025
