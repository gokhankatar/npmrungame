import nodemailer from "nodemailer";

export function createAppMailer() {
  const config = useRuntimeConfig();
  const user = String(config.mail || "").trim();
  const pass = String(config.mail_password || "").trim();

  if (!user || !pass) {
    throw createError({
      statusCode: 500,
      statusMessage: "Mail is not configured",
      data: { message: "Sunucu mail ayarları eksik." },
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return { transporter, from: user };
}
