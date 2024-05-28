const express = require('express');
const addVariationListingHandler = require('../Handlers/addVariationListingHandler');
const addImageToVarient = require('../Handlers/addImageToVarient');
const router = express.Router();

const multer= require('multer')

const storage = multer.memoryStorage();

const upload = multer({storage: storage})

router.post('/', (req, res) => {
  addVariationListingHandler(req,res)
}).post("/addImageToVarient",upload.single("image"), (req, res)=>{
  addImageToVarient(req, res)
})

module.exports = router;
