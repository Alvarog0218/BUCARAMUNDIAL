import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.PUBLIC_SUPABASE_URL || "https://tkguainbzaqejvvveohf.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrZ3VhaW5iemFxZWp2dnZlb2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEyNjUsImV4cCI6MjA5NjU4NzI2NX0.KFbVfMOW_7CYk3h3d8GkJfHRhp84ozmfVbt9AaqF1NQ";

const purchaseLinks = {
  individual: "https://quickticket.com.co/event/5c21b87b-f95c-4b9b-b214-0f282c05e20d",
  abono: "https://quickticket.com.co/event/9e5d27cf-c051-48eb-9f29-c6271ea23684"
};

const purchaseButtonLabels = {
  individual: "Ir a comprar boleta",
  abono: "Ir a comprar abono"
};

const eventStartDate = new Date("2026-06-18T02:00:00Z");

const ticketFieldNames = ["nombre", "whatsapp", "email", "tipo", "zona", "acepta_tratamiento"];
const disposableEmailDomains = new Set([
  "10minutemail.com",
  "20minutemail.com",
  "33mail.com",
  "dispostable.com",
  "dropmail.me",
  "emailondeck.com",
  "fakeinbox.com",
  "getnada.com",
  "grr.la",
  "guerrillamail.biz",
  "guerrillamail.com",
  "guerrillamail.de",
  "guerrillamail.net",
  "guerrillamail.org",
  "inboxkitten.com",
  "mail.gw",
  "mail.tm",
  "maildrop.cc",
  "mailinator.com",
  "mailnesia.com",
  "mintemail.com",
  "moakt.com",
  "mytemp.email",
  "sharklasers.com",
  "temp-mail.io",
  "temp-mail.org",
  "tempmail.com",
  "tempmail.net",
  "tempr.email",
  "throwawaymail.com",
  "tmail.io",
  "trashmail.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net"
]);

const formatCountdownValue = (value) => String(value).padStart(2, "0");

const updateEventCountdown = () => {
  const countdownElement = document.querySelector("[data-event-countdown]");

  if (!countdownElement) {
    return;
  }

  const valueElements = {
    days: countdownElement.querySelector("[data-countdown-value='days']"),
    hours: countdownElement.querySelector("[data-countdown-value='hours']"),
    minutes: countdownElement.querySelector("[data-countdown-value='minutes']"),
    seconds: countdownElement.querySelector("[data-countdown-value='seconds']")
  };

  const diff = eventStartDate.getTime() - Date.now();

  if (diff <= 0) {
    countdownElement.innerHTML =
      '<p class="text-sm font-black uppercase tracking-[0.28em] text-brand-lime sm:text-base">BUCARAMUNDIAL YA ESTA EN VIVO</p>';
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  valueElements.days.innerText = formatCountdownValue(days);
  valueElements.hours.innerText = formatCountdownValue(hours);
  valueElements.minutes.innerText = formatCountdownValue(minutes);
  valueElements.seconds.innerText = formatCountdownValue(seconds);
};

const getSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
};

const scrollToRegistration = () => {
  document.getElementById("registro")?.scrollIntoView({ behavior: "smooth" });
};

const closeMobileMenu = () => {
  const toggle = document.querySelector("[data-mobile-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");

  if (!toggle || !menu) {
    return;
  }

  toggle.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Abrir menu");
  menu.classList.add("hidden");
};

const toggleMobileMenu = () => {
  const toggle = document.querySelector("[data-mobile-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");

  if (!toggle || !menu) {
    return;
  }

  const isOpen = toggle.getAttribute("aria-expanded") === "true";

  toggle.classList.toggle("is-open", !isOpen);
  toggle.setAttribute("aria-expanded", String(!isOpen));
  toggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Cerrar menu");
  menu.classList.toggle("hidden", isOpen);
};

const selectZone = (zone) => {
  const form = document.querySelector("[data-ticket-form]");

  if (!form) {
    return;
  }

  if (!form.elements.tipo.value || zone === "General") {
    form.elements.tipo.value = "individual";
  }

  updateZoneOptions(form);

  const hasOption = Array.from(form.elements.zona.options).some(
    (option) => option.value === zone && !option.hidden
  );

  if (hasOption) {
    form.elements.zona.value = zone;
  }
};

const openModal = (src) => {
  const modal = document.getElementById("map-modal");
  const modalImg = document.getElementById("modal-img");

  if (!modal || !modalImg) {
    return;
  }

  modalImg.src = src;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
};

const closeModal = () => {
  const modal = document.getElementById("map-modal");

  if (!modal) {
    return;
  }

  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "auto";
};

const updatePurchaseButton = (form) => {
  const button = form.querySelector("button[type='submit']");

  if (!button || button.disabled) {
    return;
  }

  button.innerText = purchaseButtonLabels[form.elements.tipo.value] || "Ir a comprar";
};

const updateZoneOptions = (form) => {
  const ticketType = form.elements.tipo.value;
  const zoneSelect = form.elements.zona;

  zoneSelect.disabled = !ticketType;

  Array.from(zoneSelect.options).forEach((option) => {
    if (!option.value) {
      return;
    }

    const isAvailable =
      option.dataset.ticketScope === "all" || option.dataset.ticketScope === ticketType;

    option.hidden = !isAvailable;
    option.disabled = !isAvailable;
  });

  const selectedOption = zoneSelect.selectedOptions[0];

  if (selectedOption?.disabled || selectedOption?.hidden) {
    zoneSelect.value = "";
  }

  updatePurchaseButton(form);
};

const getEmailDomain = (email) => email.trim().toLowerCase().split("@").pop() || "";

