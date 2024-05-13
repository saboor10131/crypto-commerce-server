const express = require('express')
const { createProduct } = require('../controllers/ProductController')
const { verifySeller } = require('../middlewares/authMiddleware')
const router  = express.Router()


router.get("/create", verifySeller, createProduct)


module.exports = router