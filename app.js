// import express module
import express from "express";

// create an instance of express app
const app = express();

// Middleware for parse body of http request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// example route
app.get("/", (req, res) => {
  res.send("Hello, world from Express!");
});

// Route with parameters
app.get("/greeting/:name", (req, res) => {
  const name = req.params.name;
  res.send(`¡Hello, ${name}!`);
});

// Middleware for handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong with the server");
});

// Port where server will execute
const PORT = process.env.PORT || 3000;

// Start server and listening to the specific port
app.listen(PORT, () => {
  console.log(`Express server listening to port ${PORT}`);
});
