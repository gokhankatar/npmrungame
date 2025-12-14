import nodemailer from "nodemailer";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);
    const { name, email, msg } = body;

    if (!name || !email || !msg) {
        throw createError({
            statusCode: 400,
            statusMessage: "Eksik alan",
        });
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: config.mail,
            pass: config.mail_password,
        },
    });

    await transporter.sendMail({
        from: `"İletişim Formu" <${config.mail}>`,
        to: config.mail,
        replyTo: email,
        subject: `Yeni mesaj: ${name}`,
        html: `
      <b>İsim:</b> ${name}<br/>
      <b>Email:</b> ${email}<br/><br/>
      <b>Mesaj:</b><br/>
      ${msg}
    `,
    });

    return { ok: true };
});
