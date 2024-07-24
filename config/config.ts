export default () => ({
  jwtSecret: process.env.JWT_SECRET,
  database: {
    host: process.env.HOST,
    port: parseInt(process.env.PORT, 10),
    name: process.env.DATABASE,
    username: process.env.USERNAMEDB,
    password: process.env.PASSWORD,
  },
});
