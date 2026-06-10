import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || "https://tkguainbzaqejvvveohf.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrZ3VhaW5iemFxZWp2dnZlb2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEyNjUsImV4cCI6MjA5NjU4NzI2NX0.KFbVfMOW_7CYk3h3d8GkJfHRhp84ozmfVbt9AaqF1NQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginSection = document.getElementById("admin-login");
const adminContent = document.getElementById("admin-content");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const adminPassInput = document.getElementById("admin-pass");
const matchesList = document.getElementById("admin-matches-list");

const winnersModal = document.getElementById("winners-modal");
const closeWinnersBtn = document.getElementById("close-winners");
const winnersTbody = document.getElementById("winners-tbody");
const winnersMatchName = document.getElementById("winners-match-name");
const noWinnersMsg = document.getElementById("no-winners");

// --- MANUAL WINNER VALIDATOR ELEMENTS ---
const openScannerBtn = document.getElementById("open-scanner-btn");
const closeScannerBtn = document.getElementById("close-scanner-btn");
const scannerSection = document.getElementById("scanner-section");
const manualCedulaInput = document.getElementById("manual-cedula");
const searchCedulaBtn = document.getElementById("search-cedula-btn");
const scanResultDiv = document.getElementById("scan-result");

// --- SEGURIDAD SIMPLE ---
const ADMIN_PASS = "AdminBucara2026";

const checkAuth = () => {
  if (sessionStorage.getItem("is_admin") === "true") {
    loginSection.classList.add("hidden");
    adminContent.classList.remove("hidden");
    fetchAdminMatches();
  }
};

loginBtn?.addEventListener("click", () => {
  if (adminPassInput.value === ADMIN_PASS) {
    sessionStorage.setItem("is_admin", "true");
    checkAuth();
  } else {
    alert("Contraseña incorrecta");
  }
});

logoutBtn?.addEventListener("click", () => {
  sessionStorage.removeItem("is_admin");
  window.location.reload();
});

// --- MANUAL WINNER VALIDATOR LOGIC ---
const openValidator = () => {
  scannerSection.classList.remove("hidden");
  manualCedulaInput?.focus();
};

const closeValidator = () => {
  scannerSection.classList.add("hidden");
};

const normalizeCedula = (value) => value.replace(/\D/g, "");

const runManualSearch = () => {
  const cedula = normalizeCedula(manualCedulaInput.value);
  manualCedulaInput.value = cedula;

  if (!cedula) {
    scanResultDiv.innerHTML = `<p class="text-red-400 font-bold text-xs">Ingresa una cédula para buscar.</p>`;
    scanResultDiv.classList.remove("hidden");
    return;
  }

  searchWinnerById(cedula);
};

const searchWinnerById = async (cedula) => {
  scanResultDiv.innerHTML = `<p class="text-brand-cyan animate-pulse font-bold">Buscando...</p>`;
  scanResultDiv.classList.remove("hidden");

  const { data, error } = await supabase
    .from("mundial_predictions")
    .select("*, mundial_matches(*)")
    .eq("cedula", cedula.trim());

  if (error) {
    scanResultDiv.innerHTML = `<p class="text-red-500 font-bold">Error en la búsqueda</p>`;
    return;
  }

  // Filtrar solo las que coinciden con el marcador final (ganadores)
  const winningPredictions = data.filter(p => 
    p.mundial_matches.final_score_a !== null && 
    p.score_a === p.mundial_matches.final_score_a && 
    p.score_b === p.mundial_matches.final_score_b
  );

  if (winningPredictions.length === 0) {
    scanResultDiv.innerHTML = `
      <div class="p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
        <p class="text-red-400 font-black uppercase italic">No es ganador</p>
        <p class="text-[10px] text-gray-400 mt-1">La cédula ${cedula} no tiene predicciones acertadas.</p>
      </div>
    `;
  } else {
    scanResultDiv.innerHTML = winningPredictions.map(p => `
      <div class="p-4 bg-green-500/20 border border-green-500/50 rounded-xl space-y-3">
        <div>
          <p class="text-green-400 font-black uppercase italic">¡GANADOR ENCONTRADO!</p>
          <p class="text-white font-bold text-sm">${p.nombre}</p>
          <p class="text-brand-lime text-[10px] font-black uppercase">${p.mundial_matches.team_a} vs ${p.mundial_matches.team_b}</p>
        </div>
        
        ${p.claimed_at 
          ? `<p class="bg-white/10 text-white text-center py-2 rounded-lg text-[10px] font-black uppercase">Premio ya entregado el ${new Date(p.claimed_at).toLocaleDateString()}</p>`
          : `<button onclick="confirmClaim('${p.id}', '${cedula}')" class="w-full bg-brand-lime text-brand-dark font-black py-2 rounded-lg text-[10px] uppercase tracking-widest hover:bg-white transition-all">Confirmar Entrega</button>`
        }
      </div>
    `).join("<div class='h-4'></div>");
  }
};

