import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || "https://tkguainbzaqejvvveohf.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrZ3VhaW5iemFxZWp2dnZlb2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEyNjUsImV4cCI6MjA5NjU4NzI2NX0.KFbVfMOW_7CYk3h3d8GkJfHRhp84ozmfVbt9AaqF1NQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginSection = document.getElementById("staff-login");
const staffContent = document.getElementById("staff-content");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const staffPassInput = document.getElementById("staff-pass");

const manualCedulaInput = document.getElementById("manual-cedula");
const searchCedulaBtn = document.getElementById("search-cedula-btn");
const scanResultDiv = document.getElementById("scan-result");
const restartCameraBtn = document.getElementById("restart-camera");

let html5QrCode = null;

// --- SEGURIDAD SIMPLE PARA STAFF ---
const STAFF_PASS = "StaffMundial2026";

const checkAuth = () => {
  if (sessionStorage.getItem("is_staff") === "true") {
    loginSection.classList.add("hidden");
    staffContent.classList.remove("hidden");
    startScanner();
  }
};

loginBtn?.addEventListener("click", () => {
  if (staffPassInput.value === STAFF_PASS) {
    sessionStorage.setItem("is_staff", "true");
    checkAuth();
  } else {
    alert("Contraseña de logística incorrecta");
  }
});

logoutBtn?.addEventListener("click", () => {
  sessionStorage.removeItem("is_staff");
  window.location.reload();
});

// --- SCANNER LOGIC ---
const startScanner = async () => {
  if (html5QrCode) {
    await html5QrCode.stop();
  }
  
  html5QrCode = new Html5Qrcode("reader");
  const config = { 
    fps: 10, 
    qrbox: { width: 400, height: 200 },
    formatsToSupport: [ Html5QrcodeSupportedFormats.PDF_417, Html5QrcodeSupportedFormats.QR_CODE ],
    experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
    }
  };

  try {
    await html5QrCode.start(
      { facingMode: "environment" }, 
      config,
      (decodedText) => {
        processScannedData(decodedText);
      }
    );
  } catch (err) {
    console.error("Error starting scanner", err);
    scanResultDiv.innerHTML = `<p class="text-red-400 font-bold text-xs mt-4">Error: No se pudo acceder a la cámara. Asegúrate de dar permisos.</p>`;
  }
};

const processScannedData = (data) => {
  let cedula = null;

  // Método 1: Intentar extraer por posiciones fijas (Formato estándar Cédula Colombiana)
  try {
    // La cédula suele estar entre la posición 48 y 58
    const fixedPos = data.substring(48, 58).replace(/\D/g, ''); // Solo números
    const cleanFixed = fixedPos.replace(/^0+/, ''); // Quitar ceros a la izquierda
    if (cleanFixed.length >= 5 && cleanFixed.length <= 11) {
      cedula = cleanFixed;
    }
  } catch (e) {
    console.error("Error en extracción por posición", e);
  }

  // Método 2: Si el método 1 falla, buscar cualquier secuencia larga de números
  if (!cedula) {
    // Quitar todos los caracteres nulos o especiales raros y buscar números
    const cleanData = data.replace(/\0/g, '').replace(/[^0-9A-Za-z]/g, ' ');
    const matches = cleanData.match(/\d{5,11}/g);
    
    if (matches && matches.length > 0) {
      // Tomar la primera secuencia que no sea solo ceros
      for (const match of matches) {
        const posible = match.replace(/^0+/, '');
        if (posible.length >= 5) {
          cedula = posible;
          break;
        }
      }
    }
  }

  if (cedula) {
    // Evitar escaneos duplicados rápidos
    if (manualCedulaInput.value === cedula) return;
    
    manualCedulaInput.value = cedula;
    searchWinnerById(cedula);
    // Feedback físico
    if (window.navigator.vibrate) window.navigator.vibrate(200);
  } else {
    // Modo Debugging: Mostrar qué fue lo que leyó la cámara para ayudar a solucionar
    scanResultDiv.innerHTML = `
      <div class="py-6 px-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-left">
        <p class="text-yellow-400 font-black uppercase text-xs mb-2">Lectura no reconocida</p>
        <p class="text-[9px] text-gray-400 mb-2">Se leyó un código pero no se detectó la cédula. Resultado crudo:</p>
        <div class="bg-black/50 p-2 rounded-lg break-all font-mono text-[8px] text-gray-500 max-h-24 overflow-y-auto">
          ${data.replace(/</g, '&lt;')}
        </div>
      </div>
    `;
  }
};

