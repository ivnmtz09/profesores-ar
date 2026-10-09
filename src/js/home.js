// =============================================================
// home.js
// Controlador principal: navegación por carreras y facultades,
// directorio de docentes de Sistemas, modal con Firestore (nombre + email),
// visor 3D interactivo, Screen Loader institucional y Scroll Restoration.
// =============================================================

import { db } from './firebase-config.js';
import {
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// =============================================================
// REFERENCIAS AL DOM
// =============================================================
const sectionCarreras = document.getElementById('section-carreras');
const sectionSistemas = document.getElementById('section-sistemas');
const navBreadcrumb   = document.getElementById('nav-breadcrumb');
const modalOverlay    = document.getElementById('modal-docente');
const modalDialog     = modalOverlay?.querySelector('.modal-dialog');
const screenLoader    = document.getElementById('screen-loader');

// =============================================================
// SCROLL RESTORATION & GESTIÓN DE VISTAS
// =============================================================
// Forzar comportamiento manual para controlar exactamente el desplazamiento
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Almacén de posición de scroll en la lista de carreras
let carrerasScrollY = 0;

function ocultarScreenLoader(delayMs = 450) {
  if (!screenLoader) return;
  setTimeout(() => {
    screenLoader.classList.add('hidden');
    screenLoader.classList.remove('transitioning');
  }, delayMs);
}

function transicionarVista(accionCambio) {
  if (!screenLoader) {
    accionCambio();
    return;
  }

  const statusText = document.getElementById('loader-status-text');
  if (statusText) statusText.textContent = 'Cambiando de vista...';

  // Mostrar screen loader en modo transición suave
  screenLoader.classList.remove('hidden');
  screenLoader.classList.add('transitioning');

  setTimeout(() => {
    accionCambio();
    setTimeout(() => {
      screenLoader.classList.add('hidden');
      screenLoader.classList.remove('transitioning');
      if (statusText) statusText.textContent = 'Cargando directorio docente...';
    }, 180);
  }, 120);
}

function initNavegacion() {
  if (window.location.hash === '#sistemas') {
    mostrarSistemas(false);
  } else {
    mostrarCarreras(false);
  }
}

function mostrarCarreras(pushHistory = true) {
  if (sectionCarreras) sectionCarreras.style.display = 'block';
  if (sectionSistemas) sectionSistemas.classList.remove('visible');
  if (navBreadcrumb) navBreadcrumb.style.display = 'none';

  if (pushHistory) {
    history.pushState({ view: 'carreras', scrollY: carrerasScrollY }, '', '#carreras');
  }

  // Scroll Restoration: volver a la posición previa en carreras
  window.scrollTo({
    top: carrerasScrollY,
    left: 0,
    behavior: 'instant'
  });
}

function mostrarSistemas(pushHistory = true) {
  // Guardar la posición actual antes de salir de la vista de carreras
  if (sectionCarreras && sectionCarreras.style.display !== 'none') {
    carrerasScrollY = window.scrollY || window.pageYOffset || 0;
  }

  if (sectionCarreras) sectionCarreras.style.display = 'none';
  if (sectionSistemas) sectionSistemas.classList.add('visible');
  if (navBreadcrumb) navBreadcrumb.style.display = 'block';

  if (pushHistory) {
    history.pushState({ view: 'sistemas', scrollY: 0 }, '', '#sistemas');
  }

  // Scroll Restoration: asegurar que docentes comience desde arriba del todo
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant'
  });
}

// Botones interactivos de navegación de rutas con transición y scroll restoration
document.getElementById('btn-ir-sistemas')?.addEventListener('click', () => {
  transicionarVista(() => mostrarSistemas(true));
});

document.getElementById('crumb-inicio')?.addEventListener('click', () => {
  transicionarVista(() => mostrarCarreras(true));
});

document.getElementById('btn-volver-carreras')?.addEventListener('click', () => {
  transicionarVista(() => mostrarCarreras(true));
});

// Soporte para botón atrás/adelante del navegador (popstate)
window.addEventListener('popstate', (e) => {
  const isSistemas = e.state?.view === 'sistemas' || window.location.hash === '#sistemas';
  if (isSistemas) {
    mostrarSistemas(false);
  } else {
    carrerasScrollY = e.state?.scrollY !== undefined ? e.state.scrollY : carrerasScrollY;
    mostrarCarreras(false);
  }
});

