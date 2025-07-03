import express from "express";
import { createServer } from "http";
import initMediasoup from "./config/medaisoup";

const app = express();
const server = createServer(app);

initMediasoup();

app.get("/", (req, res) => {
  res.send("Welcome to the Go-Pod backend!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
