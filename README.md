# Profesores de Sistemas — Uniguajira (AR) 🎓

Proyecto académico de **Realidad Aumentada Web (WebAR)** para la asignatura de
**Internet de las Cosas (IoT)** — Universidad de La Guajira.

Tarjetas físicas de docentes cobran vida: al apuntar la cámara del celular a la
foto de un profesor, aparece su modelo 3D y una ficha informativa flotante. 

Este proyecto cuenta con una interfaz minimalista estilo **Glassmorphism**, optimizada para dispositivos móviles y estructurada con buenas prácticas de módulos ES (`importmap`).

---

## 🚀 Tecnologías

| Tecnología | Uso |
|---|---|
| **MindAR.js (v1.2.2)** | Reconocimiento de imagen (image tracking) en el navegador |
| **Three.js (r128)** | Renderizado 3D del modelo sobre el target detectado |
| **Firebase Firestore** | Base de datos con la información de cada docente |
| **Firebase Hosting** | Despliegue con HTTPS (necesario para acceso a cámara) |

---

## 📁 Estructura del Proyecto

```text
profesores-ar/
├── src/
│   ├── targets/          ← archivos .mind (uno por docente)
│   ├── models/           ← archivos .glb (uno por docente)
│   ├── img/              ← fotos de los docentes para la galería
│   ├── index.html        ← landing page con galería de docentes
│   ├── ar.html           ← página AR (MindAR + Three.js) con mapa de importaciones
│   ├── css/style.css     ← estilos de la app (Glassmorphism)
│   └── js/
│       ├── ar-init.js        ← inicialización de MindAR y Three.js
│       ├── firebase-config.js ← conexión a Firebase/Firestore
│       └── ficha.js          ← carga de datos y overlay informativo
├── firebase.json         ← configuración de Firebase Hosting (serviendo src/)
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
como ID el identificador del docente (ej: `docente-1`, `jair`) y estos campos esenciales (interfaz limpia basada en texto):

| Campo | Tipo | Ejemplo |
|---|---|---|
| `nombre` | string | `"Prof. Juan Pérez"` |
| `materia` | string | `"Redes y Telecomunicaciones"` |
| `email` | string | `"jperez@uniguajira.edu.co"` |
| `descripcion` | string | `"Docente especializado en infraestructura de redes..."` |

### 4. Generar archivos `.mind` (targets de imagen)

Los archivos `.mind` se generan a partir de las fotos de los docentes usando el compilador oficial de MindAR:

👉 [https://hiukim.github.io/mind-ar-js-doc/tools/compile](https://hiukim.github.io/mind-ar-js-doc/tools/compile)

1. Sube la foto de **un solo docente** por compilación
2. Descarga el archivo `.mind` resultante
3. Renómbralo acorde al ID del documento (ej: `docente-1.mind`)
4. Colócalo en `src/targets/`

> **Tip:** Usa fotos con buen contraste y textura variada para mejor detección.

### 5. Colocar los modelos 3D

1. Genera los modelos 3D en [Tripo3D](https://www.tripo3d.ai/) u otra herramienta
2. Expórtalos en formato `.glb`
3. Nómbralos acorde al ID (ej: `docente-1.glb`)
4. Colócalos en `src/models/`
*(Nota: La escala predeterminada es de 12. Puedes ajustarla en `src/js/ar-init.js` si tus modelos base varían).*

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

```text
QR en tarjeta → ar.html?id=docente-1
      ↓
Carga en paralelo:
  • Prepara MindARThree
  • Descarga y procesa el modelo .glb en memoria
  • Consulta Firestore por los datos
      ↓
El usuario toca el botón "Iniciar Cámara" (Previene bloqueos de autoplay móviles)
      ↓
MindAR arranca → Pide cámara → Carga el archivo .mind
      ↓
Al detectar la foto → Three.js muestra el modelo 3D a gran escala
      ↓
Botón "Info" → Ficha flotante Glassmorphism con datos sobrios del docente
```

---

## 👥 Créditos

- **Universidad de La Guajira** — Programa de Ingeniería de Sistemas
- **Asignatura:** Internet de las Cosas (IoT)
- **Año:** 2025
