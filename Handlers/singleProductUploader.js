const { SingleProduct } = require("../Models/Product");

const singleProductUploader = async (req, res) => {
    const body = req.query;

    

    try {
        const newSingleProduct = new SingleProduct({
            title: body.title,
            description: body.description,
            price: body.price,
            discountedPrice: body.discountedPrice,
            catagory: body.category
        });

        const savedSingleProduct = await newSingleProduct.save();

        console.log("savedSingleProduct");
        console.log(savedSingleProduct);
        
        // Send a success response with uploaded URLs
        res.status(200).json({
            success: true,
            message: "Single product uploaded successfully",
            product: savedSingleProduct
        });
    } catch (error) {
        console.error("Error uploading single product:", error);
        // Send an error response
        res.status(500).json({
            success: false,
            message: "Error uploading single product",
            error: error.message
        });
    }
};

module.exports = singleProductUploader;
