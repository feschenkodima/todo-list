const http = require("http");
const express = require("express");
const app = require("./app");
const cors = require("cors");
const jsonParser = express.json();
const jwt = require("jsonwebtoken");
const server = http.createServer(app);
const { MongoClient, ObjectId } = require("mongodb");
const tokenKey = "1a2b-3c4d-5e6f-7g8h";

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;
const client = new MongoClient(
  "mongodb+srv://FeshchenkoDmytro:dimassikdimka31081995@cluster0.ojfoq.mongodb.net/mongo?retryWrites=true&w=majority"
);
const users = client.db().collection("users");
const tasks = client.db().collection("tasks");
app.use(cors());

const start = async () => {
  try {
    await client.connect();
    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
  }
};
start();

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

app.get("/", function (req, res) {
  res.sendFile("index.html");
});
//sign in and sign up requests============

app.post("/api/login", jsonParser, async (req, res) => {
  const user = await users.findOne({
    email: req.body.email,
    password: req.body.password,
  });
  if (user) {
    return res.status(200).json({
      id: user._id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      token: jwt.sign({ id: user._id }, tokenKey),
    });
  } else {
    return res.status(400).json({ message: "User not found" });
  }
});

const addNewUser = async (obj) => {
  await users.insertOne(obj);
};

app.post("/api/signup", jsonParser, async (req, res) => {
  const usersEmail = await users.findOne({ email: req.body.email });
  const usersName = await users.findOne({ name: req.body.name });
  if (usersEmail) {
    return res.status(404).json({ message: "This email exists" });
  }
  if (usersName) {
    return res.status(404).json({ message: "This name exists" });
  }
  if (!req.body) {
    return res.status(400).json({ message: "No data. Fill all field" });
  }
  if (!req.body.password || !req.body.name || !req.body.email) {
    return res.status(400).json({ message: "Fill all field" });
  }

  if (!usersEmail && !usersName) {
    addNewUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      isAdmin: req.body.password == "admin" ? true : false,
    });
    return res.status(200).json({ message: "Sign up is success, thanks, " });
  }
});

//get cards============

app.get(`/api/cards/:name`, jsonParser, async (req, res, next) => {
  const cardsByName = await tasks.find({ name: req.params.name }).toArray();
  if (cardsByName) {
    return res.status(200).json(cardsByName);
  } else {
    return res.status(400).send({ message: "no items" });
  }
});

//add card==========

app.post(`/api/addCard`, jsonParser, async (req, res, next) => {
  if (!req.body.title) {
    return res.status(400).json({ message: "Fill name of task" });
  }
  if (!req.body.description) {
    return res.status(400).json({ message: "Fill description of task" });
  }
  if (!req.body.name) {
    return res.status(400).json({ message: "No user" });
  }
  const newCard = await tasks.insertOne({
    name: req.body.name,
    title: req.body.title,
    description: req.body.description,
    checked: false,
  });
  if (newCard) {
    const addedCard = await tasks.findOne({
      name: req.body.name,
      title: req.body.title,
      description: req.body.description,
    });
    if (addedCard == null) {
      return res.status(400).json({ message: "Failed to create task" });
    }
    return res.status(200).json(addedCard);
  } else {
    return res.status(400).json({ message: "Failed to create task" });
  }
});

//add cart to confirmed=========
app.put(`/api/editCard/:id`, jsonParser, async (req, res) => {
  const id = req.params.id;
  const isChecked = req.body.checked;
  let filter = { _id: ObjectId(`${id}`) };
  let update = { checked: isChecked };
  const taskForUpdate = await tasks.findOne(filter);

  if (taskForUpdate) {
    await tasks.updateOne(filter, { $set: update }, { upsert: true });
    return res.status(200).json({ message: "Done :)" });
  } else {
    return res.status(400).json({ message: "There is no such task" });
  }
});

//delete card===============

app.delete(`/api/card/delete/:id`, jsonParser, async (req, res, next) => {
  const id = req.params.id;

  const taskForDelete = await tasks.findOne({ _id: ObjectId(`${id}`) });

  if (taskForDelete) {
    await tasks.deleteOne(taskForDelete);
    return res.status(200).json({ message: "Removal successful" });
  } else {
    return res.status(400).json({ message: "There is no such task" });
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
