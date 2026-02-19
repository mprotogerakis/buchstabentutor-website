const MAX_NAME = 100;
const MAX_EMAIL = 200;
const MAX_MESSAGE = 5000;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function redirectBack(request, status) {
  const url = new URL(request.url);
  url.pathname = "/kontakt/";
  url.search = `?status=${encodeURIComponent(status)}`;
  return Response.redirect(url.toString(), 303);
}

function sanitize(input) {
  return String(input || "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendViaResend(env, { name, email, message, requestUrl }) {
  const apiKey = env.RESEND_API_KEY;
  const to = env.CONTACT_TO_EMAIL;
  const from = env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    throw new Error("Kontaktdienst ist nicht vollständig konfiguriert.");
  }

  const subject = `Kontaktanfrage Buchstabentutor von ${name}`;
  const text = [
    "Neue Kontaktanfrage über www.buchstabentutor.de",
    "",
    `Name: ${name}`,
    `E-Mail: ${email}`,
    `Quelle: ${requestUrl}`,
    "",
    "Nachricht:",
    message,
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error("Kontaktanfrage konnte nicht zugestellt werden.");
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const accept = request.headers.get("accept") || "";
  const wantsJson = accept.includes("application/json");

  const okResponse = () => (wantsJson ? json({ ok: true }) : redirectBack(request, "ok"));
  const errorResponse = (message, statusCode) =>
    wantsJson ? json({ error: message }, statusCode) : redirectBack(request, "error");

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Ungültige Anfrage.", 400);
  }

  const website = sanitize(formData.get("website"));
  if (website) {
    return okResponse();
  }

  const name = sanitize(formData.get("name"));
  const email = sanitize(formData.get("email"));
  const message = sanitize(formData.get("message"));

  if (!name || !email || !message) {
    return errorResponse("Bitte alle Pflichtfelder ausfüllen.", 400);
  }

  if (name.length > MAX_NAME || email.length > MAX_EMAIL || message.length > MAX_MESSAGE) {
    return errorResponse("Eingaben sind zu lang.", 400);
  }

  if (!isValidEmail(email)) {
    return errorResponse("Bitte gültige E-Mail-Adresse angeben.", 400);
  }

  try {
    await sendViaResend(env, {
      name,
      email,
      message,
      requestUrl: request.url,
    });
    return okResponse();
  } catch (error) {
    console.error("contact-submit-error", error);
    return errorResponse(
      "Senden derzeit nicht möglich. Bitte nutze lernapps@icloud.com als Alternative.",
      503,
    );
  }
}
