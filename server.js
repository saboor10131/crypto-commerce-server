const express = require("express")
const app = express()
const PORT = 8000 
const  mongoose = require('mongoose');
const ProductRoutes = require('./routes/ProductRoutes')
const UserRoutes = require('./routes/UserRoutes')
require("dotenv").config()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

//Routes
app.use("/products", ProductRoutes)
app.use("/users", UserRoutes)

const connectionUri = `mongodb://${process.env.HOST_NAME}:${process.env.PORT}/${process.env.DATABASE}`
mongoose.connect(connectionUri).then(() => {

    app.listen(PORT , () => {
        console.log("server is listening at port : ",PORT)
    })
}).catch((err) => {
    console.log("mongodb connection failed")
})