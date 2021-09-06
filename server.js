const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// const logger = require('morgan')

const app = express();
const dbConfig = require("./config/secret");

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE,OPTION"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization,Origin,X-Requested-With,Accept"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});
// app.use(logger('dev'));
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const auth = require("./routes/authRoutes");

app.use("/api/Task-Manager", auth);

app.listen(3000, () => {
  console.log("db connected");
});
