const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

const userRoutes = require("./routes/userRoutes");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "admin.html"));
});

app.get("/user", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "user.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "login.html"));
});

app.get("/cadastro", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "cadastro.html"));
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", userRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});