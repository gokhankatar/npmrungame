import { verifyRegisterOtp } from "../../utils/registerOtp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();
  const code = String(body?.code ?? "").trim();

  if (!EMAIL_RE.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid email",
      data: { message: "Geçerli bir email yaz." },
    });
  }

  const result = verifyRegisterOtp(email, code);
  if (!result.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid code",
      data: { message: result.reason },
    });
  }

  return {
    ok: true,
    ticket: result.ticket,
    email: result.email,
  };
});
