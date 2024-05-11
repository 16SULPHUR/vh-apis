const express = require('express');
const { SingleProduct } = require('../Models/Product');
const addImagesHandler = require('../Handlers/addImagesHandler');
const router = express.Router();

const multer = require("multer")

const storage = multer.memoryStorage()

const upload = multer({storage:storage})

router.post('/',upload.single("productImage"), (req, res) => {
    addImagesHandler(req,res)
})

module.exports = router;