// =============================================================
// FILTROS DE PROGRAMAS POR FACULTAD
// =============================================================
function initFiltrosFacultad() {
  const filterButtons = document.querySelectorAll('.faculty-filters .filter-btn');
  const careerCards   = document.querySelectorAll('.careers-grid .career-card');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetFilter = btn.dataset.filter;
      if (!targetFilter) return;

      filterButtons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      careerCards.forEach((card) => {
        const facultad = card.dataset.facultad;
        // La tarjeta especial de expansión siempre permanece visible para denotar expansión institucional
        if (targetFilter === 'todas' || facultad === targetFilter || card.classList.contains('card-expansion')) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// =============================================================
// APERTURA DEL MODAL DE DETALLE
// =============================================================
document.querySelectorAll('.btn-ver').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    if (!id) return;
    abrirModal(id);
  });
});

async function abrirModal(id) {
  if (!modalOverlay) return;

  // Estado inicial de carga
  setModalLoading(true);
  const nombreEl = document.getElementById('modal-nombre');
  if (nombreEl) nombreEl.textContent = 'Cargando datos...';

  const contactEl = document.getElementById('modal-contact');
  if (contactEl) contactEl.style.display = 'none';

  // Carga del modelo 3D en <model-viewer>
  const viewer = document.getElementById('viewer-3d');
  if (viewer) {
    viewer.src = `models/${id}.glb`;
    viewer.setAttribute('camera-orbit', '0deg 75deg 105%');
  }

  // Enlace hacia experiencia AR
  const btnAR = document.getElementById('btn-ir-ar');
  if (btnAR) {
    btnAR.href = `ar.html?id=${id}`;
  }

  // Prevenir scroll del fondo y mostrar modal
  document.body.style.overflow = 'hidden';
  modalOverlay.classList.add('visible');
  modalDialog?.focus();

  // Consulta en Firestore
  try {
    const docRef  = doc(db, 'docentes', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const datos = docSnap.data();
      renderizarDatosModal(datos);
    } else {
      if (nombreEl) nombreEl.textContent = id;
      console.warn(`[Docentes AR] Docente "${id}" no encontrado en Firestore.`);
    }
  } catch (err) {
    if (nombreEl) nombreEl.textContent = id;
    console.error('[Docentes AR] Error al consultar Firestore:', err);
  } finally {
    setModalLoading(false);
  }
}

function renderizarDatosModal(datos) {
  const nombreEl = document.getElementById('modal-nombre');
  if (nombreEl) {
    nombreEl.textContent = datos.nombre || 'Docente de Sistemas';
  }

  // Correo electrónico institucional obtenido de Firestore
  const emailLinkEl = document.getElementById('modal-email-link');
  const contactEl   = document.getElementById('modal-contact');

  if (datos.email && emailLinkEl && contactEl) {
    emailLinkEl.href = `mailto:${datos.email}`;
    const textSpan = emailLinkEl.querySelector('.email-text');
    if (textSpan) textSpan.textContent = datos.email;
    contactEl.style.display = 'block';
  } else if (contactEl) {
    contactEl.style.display = 'none';
  }
}

function setModalLoading(loading) {
  const indicator = document.getElementById('modal-loading');
  if (indicator) {
    indicator.style.display = loading ? 'flex' : 'none';
  }
}

// =============================================================
// CIERRE DEL MODAL
// =============================================================
function cerrarModal() {
  modalOverlay?.classList.remove('visible');
  document.body.style.overflow = '';
}

document.getElementById('modal-close-btn')?.addEventListener('click', cerrarModal);
document.getElementById('btn-modal-cancel')?.addEventListener('click', cerrarModal);

modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay) cerrarModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay?.classList.contains('visible')) {
    cerrarModal();
  }
});

// =============================================================
// INICIALIZACIÓN
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Docentes AR] Portal de Docentes Uniguajira iniciado correctamente.');
  initNavegacion();
  initFiltrosFacultad();
});

// Ocultar Screen Loader cuando la ventana y sus fuentes/recursos estén listos
window.addEventListener('load', () => {
  ocultarScreenLoader(400);
});

// Respaldo de seguridad en caso de que algún recurso externo se demore
setTimeout(() => {
  ocultarScreenLoader(0);
}, 1500);
