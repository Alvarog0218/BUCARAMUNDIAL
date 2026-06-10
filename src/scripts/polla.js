import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || "https://tkguainbzaqejvvveohf.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrZ3VhaW5iemFxZWp2dnZlb2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEyNjUsImV4cCI6MjA5NjU4NzI2NX0.KFbVfMOW_7CYk3h3d8GkJfHRhp84ozmfVbt9AaqF1NQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const matchesContainer = document.getElementById("matches-container");
const modal = document.getElementById("prediction-modal");
const closeModalBtn = document.getElementById("close-modal");
const pollaForm = document.getElementById("polla-form");

let activeMatches = [];

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

const countryColors = {
  "México": ["#006847", "#ce1126"], "Sudáfrica": ["#007a4d", "#ffb612"],
  "Corea del Sur": ["#c60c30", "#003478"], "Chequia": ["#d7141a", "#11457e"],
  "Canadá": ["#ff0000", "#ffffff"], "Bosnia y Herz.": ["#002f6c", "#feca30"],
  "Estados Unidos": ["#b22234", "#3c3b6e"], "Paraguay": ["#d52b1e", "#0038a8"],
  "Catar": ["#8a1538", "#ffffff"], "Suiza": ["#ff0000", "#ffffff"],
  "Brasil": ["#009c3b", "#ffdf00"], "Marruecos": ["#c1272d", "#006233"],
  "Haití": ["#00209f", "#d21034"], "Escocia": ["#005eb8", "#ffffff"],
  "Australia": ["#00008b", "#ffcd00"], "Turquía": ["#e30a17", "#ffffff"],
  "Alemania": ["#000000", "#dd0000"], "Curazao": ["#002b7f", "#f9e814"],
  "Países Bajos": ["#ae1c28", "#21468b"], "Japón": ["#bc002d", "#ffffff"],
  "Costa de Marfil": ["#f77f00", "#009e60"], "Ecuador": ["#ffdd00", "#034ea2"],
  "Suecia": ["#006aa7", "#fecc00"], "Túnez": ["#e70013", "#ffffff"],
  "España": ["#aa151b", "#f1bf00"], "Cabo Verde": ["#003893", "#cf2027"],
  "Bélgica": ["#000000", "#fae042"], "Egipto": ["#ce1126", "#000000"],
  "Arabia Saudí": ["#006c35", "#ffffff"], "Uruguay": ["#0038a8", "#fcd116"],
  "RI de Irán": ["#239f40", "#da0000"], "Nueva Zelanda": ["#00247d", "#cc142b"],
  "Francia": ["#0055a4", "#ef4135"], "Senegal": ["#00853f", "#fdef42"],
  "Irak": ["#ce1126", "#007a3d"], "Noruega": ["#ba0c2f", "#00205b"],
  "Argentina": ["#75aadb", "#f6b40e"], "Argelia": ["#006233", "#d21034"],
  "Austria": ["#ed2939", "#ffffff"], "Jordania": ["#007a3d", "#ce1126"],
  "Portugal": ["#006600", "#ff0000"], "RD Congo": ["#007fff", "#f7d618"],
  "Inglaterra": ["#cf081f", "#ffffff"], "Croacia": ["#ff0000", "#171796"],
  "Ghana": ["#ce1126", "#fcd116"], "Panamá": ["#005293", "#d21034"],
  "Uzbekistán": ["#1eb5e0", "#009739"], "Colombia": ["#fcd116", "#003893"]
};

