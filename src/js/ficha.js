// =============================================================
// ficha.js
// Consulta de datos del docente en Firestore y renderizado
// del overlay de ficha informativa
// =============================================================
// Este archivo se encarga de:
// 1. Leer el parámetro ?id= de la URL para saber qué docente cargar
// 2. Consultar Firestore para obtener los datos del docente
// 3. Rellenar el HTML de la ficha flotante con esos datos
// 4. Manejar la interacción de mostrar/ocultar la ficha
// 5. Mostrar errores amigables si no se encuentra el docente
// =============================================================

// -----------------------------------------------------------
// IMPORTACIONES
// - db: instancia de Firestore exportada desde firebase-config.js
// - doc: crea una referencia a un documento específico en Firestore
// - getDoc: lee ese documento una sola vez
//
// NOTA: 'doc' y 'getDoc' se importan desde el mismo CDN de Firebase
// que usamos en firebase-config.js (no desde un bundler).
// -----------------------------------------------------------
import { db } from './firebase-config.js';
import {
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';


// =============================================================
// obtenerIdDocente()
// Lee el parámetro 'id' de la URL.
// Ejemplo: ar.html?id=jair  → retorna "jair"
//          ar.html?id=docente-1 → retorna "docente-1"
//          ar.html (sin ?id=)  → retorna null
// =============================================================
function obtenerIdDocente() {
  // URLSearchParams parsea automáticamente los parámetros de la URL
  // Ejemplo: "?id=jair&otro=valor" → params.get('id') = "jair"
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    console.error('⚠️ No se encontró el parámetro ?id= en la URL');
    return null;
  }

  console.log(`📋 ID del docente a cargar: ${id}`);
  return id;
}


// =============================================================
// cargarDatosDocente(id)
// Consulta Firestore para obtener los datos del docente.
// Busca en la colección 'docentes' un documento cuyo ID coincida
// con el parámetro recibido.
//
// Ruta en Firestore: docentes/{id}
// Ejemplo: docentes/jair
//
// ESQUEMA ESPERADO del documento en Firestore:
// {
//   nombre:      "Prof. Jair Martínez",
//   materia:     "Redes y Telecomunicaciones",
//   email:       "jmartinez@uniguajira.edu.co",
//   oficina:     "Bloque B, Oficina 201",
//   descripcion: "Docente con 10 años de experiencia..."
// }
// =============================================================
async function cargarDatosDocente(id) {
  try {
    // Creamos una referencia al documento específico.
    // 'docentes' es el nombre de la colección en Firestore.
    // 'id' es el ID del documento (ej: "jair", "docente-1").
    const docRef = doc(db, 'docentes', id);

    // getDoc() hace una lectura única al documento.
    // A diferencia de onSnapshot(), no se queda escuchando cambios.
    const docSnap = await getDoc(docRef);

    // .exists() nos dice si el documento fue encontrado en Firestore
    if (docSnap.exists()) {
      console.log('✅ Datos del docente cargados desde Firestore');
      // .data() retorna el objeto con todos los campos del documento
      return { encontrado: true, datos: docSnap.data() };
    } else {
      // El documento no existe en la colección 'docentes'
      console.warn(`⚠️ No se encontró el docente con ID: "${id}" en Firestore`);
      return { encontrado: false, datos: null };
    }
  } catch (error) {
    // Error de red, permisos, o credenciales mal configuradas
    console.error('❌ Error al consultar Firestore:', error);
    return { encontrado: false, datos: null, error: error.message };
  }
}


// =============================================================
// renderizarFicha(datos)
// Rellena el HTML de la ficha flotante con los datos del docente.
// Los elementos del DOM (#ficha-nombre, #ficha-materia, etc.)
// ya están definidos en ar.html.
//
// Recibe un objeto con las propiedades:
//   nombre, materia, email, oficina, descripcion
// =============================================================
function renderizarFicha(datos) {
  // Rellenamos el encabezado de la ficha
  document.getElementById('ficha-nombre').textContent = datos.nombre || 'Sin nombre';
  document.getElementById('ficha-materia').textContent = datos.materia || 'Sin materia asignada';

  // Para los campos del cuerpo, usamos innerHTML para poder
  // incluir el ícono emoji y la etiqueta en negrita (<strong>)
  document.getElementById('ficha-email').innerHTML =
    `<strong>📧 Email:</strong> ${datos.email || 'No disponible'}`;
  document.getElementById('ficha-oficina').innerHTML =
    `<strong>📍 Oficina:</strong> ${datos.oficina || 'No disponible'}`;
  document.getElementById('ficha-semestre').innerHTML =
    `<strong>📅 Semestre:</strong> ${datos.semestre || ''}`;
  document.getElementById('ficha-descripcion').innerHTML =
    `<strong>📝 Sobre el docente:</strong> ${datos.descripcion || 'Sin descripción disponible.'}`;

  console.log('🎴 Ficha del docente renderizada correctamente');
}


