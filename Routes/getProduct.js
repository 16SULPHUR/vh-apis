const express = require('express');
const { SingleProduct, VariantProduct } = require('../Models/Product');
const router = express.Router();

const getProductHandler = async (req,res)=>{
    body = req.query

    id = body.id

    // const product = await SingleProduct.find({_id: id})
    const product = await VariantProduct.find({_id: id})

    res.json({
        product:product
    })
}


router.get('/', (req, res) => {
    getProductHandler(req,res)
})

module.exports = router;
