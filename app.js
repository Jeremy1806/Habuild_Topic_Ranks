const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const {
  login,
  signup,
  isAuthenticated,
} = require("./controllers/authController");
const { getTopics, createTopic } = require("./controllers/topicController");

const app = express();

// Middlewares

app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

app.post("/login", login);
app.post("/signup", signup);
app.get("/", isAuthenticated, getTopics);
app.post("/", isAuthenticated, createTopic);

// Invalid Routes
app.all("*", (req, res, next) => {
  return res.status(404).json({
    status: "failed",
    message: "invalid route",
  });
});

module.exports = app;