const getFlagUrl = (countryName) => {
  const code = countryCodes[countryName];
  if (!code) return `https://placehold.co/160x104/1e293b/white?text=${countryName.substring(0,2)}`;
  return `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
};

const hexToRgba = (hex, alpha) => {
  const cleanHex = hex.replace("#", "");
  const value = parseInt(cleanHex.length === 3 ? cleanHex.split("").map(char => char + char).join("") : cleanHex, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const getTeamColors = (countryName) => {
  const colors = countryColors[countryName] || ["#0288d1", "#d4e157"];
  return {
    primary: colors[0],
    secondary: colors[1]
  };
};

const getMatchCardStyle = (teamA, teamB) => {
  const colorA = getTeamColors(teamA);
  const colorB = getTeamColors(teamB);

  return [
    `--team-a:${colorA.primary}`,
    `--team-a-soft:${hexToRgba(colorA.primary, 0.54)}`,
    `--team-a-muted:${hexToRgba(colorA.secondary, 0.28)}`,
    `--team-b:${colorB.primary}`,
    `--team-b-soft:${hexToRgba(colorB.primary, 0.54)}`,
    `--team-b-muted:${hexToRgba(colorB.secondary, 0.28)}`,
    `--team-border:${hexToRgba(colorA.primary, 0.38)}`,
    `--team-shadow:${hexToRgba(colorB.primary, 0.22)}`
  ].join(";");
};

const fetchMatches = async () => {
  const { data, error } = await supabase
    .from("mundial_matches")
    .select("*")
    .eq("is_active", true)
    .order("match_time", { ascending: true });

  if (error) {
    console.error("Error fetching matches:", error);
    matchesContainer.innerHTML = `<p class="col-span-full text-center text-red-400 font-bold">Error al cargar los partidos. Por favor intenta más tarde.</p>`;
    return;
  }

  activeMatches = data;
  renderMatches(data);
};

const renderMatches = (matches) => {
  const now = new Date();
  const eventStartDay = new Date("2026-06-11T00:00:00-05:00");
  
  let dayToShow = new Date(now);
  if (now < eventStartDay) {
    dayToShow = eventStartDay;
  }

  const upcomingMatches = matches.filter(match => {
    const matchDate = new Date(match.match_time);
    const isSameDay = 
      matchDate.getDate() === dayToShow.getDate() &&
      matchDate.getMonth() === dayToShow.getMonth() &&
      matchDate.getFullYear() === dayToShow.getFullYear();
    return isSameDay && matchDate > now;
  });

  if (upcomingMatches.length === 0) {
    matchesContainer.innerHTML = `
      <div class="col-span-full py-16 text-center bg-brand-blue/10 rounded-[2rem] border-2 border-dashed border-white/10">
        <p class="text-xl text-gray-400 font-bold italic uppercase tracking-wider">No hay partidos próximos disponibles</p>
        <p class="text-sm text-gray-500 mt-2">Vuelve pronto para participar en el siguiente encuentro.</p>
      </div>
    `;
    return;
  }

  matchesContainer.innerHTML = upcomingMatches.map(match => {
    const time = new Date(match.match_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = new Date(match.match_time).toLocaleDateString([], { day: '2-digit', month: 'long' });
    const cardStyle = getMatchCardStyle(match.team_a, match.team_b);

    return `
      <article
        style="${cardStyle}"
        class="match-card-pitch relative flex h-full min-h-[20.5rem] flex-col justify-center overflow-hidden rounded-lg border border-white/28 p-5 shadow-[0_24px_54px_rgba(0,0,0,0.34),0_0_36px_var(--team-shadow)] transition-all duration-300 hover:-translate-y-1 hover:border-white/55 hover:shadow-[0_30px_70px_rgba(0,0,0,0.44),0_0_48px_var(--team-shadow)]"
      >
        <div class="match-card-field-lines" aria-hidden="true">
          <span class="match-card-penalty match-card-penalty-left"></span>
          <span class="match-card-penalty match-card-penalty-right"></span>
        </div>
        <div class="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--team-a),rgba(255,255,255,0.78),var(--team-b))]"></div>

        <div class="relative z-10 mb-2.5 flex items-center justify-between gap-2.5 rounded-lg border border-white/24 bg-black/28 p-2.5 shadow-inner backdrop-blur-md">
          <div class="min-w-0 flex-1 text-center">
             <img src="${getFlagUrl(match.team_a)}" alt="${match.team_a}" class="mx-auto mb-1.5 aspect-[8/5] w-full max-w-[7.35rem] rounded-md border border-white/15 object-cover shadow-[0_14px_30px_rgba(0,0,0,0.32)]" loading="lazy">
             <p class="truncate text-[0.72rem] font-black uppercase leading-tight text-white md:text-sm">${match.team_a}</p>
          </div>
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/85 text-brand-dark shadow-[0_0_28px_rgba(255,255,255,0.22)] backdrop-blur">
            <span class="font-title text-[0.62rem] italic leading-none text-brand-dark">VS</span>
          </div>
          <div class="min-w-0 flex-1 text-center">
             <img src="${getFlagUrl(match.team_b)}" alt="${match.team_b}" class="mx-auto mb-1.5 aspect-[8/5] w-full max-w-[7.35rem] rounded-md border border-white/15 object-cover shadow-[0_14px_30px_rgba(0,0,0,0.32)]" loading="lazy">
             <p class="truncate text-[0.72rem] font-black uppercase leading-tight text-white md:text-sm">${match.team_b}</p>
          </div>
        </div>
        
        <div class="relative z-10 mb-2.5 grid grid-cols-[1fr_auto] items-center gap-2.5">
          <div>
            <p class="mb-1 text-[0.64rem] font-black uppercase tracking-widest text-white/72">${date}</p>
            <p class="font-title text-xl leading-none text-white">${time}</p>
          </div>
          <div class="rounded-lg border border-white/20 bg-white/12 px-3 py-1.5 text-right shadow-inner backdrop-blur-md">
            <p class="text-[0.58rem] font-black uppercase tracking-widest text-white/70">Premio</p>
            <p class="max-w-[8.5rem] truncate text-xs font-black uppercase text-white">${match.prize || 'Sorpresa'}</p>
          </div>
        </div>

        <button 
          data-match-id="${match.id}"
          class="open-prediction-btn relative z-10 w-full rounded-lg bg-white py-3 text-sm font-black uppercase tracking-wide text-brand-dark shadow-[0_14px_28px_rgba(0,0,0,0.22)] transition-all hover:bg-brand-lime hover:shadow-[0_18px_36px_rgba(255,255,255,0.18)]"
        >
          Hacer Predicción
        </button>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".open-prediction-btn").forEach(btn => {
    btn.addEventListener("click", () => openPredictionModal(btn.dataset.matchId));
  });
};

