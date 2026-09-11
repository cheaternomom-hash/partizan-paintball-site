const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-nav");
const year = document.querySelector("[data-year]");
const bookingForm = document.querySelector("[data-booking-form]");
const bookingResult = document.querySelector("[data-booking-result]");
const bookingSummary = document.querySelector("[data-booking-summary]");
const smsLink = document.querySelector("[data-sms-link]");
const copyButton = document.querySelector("[data-copy-booking]");
const copyStatus = document.querySelector("[data-copy-status]");
const dateInput = document.querySelector("#booking-date");

if (year) year.textContent = String(new Date().getFullYear());

if (dateInput) {
  const localToday = new Date();
  localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset());
  dateInput.min = localToday.toISOString().slice(0, 10);
}

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuButton?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navigation?.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLAnchorElement)) return;
  document.body.classList.remove("nav-open");
  menuButton?.setAttribute("aria-expanded", "false");
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  document.body.classList.remove("nav-open");
  menuButton?.setAttribute("aria-expanded", "false");
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const updateVideos = () => {
  document.querySelectorAll(".scene-video").forEach((video) => {
    if (!(video instanceof HTMLVideoElement)) return;
    if (reducedMotion.matches) {
      video.pause();
    } else {
      video.play().catch(() => {
        // The poster remains visible when a browser blocks autoplay.
      });
    }
  });
};

updateVideos();
reducedMotion.addEventListener?.("change", updateVideos);

let preparedMessage = "";

const formatBookingDate = (value) => {
  if (!value) return "не указана";
  const [yearValue, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(yearValue, month - 1, day));
};

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const temporary = document.createElement("textarea");
  temporary.value = text;
  temporary.setAttribute("readonly", "");
  temporary.style.position = "fixed";
  temporary.style.opacity = "0";
  document.body.appendChild(temporary);
  temporary.select();
  document.execCommand("copy");
  temporary.remove();
};

bookingForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!(bookingForm instanceof HTMLFormElement) || !bookingForm.reportValidity()) return;

  const data = new FormData(bookingForm);
  const name = String(data.get("name") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const date = formatBookingDate(String(data.get("date") || ""));
  const time = String(data.get("time") || "").trim();
  const guests = String(data.get("guests") || "").trim();
  const occasion = String(data.get("event") || "").trim();
  const comment = String(data.get("comment") || "").trim();

  preparedMessage = [
    "Здравствуйте! Хочу забронировать игру в клубе ПАРТИЗАН.",
    "",
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    `Дата: ${date}`,
    `Время: ${time}`,
    `Участников: ${guests}`,
    `Повод: ${occasion}`,
    comment ? `Комментарий: ${comment}` : "",
  ].filter(Boolean).join("\n");

  const isAppleMobile = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isAppleMobile ? "&" : "?";
  const smsHref = `sms:+79808007555${separator}body=${encodeURIComponent(preparedMessage)}`;

  if (bookingSummary) bookingSummary.textContent = preparedMessage;
  if (smsLink instanceof HTMLAnchorElement) smsLink.href = smsHref;
  if (bookingResult instanceof HTMLElement) {
    bookingResult.hidden = false;
    bookingResult.focus({ preventScroll: true });
  }

  try {
    await copyText(preparedMessage);
    if (copyStatus) copyStatus.textContent = "Текст заявки скопирован.";
  } catch {
    if (copyStatus) copyStatus.textContent = "Если SMS не открылось, скопируйте текст заявки вручную.";
  }

  if (/Android|iPad|iPhone|iPod/i.test(navigator.userAgent)) {
    window.location.href = smsHref;
  } else {
    bookingResult?.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "nearest" });
  }
});

copyButton?.addEventListener("click", async () => {
  if (!preparedMessage) return;
  try {
    await copyText(preparedMessage);
    if (copyStatus) copyStatus.textContent = "Текст заявки скопирован.";
  } catch {
    if (copyStatus) copyStatus.textContent = "Не удалось скопировать автоматически. Выделите текст выше.";
  }
});
