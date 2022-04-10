const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const jsonParser = express.json();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const users = require("./users.json");
const categories = require("./categories.json");
const products = require("./products.json");
const tokenKey = "1a2b-3c4d-5e6f-7g8h";

app.use((req, res, next) => {
  if (req.headers.authorization) {
    jwt.verify(
      req.headers.authorization.split(" ")[1],
      tokenKey,
      (err, payload) => {
        if (err) next();
        else if (payload) {
          for (let user of users) {
            if (user.id === payload.id) {
              req.user = user;
              next();
            }
          }
          if (!req.user) next();
        }
      }
    );
  }

  next();
});

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

//GET REQESTS=========================

app.get("/api/categories", (req, res, next) => {
  res.json(categories);
});
app.get(`/api/categories/:id`, (req, res, next) => {
  const id = req.params.id;
  const categoryById = categories.find((category) => category.id == id);
  res.json(categoryById);
});
app.get(`/api/categories/:id/products`, (req, res, next) => {
  const id = req.params.id;
  const productsByCategoryId = products.filter((item) => item.categoryId == id);
  res.json(productsByCategoryId);
});
app.get(`/api/products`, (req, res, next) => {
  res.json(products);
});
app.get(`/api/categories/:id/products/:productId`, (req, res, next) => {
  const productId = req.params.productId;
  const id = req.params.id;
  const productById = products.find(
    (item) => item.id == productId && item.categoryId == id
  );
  res.json(productById);
});

//POST REQUESTS==============================

app.post("/api/login", jsonParser, (req, res) => {
  for (let user of users) {
    if (req.body.email == user.email && req.body.password === user.password) {
      return res.status(200).json({
        id: user.userId,
        login: user.login,
        email: user.email,
        isAdmin: user.isAdmin,
        token: jwt.sign({ id: user.id }, tokenKey),
      });
    }
  }

  return res.status(404).json({ message: "User not found" });
});
app.post("/api/signup", jsonParser, (req, res) => {
  for (let user of users) {
    if (req.body.email == user.email) {
      return res.send("This user email exists");
    }
    if (req.body.login == user.login) {
      return res.send("This user login exists");
    }
  }
  if (!req.body) return res.sendStatus(400);
  if (!req.body.password && !req.body.login && !req.body.email)
    return res.send("Fill all inputs");
  users.push({ ...req.body, isAdmin: false, userId: users.length + 1 });
  res.json({ message: "Sign up is success" });
  const usersJson = JSON.stringify(users);
  fs.writeFileSync("./users.json", usersJson);
});

app.post("/api/admin/category", jsonParser, (req, res) => {
  for (let category of categories) {
    if (req.body.name == category.name) {
      return res.json({ message: "This name exists in other category" });
    }
    if (req.body.imageSrc == category.imageSrc) {
      return res.json({ message: "This image exists in other category" });
    }
  }
  if (!req.body) return res.sendStatus(400);
  if (!req.body.name && !req.body.description && !req.body.imageSrc)
    return res.send("Fill all inputs");
  categories.push({ id: categories.length, ...req.body });
  res.json({ message: "category successful added" });
  const categoriesJson = JSON.stringify(categories);
  fs.writeFileSync("./categories.json", categoriesJson);
});
app.post("/api/admin/product", jsonParser, (req, res) => {
  for (let product of products) {
    if (req.body.name == product.name) {
      return res.json({ message: "this product name exists" });
    }
    if (req.body.articul == product.articul) {
      return res.json({ message: "this product articul exists" });
    }
    if (req.body.imageUrls == product.imageUrls) {
      return res.json({ message: "this product imageUrls exists" });
    }
  }
  if (!req.body) return res.sendStatus(400);
  if (
    !req.body.name &&
    !req.body.description &&
    !req.body.imageUrls &&
    !req.body.type &&
    !req.body.categoryId &&
    !req.body.articul &&
    !req.body.price &&
    !req.body.ingridients
  )
    return res.send("Fill all inputs");
  products.push({ id: products.length, currency: "USD", ...req.body });
  res.json({ message: "product successful added" });
  const productsJson = JSON.stringify(products);
  fs.writeFileSync("./products.json", productsJson);
});

//DELETE REQUESTS========================

app.delete(`/api/admin/category/delete/:id`, jsonParser, (req, res) => {
  const id = req.params.id;
  const elemById = categories.some((item) => item.id == id);

  if (!elemById) {
    res.status(400).json({ message: "No category by this ID" });
  } else {
    const filteredCategories = categories.findIndex(
      (category) => category.id == id
    );
    categories.splice(filteredCategories, 1);
    res.json({ message: "Category deleted" });
    const categoriesJson = JSON.stringify(categories);
    fs.writeFileSync("./categories.json", categoriesJson);
  }
});

app.delete(`/api/admin/product/delete/:id`, jsonParser, (req, res) => {
  const id = req.params.id;
  const elemById = products.some((item) => item.id == id);

  if (!elemById) {
    res.status(400).json({ message: "No product by this ID" });
  } else {
    const filteredProducts = products.findIndex((product) => product.id == id);
    products.splice(filteredProducts, 1);
    res.json({ message: "Product deleted" });
    const productsJson = JSON.stringify(products);
    fs.writeFileSync("./products.json", productsJson);
  }
});

//PUT REQUESTS=========================

app.put(`/api/admin/category/edit/:id`, jsonParser, (req, res) => {
  const id = req.params.id;
  const isElementById = categories.some((item) => item.id == id);
  if (!req.body) return res.status(400).json({ message: "Incorrect request" });
  if (!isElementById) {
    return res.status(400).json({ message: "No category by this ID" });
  } else {
    const categoriesArr = categories.map((item) => {
      if (item.id == id) {
        item.name = req.body.name;
        item.description = req.body.description;
        item.imageSrc = req.body.imageSrc;
      }
      return item;
    });
    res.json({ message: "Category edited" });
    const categoriesJson = JSON.stringify(categoriesArr);
    fs.writeFileSync("./categories.json", categoriesJson);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
