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
// =============================================================

// -----------------------------------------------------------
// IMPORTACIONES
// - db: instancia de Firestore desde nuestra configuración
// - doc: crea una referencia a un documento específico
// - getDoc: lee un documento una sola vez desde Firestore
// -----------------------------------------------------------
import { db } from './firebase-config.js';
import {
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';


// =============================================================
// obtenerIdDocente()
// Lee el parámetro 'id' de la URL.
// Ejemplo: si la URL es ar.html?id=docente-1, retorna "docente-1"
// Esto nos dice qué docente queremos mostrar en AR.
// =============================================================
function obtenerIdDocente() {
  // URLSearchParams parsea los parámetros de la URL automáticamente
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
// Busca en la colección 'docentes' un documento con el ID dado.
//
// ESQUEMA ESPERADO del documento en Firestore:
// {
//   nombre:      "Prof. Juan Pérez",
//   materia:     "Redes y Telecomunicaciones",
//   email:       "jperez@uniguajira.edu.co",
//   oficina:     "Bloque B, Oficina 201",
//   semestre:    "2025-2",
//   descripcion: "Docente con 10 años de experiencia..."
// }
// =============================================================
async function cargarDatosDocente(id) {
  try {
    // Creamos una referencia al documento: docentes/{id}
    // Ejemplo: docentes/docente-1
    const docRef = doc(db, 'docentes', id);

    // Obtenemos el documento de Firestore (lectura única)
    const docSnap = await getDoc(docRef);

    // Verificamos si el documento existe en la base de datos
    if (docSnap.exists()) {
      console.log('✅ Datos del docente cargados desde Firestore');
      return docSnap.data(); // Retorna el objeto con los campos
    } else {
      console.warn(`⚠️ No se encontró el docente con ID: ${id} en Firestore`);
      // Si no existe, usamos datos de respaldo
      return obtenerDatosPorDefecto(id);
    }
  } catch (error) {
    console.error('❌ Error al consultar Firestore:', error);
    // Si Firestore falla (ej: credenciales no configuradas),
    // usamos datos de respaldo para que la demo funcione
    return obtenerDatosPorDefecto(id);
  }
}


// =============================================================
// obtenerDatosPorDefecto(id)
// Datos de respaldo para cuando Firestore no está disponible.
// Esto permite probar la app sin tener Firebase configurado.
// En producción, los datos siempre vendrán de Firestore.
// =============================================================
function obtenerDatosPorDefecto(id) {
  console.log('📦 Usando datos por defecto (Firestore no disponible)');

  // Mapa de datos ficticios para los 5 docentes
  const datosPorDefecto = {
    'docente-1': {
      nombre:      'Prof. Juan Pérez',
      materia:     'Redes y Telecomunicaciones',
      email:       'jperez@uniguajira.edu.co',
      oficina:     'Bloque B, Oficina 201',
      semestre:    '2025-2',
      descripcion: 'Docente especializado en infraestructura de redes, protocolos de comunicación y seguridad informática.'
    },
    'docente-2': {
      nombre:      'Prof. María García',
      materia:     'Programación Orientada a Objetos',
      email:       'mgarcia@uniguajira.edu.co',
      oficina:     'Bloque A, Oficina 305',
      semestre:    '2025-2',
      descripcion: 'Experta en patrones de diseño y desarrollo de software con Java y Python.'
    },
    'docente-3': {
      nombre:      'Prof. Carlos López',
      materia:     'Bases de Datos',
      email:       'clopez@uniguajira.edu.co',
      oficina:     'Bloque C, Oficina 102',
      semestre:    '2025-2',
      descripcion: 'Especialista en diseño y administración de bases de datos relacionales y NoSQL.'
    },
    'docente-4': {
      nombre:      'Prof. Ana Martínez',
      materia:     'Sistemas Operativos',
      email:       'amartinez@uniguajira.edu.co',
      oficina:     'Bloque B, Oficina 108',
      semestre:    '2025-2',
      descripcion: 'Docente investigadora en sistemas distribuidos y virtualización.'
    },
    'docente-5': {
      nombre:      'Prof. Luis Rodríguez',
      materia:     'Internet de las Cosas (IoT)',
      email:       'lrodriguez@uniguajira.edu.co',
      oficina:     'Laboratorio IoT, Bloque D',
      semestre:    '2025-2',
      descripcion: 'Investigador en IoT, sensores inteligentes y computación en la nube.'
    }
  };

  // Si el ID no coincide con ningún docente conocido, retornamos un genérico
  return datosPorDefecto[id] || {
    nombre:      'Docente no encontrado',
    materia:     'N/A',
    email:       'N/A',
    oficina:     'N/A',
    semestre:    'N/A',
    descripcion: 'No se encontraron datos para este docente.'
  };
}


// =============================================================
// renderizarFicha(datos)
// Rellena el HTML de la ficha flotante con los datos del docente.
// Los elementos del DOM (#ficha-nombre, #ficha-materia, etc.)
// ya están definidos en ar.html.
// =============================================================
function renderizarFicha(datos) {
  // Rellenamos cada campo de la ficha con los datos recibidos
  document.getElementById('ficha-nombre').textContent = datos.nombre;
  document.getElementById('ficha-materia').textContent = datos.materia;

  // Para los campos del cuerpo, usamos innerHTML para poder
  // incluir el ícono y la etiqueta en negrita
  document.getElementById('ficha-email').innerHTML =
    `<strong>📧 Email:</strong> ${datos.email}`;
  document.getElementById('ficha-oficina').innerHTML =
    `<strong>📍 Oficina:</strong> ${datos.oficina}`;
  document.getElementById('ficha-semestre').innerHTML =
    `<strong>📅 Semestre:</strong> ${datos.semestre}`;
  document.getElementById('ficha-descripcion').innerHTML =
    `<strong>📝 Sobre el docente:</strong> ${datos.descripcion}`;

  console.log('🎴 Ficha del docente renderizada correctamente');
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
// 1. Obtiene el ID del docente desde la URL
// 2. Consulta Firestore para obtener sus datos
// 3. Renderiza la ficha con los datos
// 4. Configura la interacción de los botones
//
// Se exporta para que ar-init.js pueda llamarla en paralelo
// con la inicialización de MindAR.
// =============================================================
async function inicializarFicha() {
  const id = obtenerIdDocente();

  if (!id) {
    console.error('❌ No se puede cargar la ficha sin un ID de docente');
    return null;
  }

  // Cargamos los datos (de Firestore o del respaldo local)
  const datos = await cargarDatosDocente(id);

  // Rellenamos el HTML de la ficha con los datos obtenidos
  renderizarFicha(datos);

  // Conectamos los eventos de los botones
  configurarInteraccion();

  console.log('✅ Ficha inicializada correctamente');
  return datos;
}

// Exportamos las funciones que necesitan otros módulos
export { inicializarFicha, obtenerIdDocente };
