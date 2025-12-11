export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { rememberMe } = body;

  if (rememberMe) {
    setCookie(event, "rememberAdmin", "true", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  } else {
    deleteCookie(event, "rememberAdmin");
  }

  return { ok: true };
});
