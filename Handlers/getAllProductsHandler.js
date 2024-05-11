const { SingleProduct } = require("../Models/Product")

const getAllProductsHandler = async (req, res)=>{
    const allProducts = await SingleProduct.find()

    res.json({
        allProducts : allProducts
    })
}

module.exports = getAllProductsHandler