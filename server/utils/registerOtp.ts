import { createHash, randomInt, randomBytes } from "node:crypto";

type OtpEntry = {
  codeHash: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  sendCount: number;
};

type TicketEntry = {
  email: string;
  expiresAt: number;
};

const CODE_TTL_MS = 10 * 60 * 1000;
const TICKET_TTL_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 45 * 1000;
const MAX_SENDS_PER_HOUR = 8;
const MAX_VERIFY_ATTEMPTS = 6;

const otpStore = new Map<string, OtpEntry>();
const ticketStore = new Map<string, TicketEntry>();

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const hashCode = (email: string, code: string) =>
  createHash("sha256").update(`${email}:${code}`).digest("hex");

export function generateOtpCode() {
  return String(randomInt(100000, 999999));
}

export function canSendRegisterOtp(emailRaw: string) {
  const email = normalizeEmail(emailRaw);
  const now = Date.now();
  const entry = otpStore.get(email);

  if (!entry) return { ok: true as const, email };

  if (now - entry.lastSentAt < RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil(
      (RESEND_COOLDOWN_MS - (now - entry.lastSentAt)) / 1000
    );
    return {
      ok: false as const,
      email,
      reason: `Yeni kod için ${waitSec} sn bekle.`,
      retryAfterSec: waitSec,
    };
  }

  // Saatlik limit — son gönderim penceresi basit tutuldu
  if (entry.sendCount >= MAX_SENDS_PER_HOUR && now - entry.lastSentAt < 3600_000) {
    return {
      ok: false as const,
      email,
      reason: "Çok fazla kod istendi. Bir süre sonra tekrar dene.",
      retryAfterSec: 3600,
    };
  }

  return { ok: true as const, email };
}

export function saveRegisterOtp(emailRaw: string, code: string) {
  const email = normalizeEmail(emailRaw);
  const prev = otpStore.get(email);
  const now = Date.now();
  otpStore.set(email, {
    codeHash: hashCode(email, code),
    expiresAt: now + CODE_TTL_MS,
    attempts: 0,
    lastSentAt: now,
    sendCount: (prev?.sendCount ?? 0) + 1,
  });
}

export function verifyRegisterOtp(emailRaw: string, codeRaw: string) {
  const email = normalizeEmail(emailRaw);
  const code = String(codeRaw || "").trim();
  const entry = otpStore.get(email);
  const now = Date.now();

  if (!entry) {
    return { ok: false as const, reason: "Önce emailine kod gönder." };
  }
  if (entry.expiresAt < now) {
    otpStore.delete(email);
    return { ok: false as const, reason: "Kodun süresi doldu. Yeni kod iste." };
  }
  if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
    otpStore.delete(email);
    return {
      ok: false as const,
      reason: "Çok fazla hatalı deneme. Yeni kod iste.",
    };
  }
  if (!/^\d{6}$/.test(code)) {
    entry.attempts += 1;
    return { ok: false as const, reason: "6 haneli kodu gir." };
  }
  if (entry.codeHash !== hashCode(email, code)) {
    entry.attempts += 1;
    return { ok: false as const, reason: "Kod hatalı." };
  }

  otpStore.delete(email);
  const ticket = randomBytes(24).toString("hex");
  ticketStore.set(ticket, { email, expiresAt: now + TICKET_TTL_MS });
  return { ok: true as const, email, ticket };
}

/** Kayıt öncesi ticket tüket (tek kullanımlık) */
export function consumeRegisterTicket(ticketRaw: string, emailRaw: string) {
  const ticket = String(ticketRaw || "").trim();
  const email = normalizeEmail(emailRaw);
  const entry = ticketStore.get(ticket);
  if (!entry) {
    return { ok: false as const, reason: "Doğrulama geçersiz. Kodu tekrar gir." };
  }
  if (entry.expiresAt < Date.now()) {
    ticketStore.delete(ticket);
    return { ok: false as const, reason: "Doğrulama süresi doldu. Yeni kod iste." };
  }
  if (entry.email !== email) {
    return { ok: false as const, reason: "Email ile doğrulama eşleşmiyor." };
  }
  ticketStore.delete(ticket);
  return { ok: true as const, email };
}
