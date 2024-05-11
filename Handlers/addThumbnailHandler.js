const { SingleProduct, VariantProduct } = require("../Models/Product")
const { uploadThumbnail } = require("./uploadImages")

const addThumbnailHandler = async (req, res)=>{

    body = req.query

    console.log(req.file)
    
    const product = await SingleProduct.findOne({_id: body.id})

    const thumbnailURL = await uploadThumbnail(req.file)

    // console.log(product)

    product.thumbnail = thumbnailURL

    const saved = await product.save()

    console.log(saved)

    res.json({
        allProducts : "allProducts"
    })
}

module.exports = addThumbnailHandler