const isDisposableEmail = (email) => {
  const domain = getEmailDomain(email);

  if (!domain) {
    return false;
  }

  return Array.from(disposableEmailDomains).some(
    (blockedDomain) => domain === blockedDomain || domain.endsWith(`.${blockedDomain}`)
  );
};

const getFieldErrorMessage = (field, form) => {
  if (field.type === "checkbox" && !field.checked) {
    return "Debes autorizar el tratamiento de datos.";
  }

  if (field.name === "zona" && field.disabled) {
    return "Selecciona primero el tipo de compra.";
  }

  if (!field.value.trim()) {
    return "Este campo es obligatorio.";
  }

  if (field.type === "email" && !field.validity.valid) {
    return "Ingresa un correo valido.";
  }

  if (field.type === "email" && isDisposableEmail(field.value)) {
    return "Ingresa un correo personal o corporativo valido.";
  }

  if (field.name === "whatsapp" && field.value.trim().length < 7) {
    return "Ingresa un telefono valido.";
  }

  if (
    field.name === "zona" &&
    form.elements.tipo.value === "abono" &&
    field.value === "General"
  ) {
    return "La zona seleccionada solo aplica para boleta individual.";
  }

  return "";
};

const setFieldError = (form, field, message) => {
  const wrapper = form.querySelector(`[data-field-wrap="${field.name}"]`);
  const messageElement = form.querySelector(`[data-field-error="${field.name}"]`);

  field.setAttribute("aria-invalid", message ? "true" : "false");
  wrapper?.classList.toggle("is-invalid", Boolean(message));

  if (messageElement) {
    messageElement.innerText = message;
  }
};

const validateTicketForm = (form) => {
  const fields = ticketFieldNames.map((name) => form.elements[name]);
  let firstInvalidField = null;

  fields.forEach((field) => {
    const message = getFieldErrorMessage(field, form);
    setFieldError(form, field, message);

    if (message && !firstInvalidField) {
      firstInvalidField = field;
    }
  });

  if (firstInvalidField) {
    firstInvalidField.focus({ preventScroll: true });
    firstInvalidField.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }

  return true;
};

const clearFieldError = (form, field) => {
  setFieldError(form, field, "");
};

const getTrackingData = () => {
  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term")
  };
};

const isLikelyBotSubmission = (form) => {
  return Boolean(form.elements.website?.value.trim());
};

const buildFormData = (form) => ({
  nombre: form.elements.nombre.value.trim(),
  whatsapp: form.elements.whatsapp.value.trim(),
  zona: form.elements.zona.value,
  email: form.elements.email.value.trim().toLowerCase(),
  tipo: form.elements.tipo.value,
  acepta_tratamiento: form.elements.acepta_tratamiento.checked,
  politica_aceptada_en: new Date().toISOString(),
  origen: "landing_bucaramundial",
  page_url: window.location.href,
  user_agent: navigator.userAgent,
  ...getTrackingData()
});

const saveLead = async (lead) => {
  const supabaseClient = getSupabaseClient();

  if (!supabaseClient) {
    console.info("Supabase no configurado. Se continúa con la compra sin guardar lead.");
    return;
  }

  const { error } = await supabaseClient.from("leads").insert([lead]);

  if (error) {
    console.error("Error al guardar en Supabase:", error.message);
    throw error;
  }
};

const handleTicketPurchase = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;

  if (isLikelyBotSubmission(form)) {
    return;
  }

  if (!validateTicketForm(form)) {
    return;
  }

  const ticketType = form.elements.tipo.value;
  const purchaseUrl = purchaseLinks[ticketType];
  const button = form.querySelector("button[type='submit']");

  if (!purchaseUrl || !button) {
    return;
  }

  const lead = buildFormData(form);
  button.innerText = "PROCESANDO...";
  button.disabled = true;

  try {
    await saveLead(lead);
  } catch (error) {
    console.error("Error de conexión con Supabase:", error);
    button.innerText = "INTENTAR DE NUEVO";
    button.disabled = false;
    window.alert("No pudimos guardar tus datos. Revisa la informacion e intenta de nuevo.");
    return;
  }

  button.innerText = "REDIRECCIONANDO...";

  window.setTimeout(() => {
    window.location.href = purchaseUrl;
  }, 500);
};

document.querySelectorAll("[data-open-modal]").forEach((button) => {
  button.addEventListener("click", () => openModal(button.dataset.openModal));
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.querySelector("[data-mobile-menu-toggle]")?.addEventListener("click", toggleMobileMenu);

document.querySelectorAll("[data-mobile-menu-link]").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

document.querySelectorAll("[data-zone-select]").forEach((link) => {
  link.addEventListener("click", () => {
    selectZone(link.dataset.zoneSelect);
    scrollToRegistration();
  });
});

document.querySelectorAll("[data-ticket-form]").forEach((form) => {
  updateZoneOptions(form);

  ticketFieldNames.forEach((name) => {
    const field = form.elements[name];

    field.addEventListener("input", () => clearFieldError(form, field));
    field.addEventListener("change", () => {
      clearFieldError(form, field);

      if (field.name === "tipo") {
        updateZoneOptions(form);
        clearFieldError(form, form.elements.zona);
      }
    });
  });

  form.addEventListener("submit", handleTicketPurchase);
});

updateEventCountdown();
window.setInterval(updateEventCountdown, 1000);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
    closeMobileMenu();
  }
});

window.addEventListener("resize", () => {
  if (window.matchMedia("(min-width: 1024px)").matches) {
    closeMobileMenu();
  }
});
