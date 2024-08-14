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
    signup: {
      windowMs: parseInt(process.env.RATE_LIMIT_SIGNUP_WINDOW_MS, 10) || 60000, 
      maxRequests: parseInt(process.env.RATE_LIMIT_SIGNUP_MAX_REQUESTS, 10) || 10, 
    },
    login: {
      windowMs: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW_MS, 10) || 60000, 
      maxRequests: parseInt(process.env.RATE_LIMIT_LOGIN_MAX_REQUESTS, 10) || 5, 
    },
    general: {
      windowMs: parseInt(process.env.RATE_LIMIT_GENERAL_WINDOW_MS, 10) || 60000, 
      maxRequests: parseInt(process.env.RATE_LIMIT_GENERAL_MAX_REQUESTS, 10) || 100, 
    },
  },
  defaultAdmin: {
    name: process.env.DEFAULT_ADMIN_NAME,
    rut: process.env.DEFAULT_ADMIN_RUT,
    email: process.env.DEFAULT_ADMIN_EMAIL,
    password: process.env.DEFAULT_ADMIN_PASSWORD,
  },
});
