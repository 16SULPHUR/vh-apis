const express = require('express');
const SingleProduct = require('../Models/Product');
const singleProductUploader = require('../Handlers/singleProductUploader');
const router = express.Router();

router.get('/single', (req, res) => {
  singleProductUploader(req,res)
})

module.exports = router;
