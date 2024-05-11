const express = require('express');
const { SingleProduct } = require('../Models/Product');
const router = express.Router();

const deleteProductHandler = async (req,res)=>{
    body = req.query

    id = body.id

    await SingleProduct.deleteOne({_id: id})

    const products = await SingleProduct.find()

    res.json({
        product:products
    })
}


router.get('/', (req, res) => {
    deleteProductHandler(req,res)
})

module.exports = router;
