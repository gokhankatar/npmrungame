export default defineEventHandler((event) => {
  const config = useRuntimeConfig();

  return {
    email: "npmrungame@gmail.com",
    password: config.adminPassw,
  };
});
