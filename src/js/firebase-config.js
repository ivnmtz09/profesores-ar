// =============================================================
// firebase-config.js
// Configuración e inicialización de Firebase (Firestore)
// =============================================================
// Este archivo configura la conexión con Firebase usando el SDK
// modular v9+. Como NO usamos un bundler (Webpack, Vite, etc.),
// importamos directamente desde el CDN de Google.
// =============================================================

// -----------------------------------------------------------
// IMPORTACIONES desde el CDN de Firebase
// - initializeApp: crea la instancia de la app Firebase
// - getFirestore: nos da acceso a la base de datos Firestore
//
// NOTA: Usamos las URLs completas del CDN porque nuestro
// proyecto es HTML + JS puro, sin empaquetador (bundler).
// Si usaras Vite o Webpack, podrías usar "firebase/app".
// -----------------------------------------------------------
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// -----------------------------------------------------------
// CONFIGURACIÓN DE FIREBASE
// Estas son las credenciales de tu proyecto en Firebase.
// Las obtuviste de: Consola Firebase > Configuración > Tu app web
// -----------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDKenpUdReC1dxH_9guZD5q_f84eNUL6-g",
  authDomain: "profesores-ar-uniguajira.firebaseapp.com",
  projectId: "profesores-ar-uniguajira",
  storageBucket: "profesores-ar-uniguajira.firebasestorage.app",
  messagingSenderId: "620169017707",
  appId: "1:620169017707:web:0acce480c370fd1ece342e",
  measurementId: "G-HSB4SPNN5E"
};

// -----------------------------------------------------------
// INICIALIZACIÓN
// initializeApp() → crea la instancia de Firebase con la config
// getFirestore()  → nos da el cliente de Firestore para queries
// -----------------------------------------------------------
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// -----------------------------------------------------------
// EXPORTACIÓN
// Exportamos 'db' para que otros módulos (ficha.js) puedan
// importarla y hacer consultas a la base de datos Firestore.
// Ejemplo en ficha.js: import { db } from './firebase-config.js';
// -----------------------------------------------------------
export { db };