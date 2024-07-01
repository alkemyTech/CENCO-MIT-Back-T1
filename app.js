import express from "express";
import router from "./routes/index.js";
import { rateLimit } from "express-rate-limit";
import { authenticate } from "./database/authenticate.js";
import { PORT } from "./config/config.js";

const limiter = rateLimit({
  windowMs: 5 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const app = express();
const port = PORT || 3000;

app.use(express.json());
app.use(limiter);

app.use("/", router);

app.listen(port, () => {
  authenticate();
  console.log(`Server listening on port ${port}`);
});