const openPredictionModal = (matchId) => {
  const match = activeMatches.find(m => m.id === matchId);
  if (!match) return;

  document.getElementById("form-match-id").value = match.id;
  document.getElementById("modal-match-name").innerText = `${match.team_a} vs ${match.team_b}`;
  document.getElementById("team-a-label").innerText = match.team_a;
  document.getElementById("team-b-label").innerText = match.team_b;

  const flagA = document.getElementById("modal-flag-a");
  const flagB = document.getElementById("modal-flag-b");

  if (flagA && flagB) {
    flagA.src = getFlagUrl(match.team_a);
    flagB.src = getFlagUrl(match.team_b);
    flagA.classList.remove("hidden");
    flagB.classList.remove("hidden");
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
};

const closeModal = () => {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "auto";
  pollaForm.reset();
};

closeModalBtn?.addEventListener("click", closeModal);

pollaForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(pollaForm);
  const submitBtn = document.getElementById("submit-btn");

  const prediction = {
    match_id: formData.get("match_id"),
    nombre: formData.get("nombre"),
    cedula: formData.get("cedula"),
    whatsapp: formData.get("whatsapp"),
    score_a: parseInt(formData.get("score_a")),
    score_b: parseInt(formData.get("score_b"))
  };

  const match = activeMatches.find(m => m.id === prediction.match_id);
  if (new Date(match.match_time) <= new Date()) {
    alert("Lo sentimos, este partido ya ha comenzado y las predicciones están cerradas.");
    closeModal();
    return;
  }

  submitBtn.innerText = "REGISTRANDO...";
  submitBtn.disabled = true;

  const { error } = await supabase
    .from("mundial_predictions")
    .insert([prediction]);

  if (error) {
    if (error.code === "23505") {
      alert("Ya has registrado una predicción para este partido con este número de cédula.");
    } else {
      alert("Hubo un error al guardar tu predicción. Por favor intenta de nuevo.");
    }
    submitBtn.innerText = "REGISTRAR PREDICCIÓN";
    submitBtn.disabled = false;
    return;
  }

  submitBtn.innerText = "¡PREDICCIÓN REGISTRADA!";
  submitBtn.classList.remove("bg-brand-lime");
  submitBtn.classList.add("bg-green-500", "text-white");

  setTimeout(() => {
    closeModal();
    submitBtn.innerText = "REGISTRAR PREDICCIÓN";
    submitBtn.classList.add("bg-brand-lime");
    submitBtn.classList.remove("bg-green-500", "text-white");
    submitBtn.disabled = false;
  }, 2000);
});

fetchMatches();
