const express = require('express');
const { SingleProduct } = require('../Models/Product');
const {uploadVideosToDrive} = require('../Handlers/uploadVideosToDrive');
const router = express.Router();

const multer = require("multer")

const storage = multer.memoryStorage()

const upload = multer({storage:storage})

router.post('/',upload.single("productVideo"), (req, res) => {
    uploadVideosToDrive(req,res)
})

module.exports = router;