// =============================================================
// mostrarErrorEnFicha(mensaje)
// Muestra un mensaje de error amigable DENTRO del overlay
// de la ficha, para que el usuario sepa qué pasó sin tener
// que abrir la consola del navegador.
// =============================================================
function mostrarErrorEnFicha(mensaje) {
  // Ponemos el mensaje de error en el encabezado de la ficha
  document.getElementById('ficha-nombre').textContent = '😕 Error';
  document.getElementById('ficha-materia').textContent = mensaje;

  // Limpiamos los campos del cuerpo para que no muestren basura
  document.getElementById('ficha-email').textContent = '';
  document.getElementById('ficha-oficina').textContent = '';
  document.getElementById('ficha-semestre').textContent = '';
  document.getElementById('ficha-descripcion').innerHTML =
    '<strong>💡 Sugerencia:</strong> Verifica que la URL tenga el parámetro correcto ' +
    '(ej: <code>ar.html?id=jair</code>) y que el docente exista en la base de datos.';

  // Mostramos la ficha automáticamente para que el usuario vea el error
  document.getElementById('ficha-overlay').classList.add('visible');

  console.error(`❌ Error en ficha: ${mensaje}`);
}


// =============================================================
// configurarInteraccion()
// Configura los eventos de los botones para mostrar y ocultar
// la ficha flotante:
// - Botón "ℹ️ Info Docente" → muestra la ficha (agrega 'visible')
// - Botón "Cerrar" → oculta la ficha (quita 'visible')
// =============================================================
function configurarInteraccion() {
  const fichaOverlay = document.getElementById('ficha-overlay');
  const btnInfo = document.getElementById('btn-info');
  const btnCerrar = document.getElementById('ficha-close');

  // Al hacer clic en "Info Docente", mostramos la ficha
  // La clase 'visible' activa la transición CSS (translateY → 0)
  btnInfo.addEventListener('click', () => {
    fichaOverlay.classList.add('visible');
  });

  // Al hacer clic en "Cerrar", ocultamos la ficha
  // Al quitar 'visible', vuelve a translateY(100%) → fuera de pantalla
  btnCerrar.addEventListener('click', () => {
    fichaOverlay.classList.remove('visible');
  });
}


// =============================================================
// inicializarFicha() — FUNCIÓN PRINCIPAL
// Orquesta todo el proceso de la ficha:
// 1. Obtiene el ID del docente desde la URL (?id=)
// 2. Consulta Firestore para obtener sus datos
// 3. Si existe → renderiza la ficha con los datos reales
// 4. Si no existe → muestra error amigable en el overlay
// 5. Configura la interacción de los botones
//
// Se exporta para que ar-init.js pueda llamarla en paralelo
// con la inicialización de MindAR.
// =============================================================
async function inicializarFicha() {
  // --- Paso 1: Leer el ?id= de la URL ---
  const id = obtenerIdDocente();

  // Si no hay parámetro ?id=, mostramos error y salimos
  if (!id) {
    mostrarErrorEnFicha(
      'No se especificó un docente. La URL debe incluir ?id=nombre-docente'
    );
    configurarInteraccion();
    return null;
  }

  // --- Paso 2: Consultar Firestore ---
  const resultado = await cargarDatosDocente(id);

  // --- Paso 3: Renderizar según el resultado ---
  if (resultado.encontrado) {
    // ✅ El docente existe en Firestore → mostramos sus datos
    renderizarFicha(resultado.datos);
  } else {
    // ❌ El docente NO existe → mostramos error amigable
    const mensajeError = resultado.error
      ? `Error de conexión con la base de datos: ${resultado.error}`
      : `No se encontraron datos para el docente "${id}" en la base de datos.`;
    mostrarErrorEnFicha(mensajeError);
  }

  // --- Paso 4: Configurar botones ---
  configurarInteraccion();

  console.log('✅ Ficha inicializada correctamente');
  return resultado.encontrado ? resultado.datos : null;
}

// Exportamos las funciones que necesitan otros módulos
export { inicializarFicha, obtenerIdDocente };