const searchWinnerById = async (cedula) => {
  scanResultDiv.innerHTML = `
    <div class="py-10">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-lime border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      <p class="mt-4 text-brand-cyan font-bold uppercase tracking-widest text-xs">Buscando en sistema...</p>
    </div>
  `;

  const { data, error } = await supabase
    .from("mundial_predictions")
    .select("*, mundial_matches(*)")
    .eq("cedula", cedula.trim());

  if (error) {
    scanResultDiv.innerHTML = `<p class="text-red-500 font-bold">Error de conexión</p>`;
    return;
  }

  // Ganadores = marcador acertado
  const winningPredictions = data.filter(p => 
    p.mundial_matches.final_score_a !== null && 
    p.score_a === p.mundial_matches.final_score_a && 
    p.score_b === p.mundial_matches.final_score_b
  );

  if (winningPredictions.length === 0) {
    scanResultDiv.innerHTML = `
      <div class="py-10 px-4 bg-red-500/10 rounded-2xl border border-red-500/20">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p class="text-red-400 font-black uppercase italic text-lg leading-tight">No es ganador</p>
        <p class="text-xs text-gray-500 mt-2">La cédula ${cedula} no registra aciertos.</p>
      </div>
    `;
  } else {
    scanResultDiv.innerHTML = `
      <div class="space-y-4 text-left">
        <p class="text-brand-cyan text-[10px] font-black uppercase tracking-widest mb-2">Premios Encontrados</p>
        ${winningPredictions.map(p => `
          <div class="p-4 rounded-2xl border-2 ${p.claimed_at ? 'bg-white/5 border-white/10 opacity-60' : 'bg-green-500/10 border-green-500/30'}">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-white font-black uppercase italic text-sm">${p.nombre}</p>
                <p class="text-brand-lime text-[10px] font-bold uppercase">${p.mundial_matches.team_a} vs ${p.mundial_matches.team_b}</p>
              </div>
              <div class="text-right">
                <p class="text-white font-title text-sm italic">${p.score_a} - ${p.score_b}</p>
              </div>
            </div>
            
            <div class="pt-3 border-t border-white/10 mt-3 flex items-center justify-between gap-4">
              <p class="text-[10px] font-bold text-gray-400 uppercase truncate flex-1">Premio: ${p.mundial_matches.prize || 'Sorpresa'}</p>
              
              ${p.claimed_at 
                ? `<span class="bg-white/20 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase">ENTREGADO</span>`
                : `<button onclick="confirmDelivery('${p.id}', '${cedula}')" class="bg-brand-lime hover:bg-white text-brand-dark font-black px-4 py-2 rounded-lg text-[9px] uppercase tracking-widest transition-all">ENTREGAR</button>`
              }
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }
};

window.confirmDelivery = async (predictionId, cedula) => {
  if (!confirm("¿Confirma que está entregando el premio físico a esta persona?")) return;

  const { error } = await supabase
    .from("mundial_predictions")
    .update({ claimed_at: new Date().toISOString() })
    .eq("id", predictionId);

  if (error) {
    alert("Error al registrar entrega");
  } else {
    // Éxito: vibrar y refrescar
    if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
    searchWinnerById(cedula);
  }
};

searchCedulaBtn?.addEventListener("click", () => searchWinnerById(manualCedulaInput.value));
restartCameraBtn?.addEventListener("click", startScanner);

checkAuth();
