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

const getSupabaseClient = () => {
  if (!window.supabase || SUPABASE_ANON_KEY === "TU_ANON_KEY_AQUI") {
    return null;
  }

  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
};

const scrollToRegistration = () => {
  document.getElementById("registro")?.scrollIntoView({ behavior: "smooth" });
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
    }, 2000);
  }, 500);
};

document.querySelectorAll("[data-open-modal]").forEach((button) => {
  button.addEventListener("click", () => openModal(button.dataset.openModal));
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.querySelectorAll("[data-zone-select]").forEach((link) => {
  link.addEventListener("click", () => {
    selectZone(link.dataset.zoneSelect);
    scrollToRegistration();
  });
});

document.querySelectorAll("[data-ticket-form]").forEach((form) => {
  updateZoneOptions(form);
  form.elements.tipo.addEventListener("change", () => updateZoneOptions(form));
  form.addEventListener("submit", handleTicketPurchase);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});
