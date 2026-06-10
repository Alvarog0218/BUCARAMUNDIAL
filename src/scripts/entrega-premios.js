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

// --- SEGURIDAD SIMPLE PARA STAFF ---
const STAFF_PASS = "StaffMundial2026";

const checkAuth = () => {
  if (sessionStorage.getItem("is_staff") === "true") {
    loginSection.classList.add("hidden");
    staffContent.classList.remove("hidden");
    manualCedulaInput?.focus();
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

// --- MANUAL VALIDATION LOGIC ---
const normalizeCedula = (value) => value.replace(/\D/g, "");

const runManualSearch = () => {
  const cedula = normalizeCedula(manualCedulaInput.value);
  manualCedulaInput.value = cedula;

  if (!cedula) {
    scanResultDiv.innerHTML = `
      <div class="py-8 px-4 bg-red-500/10 rounded-2xl border border-red-500/20">
        <p class="text-red-400 font-black uppercase text-sm">Ingresa una cédula</p>
      </div>
    `;
    return;
  }

  searchWinnerById(cedula);
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
      <div class="min-w-0 space-y-4 text-left">
        <p class="text-brand-cyan text-[10px] font-black uppercase tracking-widest mb-2">Premios Encontrados</p>
        ${winningPredictions.map(p => `
          <div class="min-w-0 p-4 rounded-2xl border-2 overflow-hidden ${p.claimed_at ? 'bg-white/5 border-white/10 opacity-60' : 'bg-green-500/10 border-green-500/30'}">
            <div class="flex min-w-0 flex-col gap-2 mb-2 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <p class="break-words text-white font-black uppercase italic text-sm leading-tight">${p.nombre}</p>
                <p class="break-words text-brand-lime text-[10px] font-bold uppercase leading-tight">${p.mundial_matches.team_a} vs ${p.mundial_matches.team_b}</p>
              </div>
              <div class="shrink-0 text-left sm:text-right">
                <p class="text-white font-title text-sm italic">${p.score_a} - ${p.score_b}</p>
              </div>
            </div>
            
            <div class="pt-3 border-t border-white/10 mt-3 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p class="min-w-0 break-words text-[10px] font-bold text-gray-400 uppercase leading-tight sm:flex-1">Premio: ${p.mundial_matches.prize || 'Sorpresa'}</p>
              
              ${p.claimed_at 
                ? `<span class="w-full bg-white/20 text-center text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase sm:w-auto">ENTREGADO</span>`
                : `<button onclick="confirmDelivery('${p.id}', '${cedula}')" class="w-full bg-brand-lime hover:bg-white text-brand-dark font-black px-4 py-2 rounded-lg text-[9px] uppercase tracking-widest transition-all sm:w-auto">ENTREGAR</button>`
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

searchCedulaBtn?.addEventListener("click", runManualSearch);
manualCedulaInput?.addEventListener("input", () => {
  manualCedulaInput.value = normalizeCedula(manualCedulaInput.value);
});
manualCedulaInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") runManualSearch();
});

checkAuth();
