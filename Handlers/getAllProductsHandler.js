const { SingleProduct, VariantProduct } = require("../Models/Product")

const getAllProductsHandler = async (req, res)=>{
    // const allProducts = await SingleProduct.find()
    const allProducts = await VariantProduct.find()

    res.json({
        allProducts : allProducts
    })
}

module.exports = getAllProductsHandler