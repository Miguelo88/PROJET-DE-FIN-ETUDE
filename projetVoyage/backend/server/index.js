const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/test", (req, res) => {
  res.json({ message: "Backend OK" });
});

app.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000");
});