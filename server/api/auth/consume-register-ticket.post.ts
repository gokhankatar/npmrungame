import { consumeRegisterTicket } from "../../utils/registerOtp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Firebase createUser öncesi ticket’ı tek kullanımlık tüket */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();
  const ticket = String(body?.ticket ?? "").trim();

  if (!EMAIL_RE.test(email) || !ticket) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing fields",
      data: { message: "Email doğrulaması gerekli." },
    });
  }

  const result = consumeRegisterTicket(ticket, email);
  if (!result.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid ticket",
      data: { message: result.reason },
    });
  }

  return { ok: true, email: result.email };
});
