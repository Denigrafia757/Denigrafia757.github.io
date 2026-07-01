const header = document.querySelector("[data-header]");
const form = document.querySelector("[data-form]");
const status = document.querySelector("[data-status]");
const telegramUrl = "https://t.me/businessfinlib";

// --- Настройка доставки заявок в Telegram ---
// 1) Откройте Telegram, найдите @BotFather, отправьте команду /newbot
//    и следуйте подсказкам. В конце он даст токен вида 123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// 2) Впишите этот токен ниже вместо BOT_TOKEN.
// 3) Напишите своему новому боту любое сообщение (например "привет"),
//    затем откройте в браузере:
//    https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates
//    Там будет видно поле "chat":{"id":XXXXXXXXX, ...} — это и есть ваш CHAT_ID.
// 4) Впишите его ниже вместо CHAT_ID.
const BOT_TOKEN = "8987508505:AAEKQr44_PDoJT24Td9xfsdwKK4-skDn3vA";
const CHAT_ID = "8378628764";

const syncHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const service = String(formData.get("service") || "").trim();
  const message = String(formData.get("message") || "").trim();

  const text = [
    "Новая заявка с сайта Домстрой",
    `Имя: ${name || "—"}`,
    `Телефон: ${phone || "—"}`,
    `Услуга: ${service || "—"}`,
    message ? `Комментарий: ${message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const isConfigured = BOT_TOKEN !== "BOT_TOKEN" && CHAT_ID !== "CHAT_ID";

  if (isConfigured) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: CHAT_ID, text }),
        },
      );

      if (!response.ok) {
        throw new Error("Telegram API error");
      }

      status.textContent = `${name || "Спасибо"}! Заявка отправлена, скоро свяжемся.`;
      form.reset();
      return;
    } catch (error) {
      status.textContent = "Не получилось отправить автоматически, открываем Telegram для связи напрямую.";
    }
  } else {
    status.textContent = `${name || "Спасибо"}! Открываем Telegram для отправки заявки по направлению «${service || "Дом под ключ"}».`;
  }

  form.reset();
  window.location.assign(telegramUrl);
});
