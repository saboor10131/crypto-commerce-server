const express = require("express")
const app = express()
const PORT = 8000 


app.use("/"  , (req , res) => {
    return res.send("hello world")
})

app.listen(PORT , () => {
    console.log("server is listening at port : ",PORT)
})