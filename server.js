const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");

const PAGES = path.join(__dirname, "public", "pages");

app.get("/", (req, res) => res.sendFile(path.join(PAGES, "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(PAGES, "login.html")));
app.get("/cadastro", (req, res) => res.sendFile(path.join(PAGES, "cadastro.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(PAGES, "admin.html")));
app.get("/user", (req, res) => res.sendFile(path.join(PAGES, "user.html")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
