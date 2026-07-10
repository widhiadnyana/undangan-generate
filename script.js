const STORAGE_KEY = "undangan-generator-state";

const baseUrlInput = document.querySelector("#baseUrl");
const namesInput = document.querySelector("#namesInput");
const messageTemplateInput = document.querySelector("#messageTemplate");
const generateButton = document.querySelector("#generateButton");
const resetButton = document.querySelector("#resetButton");
const resultBody = document.querySelector("#resultBody");
const countBadge = document.querySelector("#countBadge");

const DEFAULT_MESSAGE_TEMPLATE = `Kepada Yth.
Bapak/Ibu/Saudara/i {nama}

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.

Berikut link undangan kami:
{link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Terima kasih.`;

let generatedInvitations = [];

function normalizeBaseUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "https://asd.com/pernikahan/";
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function encodeNameForInvitation(name) {
  return encodeURIComponent(name.trim().replace(/\s+/g, " ")).replaceAll("%20", "+");
}

function buildInvitationUrl(baseUrl, name) {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}to=${encodeNameForInvitation(name)}`;
}

function buildWhatsAppUrl(invitation) {
  const template = messageTemplateInput.value.trim() || DEFAULT_MESSAGE_TEMPLATE;
  const message = template.replaceAll("{nama}", invitation.name).replaceAll("{link}", invitation.url);
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

function parseNames(value) {
  const seen = new Set();

  return value
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean)
    .filter((name) => {
      const key = name.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

function saveState() {
  const state = {
    baseUrl: baseUrlInput.value,
    namesInput: namesInput.value,
    messageTemplate: messageTemplateInput.value,
    generatedInvitations,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const rawState = sessionStorage.getItem(STORAGE_KEY);
  if (!rawState) {
    return;
  }

  try {
    const state = JSON.parse(rawState);
    baseUrlInput.value = state.baseUrl || baseUrlInput.value;
    namesInput.value = state.namesInput || "";
    messageTemplateInput.value = state.messageTemplate || DEFAULT_MESSAGE_TEMPLATE;
    generatedInvitations = Array.isArray(state.generatedInvitations) ? state.generatedInvitations : [];
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

function renderResults() {
  countBadge.textContent = `${generatedInvitations.length} nama`;

  if (generatedInvitations.length === 0) {
    resultBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="4">Belum ada link. Masukkan nama lalu klik Generate.</td>
      </tr>
    `;
    return;
  }

  resultBody.innerHTML = generatedInvitations
    .map((invitation, index) => {
      const waUrl = buildWhatsAppUrl(invitation);

      return `
        <tr>
          <td data-label="No">${index + 1}</td>
          <td data-label="Nama">${escapeHtml(invitation.name)}</td>
          <td class="link-cell" data-label="Link">
            <a href="${escapeAttribute(invitation.url)}" target="_blank" rel="noopener noreferrer">
              ${escapeHtml(invitation.url)}
            </a>
          </td>
          <td data-label="Aksi">
            <a class="share-button" href="${escapeAttribute(waUrl)}" target="_blank" rel="noopener noreferrer">
              Share via WA
            </a>
          </td>
        </tr>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

generateButton.addEventListener("click", () => {
  const baseUrl = normalizeBaseUrl(baseUrlInput.value);
  const names = parseNames(namesInput.value);

  baseUrlInput.value = baseUrl;
  generatedInvitations = names.map((name) => ({
    name,
    url: buildInvitationUrl(baseUrl, name),
  }));

  renderResults();
  saveState();
});

resetButton.addEventListener("click", () => {
  namesInput.value = "";
  generatedInvitations = [];
  renderResults();
  saveState();
});

baseUrlInput.addEventListener("input", saveState);
namesInput.addEventListener("input", saveState);
messageTemplateInput.addEventListener("input", () => {
  renderResults();
  saveState();
});

messageTemplateInput.value = DEFAULT_MESSAGE_TEMPLATE;
loadState();
renderResults();
