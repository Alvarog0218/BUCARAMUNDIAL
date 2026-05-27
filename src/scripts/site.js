const SUPABASE_URL =
  import.meta.env.PUBLIC_SUPABASE_URL || "https://wiyoiuijzpskryxmdqzo.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "TU_ANON_KEY_AQUI";

const purchaseLinks = {
  individual: "https://quickticket.co/event/5c21b87b-f95c-4b9b-b214-0f282c05e20d",
  abono: "https://quickticket.co/event/9e5d27cf-c051-48eb-9f29-c6271ea23684"
};

const purchaseButtonLabels = {
  individual: "Ir a comprar boleta",
  abono: "Ir a comprar abono"
};

const eventStartDate = new Date("2026-06-18T02:00:00Z");

const formatCountdownUnit = (value, singular, plural) =>
  `${String(value).padStart(2, "0")} ${value === 1 ? singular : plural}`;

const updateEventCountdown = () => {
  const countdownElement = document.querySelector("[data-event-countdown]");

  if (!countdownElement) {
    return;
  }

  const diff = eventStartDate.getTime() - Date.now();

  if (diff <= 0) {
    countdownElement.innerText = "BUCARA ES MUNDIAL YA ESTA EN VIVO";
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countdownElement.innerText = `FALTAN ${formatCountdownUnit(days, "DIA", "DIAS")} ${formatCountdownUnit(hours, "HORA", "HORAS")} ${formatCountdownUnit(minutes, "MIN", "MIN")} ${formatCountdownUnit(seconds, "SEG", "SEG")}`;
};

const getSupabaseClient = () => {
  if (!window.supabase || SUPABASE_ANON_KEY === "TU_ANON_KEY_AQUI") {
    return null;
  }

  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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

const getFieldErrorMessage = (field, form) => {
  if (field.name === "zona" && field.disabled) {
    return "Selecciona primero el tipo de compra.";
  }

  if (!field.value.trim()) {
    return "Este campo es obligatorio.";
  }

  if (field.type === "email" && !field.validity.valid) {
    return "Ingresa un correo valido.";
  }

  if (field.name === "whatsapp" && field.value.trim().length < 7) {
    return "Ingresa un telefono valido.";
  }

  if (field.name === "zona" && form.elements.tipo.value === "abono" && field.value === "General") {
    return "La zona BIO solo aplica para boleta individual.";
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
  const fields = ["nombre", "whatsapp", "email", "tipo", "zona"].map((name) => form.elements[name]);
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

const buildFormData = (form) => ({
  nombre: form.elements.nombre.value,
  whatsapp: form.elements.whatsapp.value,
  zona: form.elements.zona.value,
  email: form.elements.email.value,
  tipo: form.elements.tipo.value
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
  }
};

const handleTicketPurchase = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;

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
  }

  button.innerText = "REDIRECCIONANDO...";

  window.setTimeout(() => {
    window.open(purchaseUrl, "_blank", "noopener,noreferrer");
    button.innerText = "¡GRACIAS!";

    window.setTimeout(() => {
      form.reset();
      button.disabled = false;
      updateZoneOptions(form);
      ["nombre", "whatsapp", "email", "tipo", "zona"].forEach((name) => {
        clearFieldError(form, form.elements[name]);
      });
    }, 2000);
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

  ["nombre", "whatsapp", "email", "tipo", "zona"].forEach((name) => {
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
