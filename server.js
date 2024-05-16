const express = require("express");
const app = express();
const PORT = 8000;
const mongoose = require("mongoose");
const ProductRoutes = require("./routes/ProductRoutes");
const CategoryRoutes = require("./routes/CategoryRoutes");
const AuthRoutes = require("./routes/AuthRoutes");
const UserRoutes = require("./routes/UserRoutes");

require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/products", ProductRoutes);
app.use("/categories", CategoryRoutes);
app.use("/auth", AuthRoutes);
app.use("/users", UserRoutes);

const connectionUri = process.env.MONGO_CONNECTION_URI;
mongoose
  .connect(connectionUri)
  .then(() => {
    app.listen(PORT, () => {
      console.log("server is listening at port : ", PORT);
    });
  })
  .catch((err) => {
    console.log("mongodb connection failed");
  });
