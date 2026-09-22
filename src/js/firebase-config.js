// =============================================================
// firebase-config.js
// Configuración e inicialización de Firebase (Firestore)
// =============================================================
// Este archivo configura la conexión con Firebase usando el SDK
// modular v9+. Las credenciales son placeholders que debes
// reemplazar con las de tu proyecto de Firebase.
// =============================================================

// -----------------------------------------------------------
// Importamos las funciones necesarias del SDK de Firebase
// desde el CDN oficial de Google.
// - initializeApp: crea la instancia de la app Firebase
// - getFirestore: nos da acceso a la base de datos Firestore
// No necesitamos instalar nada con npm, todo viene del CDN.
// -----------------------------------------------------------
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// -----------------------------------------------------------
// CONFIGURACIÓN DE FIREBASE
// ¡IMPORTANTE! Reemplaza TODOS estos valores con los de tu
// proyecto. Los encuentras en la consola de Firebase:
//   1. Ve a console.firebase.google.com
//   2. Selecciona tu proyecto
//   3. Configuración del proyecto (⚙️) > General
//   4. En "Tus apps" > selecciona la app web
//   5. Copia el objeto firebaseConfig
// -----------------------------------------------------------
const firebaseConfig = {
  apiKey:            "TU_API_KEY_AQUI",
  authDomain:        "TU_PROYECTO.firebaseapp.com",
  projectId:         "TU_PROJECT_ID_AQUI",
  storageBucket:     "TU_PROYECTO.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abcdef123456"
};

// -----------------------------------------------------------
// INICIALIZACIÓN
// initializeApp() → crea la instancia de Firebase con la config
// getFirestore()  → nos da el cliente de Firestore para queries
// -----------------------------------------------------------
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exportamos 'db' para que otros módulos (ficha.js) puedan
// usarla para consultar la base de datos
export { db };
