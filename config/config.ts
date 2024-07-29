export default () => ({
  jwtSecret: process.env.JWT_SECRET,
  database: {
    host: process.env.HOST,
    port: parseInt(process.env.PORT, 10),
    name: process.env.DATABASE,
    username: process.env.USERNAMEDB,
    password: process.env.PASSWORD,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 5,
  },
  defaultAdmin: {
    name: process.env.DEFAULT_ADMIN_NAME,
    rut: process.env.DEFAULT_ADMIN_RUT,
    email: process.env.DEFAULT_ADMIN_EMAIL,
    password: process.env.DEFAULT_ADMIN_PASSWORD,
  },
});
