import { createAppMailer } from "../../utils/mailer";
import {
  canSendRegisterOtp,
  generateOtpCode,
  saveRegisterOtp,
} from "../../utils/registerOtp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();

  if (!EMAIL_RE.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid email",
      data: { message: "Geçerli bir email yaz." },
    });
  }

  const gate = canSendRegisterOtp(email);
  if (!gate.ok) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too many requests",
      data: { message: gate.reason, retryAfterSec: gate.retryAfterSec },
    });
  }

  const code = generateOtpCode();
  saveRegisterOtp(email, code);

  const { transporter, from } = createAppMailer();

  await transporter.sendMail({
    from: `"npmrungame" <${from}>`,
    to: email,
    subject: `${code} — npmrungame kayıt doğrulama kodu`,
    text: `Kayıt doğrulama kodun: ${code}\n\nKod 10 dakika geçerlidir. Bu isteği sen yapmadıysan bu maili yok say.`,
    html: `
  <div style="background:#0b1220;padding:28px;font-family:Arial,sans-serif;color:#e8eef7">
    <div style="max-width:440px;margin:auto;background:#121a2b;border-radius:14px;overflow:hidden;border:1px solid rgba(105,240,174,.25)">
      <div style="padding:18px 22px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#04140c">
        <strong style="font-size:16px">npmrungame · kayıt doğrulama</strong>
      </div>
      <div style="padding:24px 22px">
        <p style="margin:0 0 12px;font-size:14px;color:#cbd5e1">Hesap oluşturmak için doğrulama kodun:</p>
        <p style="margin:0;font-size:32px;letter-spacing:.28em;font-weight:800;color:#69f0ae;text-align:center">${code}</p>
        <p style="margin:18px 0 0;font-size:12px;color:#94a3b8;line-height:1.5">
          Kod <strong>10 dakika</strong> geçerlidir. Bu isteği sen yapmadıysan maili yok say.
        </p>
      </div>
    </div>
  </div>`,
  });

  return {
    ok: true,
    message: "Doğrulama kodu emailine gönderildi.",
    expiresInSec: 600,
  };
});
