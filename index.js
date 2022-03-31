const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const req = require("express/lib/request");
const jsonParser = express.json();
const fs = require("fs");
const { json } = require("body-parser");

app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, PATCH, PUT, POST, DELETE, OPTIONS"
  );
  next();
});

app.get("/api/categories", (req, res, next) => {
  const categories = require("./categories");
  const categoryArr = categories["categories"];
  res.json(categoryArr);
});
app.get(`/api/categories/:id/products`, (req, res, next) => {
  const products = require("./products.json");
  const id = req.params.id;
  const productsAll = products["products"];
  const productsByCategoryId = productsAll.filter(
    (item) => item.categoryId == id
  );
  res.json(productsByCategoryId);
});

app.get(`/api/categories/:id/products/:productId`, (req, res, next) => {
  const products = require("./products.json");
  const productId = req.params.productId;
  const id = req.params.id;
  const productsAll = products["products"];
  const productById = productsAll.find(
    (item) => item.id == productId && item.categoryId == id
  );
  res.json(productById);
});

app.get("/api/login", (req, res, next) => {
  const user = require("./users.json");
  user["users"].push({
    login: "hello",
    isAdmin: false,
    email: "email@email.com",
    userId: user["users"].length + 1,
    password: "hahaha",
  });
  res.json(user["users"]);
});

app.post("/api/login", jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
  const user = require("./users.json")["users"];
  let email = req.body.email;
  let password = req.body.password;

  const isUser = user.find(
    (item) => item.email === email && item.password === password
  );
  res.json(isUser);
});
app.post("/api/signup", jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
  if (!req.body.password && !req.body.login && !req.body.email)
    return res.send("Fill all inputs");
  const users = require("./users.json")["users"];
  users.push({ ...req.body, isAdmin: false, userId: users.length + 1 });
  res.json(users);
  const usersJson = JSON.stringify(users);
  fs.writeFileSync("./users.json", usersJson);
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
