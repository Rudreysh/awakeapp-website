const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_DETAILS_LENGTH = 2000;

function readText(value, maxLength = 200) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  const body = request.body || {};
  // Bots often fill invisible fields that people never see.
  if (readText(body.website)) {
    return response.status(200).json({ ok: true });
  }

  const name = readText(body.name);
  const email = readText(body.email).toLowerCase();
  const interest = readText(body.interest);
  const details = readText(body.details, MAX_DETAILS_LENGTH);

  if (!name || !EMAIL_PATTERN.test(email) || !interest) {
    return response.status(400).json({ error: "Enter your name, email, and interest." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.WAITLIST_FROM;
  const recipient = process.env.WAITLIST_RECIPIENT || "info@awakeapp.net";

  if (!apiKey || !from) {
    return response.status(503).json({
      error: "Waitlist signups are not configured yet. Please try again soon.",
    });
  }

  const emailBody = [
    "New Awake pre-launch signup",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Interest: ${interest}`,
    details ? `Details: ${details}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        reply_to: email,
        subject: `[Awake] ${interest} - ${name}`,
        text: emailBody,
      }),
    });

    if (!resendResponse.ok) {
      console.error("Resend could not deliver the waitlist email.", await resendResponse.text());
      return response.status(502).json({ error: "We could not save your signup. Please try again." });
    }
  } catch (error) {
    console.error("Waitlist delivery failed.", error);
    return response.status(502).json({ error: "We could not save your signup. Please try again." });
  }

  return response.status(200).json({ ok: true });
}
