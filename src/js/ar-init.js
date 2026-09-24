// =============================================================
// ar-init.js
// Inicialización de MindAR.js + Three.js para Realidad Aumentada
// =============================================================
// Este es el archivo principal de la experiencia AR. Se encarga de:
// 1. Inicializar la cámara y MindAR para reconocimiento de imagen
// 2. Configurar la escena 3D con Three.js (luces, cámara, renderer)
// 3. Cargar el modelo 3D (.glb) del docente con GLTFLoader
// 4. Anclar el modelo 3D sobre la imagen detectada (target)
// 5. Coordinar con ficha.js para mostrar la información del docente
// =============================================================

// -----------------------------------------------------------
// IMPORTACIONES
// - THREE: toda la librería Three.js (escena, luces, etc.)
// - GLTFLoader: cargador de modelos 3D en formato GLTF/GLB
// - inicializarFicha: carga datos del docente desde Firestore
// - obtenerIdDocente: lee el parámetro ?id= de la URL
// -----------------------------------------------------------
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { inicializarFicha, obtenerIdDocente } from './ficha.js';
import { MindARThree } from 'mindar-image-three';

// =============================================================
// inicializarAR()
// Función principal que configura y arranca toda la experiencia AR.
// Se ejecuta automáticamente cuando el DOM está listo.
// =============================================================
async function inicializarAR() {

  // ---- PASO 1: Obtener el ID del docente desde la URL ----
  // Ejemplo: ar.html?id=docente-1 → docenteId = "docente-1"
  const docenteId = obtenerIdDocente();

  if (!docenteId) {
    mostrarError('No se especificó un docente. Agrega ?id=docente-1 a la URL.');
    return;
  }

  console.log(`🚀 Iniciando experiencia AR para: ${docenteId}`);

  // ---- PASO 2: Definir las rutas de los recursos ----
  // Ahora que movimos todo a src/, las rutas relativas desde ar.html
  // son directas a las carpetas.
  const targetPath = `targets/${docenteId}.mind`;
  const modelPath  = `models/${docenteId}.glb`;

  try {
    // ---- PASO 3: Cargar la ficha EN PARALELO ----
    // Iniciamos la carga de datos de Firestore sin esperar,
    // así se ejecuta al mismo tiempo que configuramos AR.
    // Usamos await más adelante para esperar el resultado.
    const fichaPromise = inicializarFicha();

    // ---- PASO 4: Configurar MindAR ----
    // MindARThree crea automáticamente:
    //   - Un <video> con el feed de la cámara
    //   - Un <canvas> de Three.js superpuesto
    //   - Una escena, cámara y renderer de Three.js
    //   - El motor de tracking de imágenes
    const mindarThree = new MindARThree({
      container: document.querySelector("#ar-container"),
      imageTargetSrc: 'targets/' + docenteId + '.mind'
    });

    // Desestructuramos para obtener las referencias a los objetos de Three.js
    const { renderer, scene, camera } = mindarThree;

    // ---- PASO 5: Configurar iluminación ----
    // Sin luces, el modelo 3D se vería completamente negro.

    // Luz ambiental: ilumina todo uniformemente (como luz del día)
    // Parámetros: color (blanco), intensidad (1.5)
    const luzAmbiental = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(luzAmbiental);

    // Luz direccional: simula el sol, viene desde arriba-adelante
    // Crea sombras sutiles que dan volumen al modelo 3D
    const luzDireccional = new THREE.DirectionalLight(0xffffff, 1.0);
    luzDireccional.position.set(0, 3, 2); // x=0, y=arriba, z=hacia la cámara
    scene.add(luzDireccional);

    // ---- PASO 6: Crear el ANCHOR (ancla) ----
    // Un anchor es un punto de anclaje virtual que se "pega"
    // a la imagen detectada por MindAR. Todo lo que agreguemos
    // a anchor.group se moverá y rotará con la imagen en tiempo real.
    //
    // El parámetro 0 indica el índice del target en el archivo .mind
    // (como compilamos un target por archivo, siempre es 0)
    const anchor = mindarThree.addAnchor(0);

    // ---- PASO 7: Cargar el modelo 3D (.glb) con GLTFLoader ----
    // GLB es el formato binario de GLTF (GL Transmission Format),
    // el estándar web para modelos 3D. Es compacto y rápido de cargar.
    const loader = new GLTFLoader();

    // Envolvemos el loader en una Promise para poder usar await
    const gltf = await new Promise((resolve, reject) => {
      loader.load(
        modelPath,

        // ✅ Callback de ÉXITO: el modelo se cargó correctamente
        (gltf) => {
          console.log('✅ Modelo 3D cargado correctamente');
          resolve(gltf);
        },

        // 📊 Callback de PROGRESO: muestra porcentaje de descarga
        (progress) => {
          if (progress.total > 0) {
            const porcentaje = Math.round(
              (progress.loaded / progress.total) * 100
            );
            console.log(`📦 Cargando modelo: ${porcentaje}%`);
          }
        },

        // ❌ Callback de ERROR: el modelo no se pudo cargar
        (error) => {
          console.error('❌ Error al cargar el modelo 3D:', error);
          reject(error);
        }
      );
    });

    // ---- PASO 8: Configurar el modelo 3D ----
    const modelo = gltf.scene;

    // ESCALA: ajustamos el tamaño del modelo.
    // MODIFICA ESTOS NÚMEROS HASTA ENCONTRAR EL TAMAÑO PERFECTO
    // Ejemplo: Si 12 es muy grande, intenta 8, 8, 8
    modelo.scale.set(12, 12, 12);

    // POSICIÓN: lo colocamos centrado sobre la tarjeta física.
    // (x, y, z) → x = izquierda/derecha, y = arriba/abajo, z = profundidad
    // MODIFICA ESTOS NÚMEROS SI EL MODELO QUEDA MUY ARRIBA O MUY ABAJO
    modelo.position.set(0, -0.5, 0);

    // ROTACIÓN: ajusta si tu modelo aparece de espaldas o girado.
    // Los valores son en radianes. Math.PI = 180°
    modelo.rotation.set(0, 0, 0);

    // Agregamos el modelo al grupo del anchor.
    // Ahora el modelo está "anclado" a la imagen detectada.
    anchor.group.add(modelo);

    // ---- PASO 9: Animaciones del modelo (opcional) ----
    // Si el modelo .glb incluye animaciones (gestos, movimiento),
    // las reproducimos automáticamente.
    let mixer = null;

    if (gltf.animations && gltf.animations.length > 0) {
      console.log(`🎬 El modelo tiene ${gltf.animations.length} animación(es)`);

      // AnimationMixer: controla las animaciones de un objeto 3D
      mixer = new THREE.AnimationMixer(modelo);

      // Reproducimos la primera animación en bucle infinito
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
    }

    // ---- PASO 10: Eventos de detección del target ----
    // MindAR dispara estos eventos cuando la cámara detecta
    // o pierde de vista la imagen de la tarjeta física.

    anchor.onTargetFound = () => {
      // ¡La cámara detectó la foto del docente en la tarjeta!
      console.log('🎯 ¡Target detectado! Mostrando modelo 3D');
      // Mostramos el botón "Info Docente" para que el usuario
      // pueda abrir la ficha cuando quiera
      document.getElementById('btn-info').classList.remove('hidden');
    };

    anchor.onTargetLost = () => {
      // La cámara perdió de vista la imagen del docente
      console.log('👋 Target perdido');
      // Ocultamos el botón y cerramos la ficha si estaba abierta
      document.getElementById('btn-info').classList.add('hidden');
      document.getElementById('ficha-overlay').classList.remove('visible');
    };

    // ---- PASO 11: Mostrar Botón para Iniciar Cámara ----
    // Ahora esperamos la interacción del usuario para evitar bloqueos
    // de seguridad (getUserMedia) en navegadores móviles.
    const btnStart = document.getElementById('btn-start');
    const loadingText = document.querySelector('#loading-overlay p');
    const spinner = document.querySelector('.spinner');

    if (loadingText) loadingText.innerText = '¡Todo listo!';
    if (spinner) spinner.style.display = 'none';

    if (btnStart) {
      btnStart.style.display = 'inline-block';
      
      btnStart.addEventListener('click', async () => {
        try {
          btnStart.innerText = 'Conectando...';
          btnStart.disabled = true;
          btnStart.style.opacity = '0.5';

          await mindarThree.start();
          console.log('📸 MindAR iniciado — apunta la cámara a la tarjeta');
          
          // Ocultar overlay
          document.getElementById('loading-overlay').classList.add('hidden');
        } catch (startError) {
          console.error('❌ Error al iniciar cámara o cargar archivo .mind:', startError);
          mostrarError('Error: Faltan archivos del docente o permisos de cámara denegados.');
        }
      });
    }

    // ---- PASO 13: Esperamos a que la ficha termine de cargar ----
    // Si Firestore tardó más que MindAR, aquí esperamos el resultado
    await fichaPromise;

    // ---- PASO 14: Loop de renderizado ----
    // Three.js necesita un loop que redibuje la escena en cada frame
    // (normalmente a 60 FPS). MindAR actualiza las posiciones del
    // tracking en cada frame automáticamente.
    const clock = new THREE.Clock();

    renderer.setAnimationLoop(() => {
      // Si el modelo tiene animaciones, las actualizamos
      if (mixer) {
        const delta = clock.getDelta(); // Tiempo transcurrido entre frames
        mixer.update(delta);
      }

      // Renderizamos la escena con la cámara
      renderer.render(scene, camera);
    });

  } catch (error) {
    console.error('❌ Error fatal al inicializar AR (posible error 404 en modelo .glb):', error);
    mostrarError('Error: Faltan archivos del docente');
  }
}


// =============================================================
// mostrarError(mensaje)
// Reemplaza el overlay de carga con un mensaje de error amigable.
// Incluye un botón para volver a la página principal.
// =============================================================
function mostrarError(mensaje) {
  const overlay = document.getElementById('loading-overlay');
  overlay.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <p style="font-size: 3rem;">😕</p>
      <h2 style="color: #ff5252;">¡Ups! Algo salió mal</h2>
      <p style="max-width: 400px; margin: 1rem auto;">${mensaje}</p>
      <a href="index.html" style="
        display: inline-block;
        margin-top: 1rem;
        padding: 0.75rem 1.5rem;
        background: #00bcd4;
        color: white;
        text-decoration: none;
        border-radius: 8px;
      ">← Volver al inicio</a>
    </div>
  `;
}


// =============================================================
// PUNTO DE ENTRADA
// Esperamos a que todo el HTML esté cargado (DOMContentLoaded)
// antes de inicializar la experiencia AR.
// =============================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Página AR cargada — inicializando...');
    inicializarAR();
  });
} else {
  console.log('📄 Página AR ya estaba cargada — inicializando...');
  inicializarAR();
}
