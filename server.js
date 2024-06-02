const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const ProductRouter = require("./routes/ProductRouter");
const CategoryRouter = require("./routes/CategoryRouter");
const AuthRouter = require("./routes/AuthRouter");
const UserRouter = require("./routes/UserRouter");
const OrderRouter = require("./routes/OrderRouter");

require("dotenv").config();

const PORT = process.env.PORT || 8000;

app.use(cors())
app.use(express.json({limit : "50mb"}));
app.use(express.urlencoded({ extended: true }));

//Router
app.use("/products", ProductRouter);
app.use("/categories", CategoryRouter);
app.use("/auth", AuthRouter);
app.use("/users", UserRouter);
app.use("/orders" , OrderRouter)

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
