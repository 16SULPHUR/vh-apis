const express = require('express');
const getAllProductsHandler = require('../Handlers/getAllProductsHandler');
const router = express.Router();

router.get('/', (req, res) => {
    getAllProductsHandler(req,res)
})

module.exports = router;
