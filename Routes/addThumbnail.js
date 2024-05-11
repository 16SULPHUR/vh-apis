const express = require('express');
const addThumbnailHandler = require('../Handlers/addThumbnailHandler');
const router = express.Router();

const multer= require('multer')

const storage = multer.memoryStorage();

const upload = multer({storage: storage})


router.post('/',upload.single("thumbnail"), (req, res) => {
    addThumbnailHandler(req,res)
})

module.exports = router;