window.confirmClaim = async (predictionId, cedula) => {
  if (!confirm("¿Confirmar que la persona ya recibió el premio?")) return;

  const { error } = await supabase
    .from("mundial_predictions")
    .update({ claimed_at: new Date().toISOString() })
    .eq("id", predictionId);

  if (error) {
    alert("Error al confirmar entrega");
  } else {
    alert("Entrega confirmada");
    searchWinnerById(cedula); // Refrescar vista de validación
    if (!winnersModal.classList.contains("hidden")) {
      // Si el modal de ganadores está abierto, refrescarlo también
      // Necesitamos el matchId, pero confirmClaim solo tiene predictionId.
      // Podríamos guardar el matchId activo globalmente.
    }
  }
};

openScannerBtn?.addEventListener("click", openValidator);
closeScannerBtn?.addEventListener("click", closeValidator);
searchCedulaBtn?.addEventListener("click", runManualSearch);
manualCedulaInput?.addEventListener("input", () => {
  manualCedulaInput.value = normalizeCedula(manualCedulaInput.value);
});
manualCedulaInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") runManualSearch();
});

// --- GESTIÓN DE PARTIDOS ---
let matches = [];
let activeMatchId = null;

const fetchAdminMatches = async () => {
  const { data, error } = await supabase
    .from("mundial_matches")
    .select("*")
    .order("match_time", { ascending: true });

  if (error) {
    console.error("Error fetching admin matches:", error);
    return;
  }

  matches = data;
  renderAdminMatches(data);
};

const countryCodes = {
  "México": "mx", "Sudáfrica": "za", "Corea del Sur": "kr", "Chequia": "cz",
  "Canadá": "ca", "Bosnia y Herz.": "ba", "Estados Unidos": "us", "Paraguay": "py",
  "Catar": "qa", "Suiza": "ch", "Brasil": "br", "Marruecos": "ma",
  "Haití": "ht", "Escocia": "gb-sct", "Australia": "au", "Turquía": "tr",
  "Alemania": "de", "Curazao": "cw", "Países Bajos": "nl", "Japón": "jp",
  "Costa de Marfil": "ci", "Ecuador": "ec", "Suecia": "se", "Túnez": "tn",
  "España": "es", "Cabo Verde": "cv", "Bélgica": "be", "Egipto": "eg",
  "Arabia Saudí": "sa", "Uruguay": "uy", "RI de Irán": "ir", "Nueva Zelanda": "nz",
  "Francia": "fr", "Senegal": "sn", "Irak": "iq", "Noruega": "no",
  "Argentina": "ar", "Argelia": "dz", "Austria": "at", "Jordania": "jo",
  "Portugal": "pt", "RD Congo": "cd", "Inglaterra": "gb-eng", "Croacia": "hr",
  "Ghana": "gh", "Panamá": "pa", "Uzbekistán": "uz", "Colombia": "co"
};

