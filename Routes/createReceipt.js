const express = require('express');
const SingleProduct = require('../Models/Product');
const singleProductUploader = require('../Handlers/singleProductUploader');
const createReceipt = require('../invoice');
const router = express.Router();

router.get('/', async (req, res) => {
  const link = await createReceipt()
  res.json({link: link})
})

module.exports = router;