const getFlagUrl = (countryName) => {
  const code = countryCodes[countryName];
  if (!code) return `https://placehold.co/60x40/1e293b/white?text=${countryName.substring(0,2)}`;
  return `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
};

const renderAdminMatches = (data) => {
  // Agrupar partidos por fecha
  const groups = data.reduce((acc, match) => {
    const date = new Date(match.match_time).toLocaleDateString([], { weekday: 'long', day: '2-digit', month: 'long' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {});

  matchesList.innerHTML = Object.entries(groups).map(([date, matchesInDay]) => {
    return `
      <div class="mb-10">
        <button 
          onclick="toggleGroup('${date.replace(/\s/g, '-')}')"
          class="w-full flex items-center justify-between bg-brand-blue/20 border border-white/10 px-6 py-4 rounded-2xl mb-4 group hover:border-brand-lime/50 transition-all"
        >
          <h3 class="text-brand-lime font-black uppercase italic tracking-tighter text-lg md:text-xl">${date}</h3>
          <span class="text-gray-500 group-hover:text-white transition-colors">
            <svg class="w-6 h-6 transform transition-transform" id="icon-${date.replace(/\s/g, '-')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </span>
        </button>
        
        <div id="group-${date.replace(/\s/g, '-')}" class="space-y-6 hidden">
          ${matchesInDay.map(match => {
            const isFinished = match.final_score_a !== null && match.final_score_b !== null;
            const timeStr = new Date(match.match_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return `
              <div class="bg-brand-dark/40 border border-white/10 rounded-[2.5rem] p-6 md:p-8 transition-all hover:border-brand-lime/20 shadow-xl overflow-hidden">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                  <!-- Columna 1: Equipos y Hora -->
                  <div class="space-y-6">
                    <div class="inline-block bg-brand-blue/30 text-brand-cyan text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-brand-cyan/20">
                      ${timeStr}
                    </div>
                    
                    <div class="flex items-center justify-around gap-4">
                      <div class="flex flex-col items-center min-w-0">
                        <img src="${getFlagUrl(match.team_a)}" class="w-20 h-14 md:w-24 md:h-16 object-cover rounded-xl shadow-lg border border-white/10 mb-2">
                        <p class="text-[10px] font-black uppercase text-white tracking-widest truncate w-full text-center">${match.team_a}</p>
                      </div>
                      
                      <span class="text-brand-lime font-title text-xl italic opacity-50">VS</span>
                      
                      <div class="flex flex-col items-center min-w-0">
                        <img src="${getFlagUrl(match.team_b)}" class="w-20 h-14 md:w-24 md:h-16 object-cover rounded-xl shadow-lg border border-white/10 mb-2">
                        <p class="text-[10px] font-black uppercase text-white tracking-widest truncate w-full text-center">${match.team_b}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Columna 2: Resultado y Premio -->
                  <div class="lg:border-x lg:border-white/5 lg:px-8 flex flex-col items-center gap-6">
                    <div class="w-full">
                      <p class="text-[8px] font-black uppercase text-gray-500 tracking-widest text-center mb-3">Marcador Final</p>
                      <div class="flex items-center justify-center gap-3">
                        <input type="number" id="score-a-${match.id}" value="${match.final_score_a ?? ''}" class="w-14 bg-brand-dark border-2 border-brand-lime/20 rounded-xl py-2 text-center text-xl font-black text-brand-lime outline-none focus:border-brand-lime">
                        <span class="text-white/20 font-black text-xl">-</span>
                        <input type="number" id="score-b-${match.id}" value="${match.final_score_b ?? ''}" class="w-14 bg-brand-dark border-2 border-brand-lime/20 rounded-xl py-2 text-center text-xl font-black text-brand-lime outline-none focus:border-brand-lime">
                      </div>
                    </div>

                    <div class="w-full max-w-[240px]">
                      <p class="text-[8px] font-black uppercase text-gray-500 tracking-widest text-center mb-2">Premio del Partido</p>
                      <div class="flex gap-2">
                        <input type="text" id="prize-${match.id}" value="${match.prize || ''}" placeholder="Ej: Camiseta..." class="flex-1 bg-brand-dark border border-white/10 rounded-xl px-4 py-2 text-white text-[10px] font-bold outline-none focus:border-brand-cyan transition-all">
                        <button onclick="updateMatchPrize('${match.id}')" class="bg-brand-cyan hover:bg-white text-brand-dark px-3 py-2 rounded-xl transition-all flex-shrink-0">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Columna 3: Acciones -->
                  <div class="flex flex-col gap-3">
                    <button onclick="saveMatchResult('${match.id}')" class="w-full bg-brand-lime hover:bg-white text-brand-dark font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-lg italic">
                      Actualizar Resultado
                    </button>
                    <button 
                      onclick="calculateWinners('${match.id}')" 
                      class="w-full inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-brand-cyan text-white hover:text-brand-dark font-black px-6 py-4 rounded-2xl text-[10px] uppercase italic transition-all border border-white/10 ${!isFinished ? 'opacity-30 grayscale cursor-not-allowed' : ''}"
                      ${!isFinished ? 'disabled' : ''}
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Ver Ganadores
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }).join("");
};

window.toggleGroup = (id) => {
  const group = document.getElementById(`group-${id}`);
  const icon = document.getElementById(`icon-${id}`);
  if (group) {
    group.classList.toggle("hidden");
    icon.classList.toggle("rotate-180");
  }
};

// --- ACCIONES ADMIN ---
window.updateMatchPrize = async (id) => {
  const prize = document.getElementById(`prize-${id}`).value;
  const { error } = await supabase
    .from("mundial_matches")
    .update({ prize })
    .eq("id", id);

  if (error) alert("Error actualizando premio");
  else alert("Premio actualizado");
};

window.saveMatchResult = async (id) => {
  const scoreA = document.getElementById(`score-a-${id}`).value;
  const scoreB = document.getElementById(`score-b-${id}`).value;

  if (scoreA === "" || scoreB === "") {
    alert("Ingresa ambos marcadores");
    return;
  }

  const { error } = await supabase
    .from("mundial_matches")
    .update({ 
      final_score_a: parseInt(scoreA), 
      final_score_b: parseInt(scoreB) 
    })
    .eq("id", id);

  if (error) alert("Error guardando resultado");
  else {
    alert("Resultado guardado. Ahora puedes ver los ganadores.");
    fetchAdminMatches();
  }
};

window.calculateWinners = async (matchId) => {
  activeMatchId = matchId;
  const match = matches.find(m => m.id === matchId);
  if (!match) return;

  const { data: predictions, error } = await supabase
    .from("mundial_predictions")
    .select("*")
    .eq("match_id", matchId)
    .eq("score_a", match.final_score_a)
    .eq("score_b", match.final_score_b);

  if (error) {
    console.error("Error calculating winners:", error);
    return;
  }

  renderWinnersInModal(predictions, match);
};

const renderWinnersInModal = (predictions, match) => {
  winnersMatchName.innerText = `${match.team_a} (${match.final_score_a}) vs ${match.team_b} (${match.final_score_b})`;
  winnersTbody.innerHTML = predictions.map(p => `
    <tr class="hover:bg-white/5 transition-colors">
      <td class="py-4 px-4 text-center">
        <p class="text-white font-bold">${p.nombre}</p>
        <p class="text-gray-400 font-mono text-[10px]">${p.cedula}</p>
      </td>
      <td class="py-4 px-4 text-brand-cyan font-bold text-center">
        <a href="https://wa.me/${p.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${p.nombre}! Ganaste la Polla Mundialista de ${match.team_a} vs ${match.team_b}. Tu premio es: ${match.prize}.`)}" target="_blank" class="hover:underline">
          ${p.whatsapp}
        </a>
      </td>
      <td class="py-4 px-4 text-center">
        ${p.claimed_at 
          ? `<span class="text-green-400 text-[9px] font-black uppercase bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">Entregado</span>` 
          : `<span class="text-gray-500 text-[9px] font-black uppercase bg-white/5 px-3 py-1 rounded-full border border-white/10">Pendiente</span>`
        }
      </td>
      <td class="py-4 px-4 text-center">
        ${!p.claimed_at 
          ? `<button onclick="confirmClaimFromList('${p.id}', '${p.match_id}', '${p.cedula}')" class="text-brand-lime hover:text-white text-[9px] font-black uppercase tracking-widest border border-brand-lime/30 px-4 py-2 rounded-lg hover:bg-brand-lime hover:text-brand-dark transition-all">Confirmar Entrega</button>`
          : `<span class="text-gray-600 text-[9px] font-black uppercase">${new Date(p.claimed_at).toLocaleDateString()}</span>`
        }
      </td>
    </tr>
  `).join("");

  noWinnersMsg.classList.toggle("hidden", predictions.length > 0);
  winnersModal.classList.remove("hidden");
  winnersModal.classList.add("flex");
};

window.confirmClaimFromList = async (predictionId, matchId, cedula) => {
  if (!confirm("¿Confirmar entrega de premio?")) return;

  const { error } = await supabase
    .from("mundial_predictions")
    .update({ claimed_at: new Date().toISOString() })
    .eq("id", predictionId);

  if (error) {
    alert("Error al confirmar entrega");
  } else {
    // Refrescar el modal de ganadores
    const match = matches.find(m => m.id === matchId);
    calculateWinners(matchId);
  }
};

closeWinnersBtn?.addEventListener("click", () => {
  winnersModal.classList.add("hidden");
  winnersModal.classList.remove("flex");
});

checkAuth();
