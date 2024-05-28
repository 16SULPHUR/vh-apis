const { json } = require("express");
const { VariantProduct } = require("../Models/Product");

const toTitleCase = (str) => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const formatArray = (array) => {
  return array.map(item => toTitleCase(item.trim()));
};

const createVariations = (colors, baseSku) => {
  const formattedColors = formatArray(colors);
  return formattedColors.map(color => ({
    color: color,
    sku: `${baseSku.toLowerCase()}-${color.toLowerCase()}`,
    images: [],
    thumbnail: ""
  }));
};

const addVariationListingHandler = async (req, res) => {
    const body = req.body;
  
    // Create variations array based on colors
    const variations = createVariations(body.colors, body.sku);
  
    try {
      console.log(body.category);
      const newVarientProduct = new VariantProduct({
        title: body.title,
        sku: body.sku.toLowerCase(),
        hsn: body.hsn,
        description: body.description,
        price: body.price,
        discountedPrice: body.discountedPrice,
        category: body.category,
        variations: variations,
        bulletPoints: formatArray(body.bulletPoints)
      });
  
      console.log("newVarientProduct");
      console.log(newVarientProduct);
  
      const savedVarientProduct = await newVarientProduct.save();
  
      console.log("savedVarientProduct");
      console.log(savedVarientProduct);
      
      res.status(200).json({
          success: true,
          message: "Varient product uploaded successfully",
          product: savedVarientProduct
      });
  
    //   res.json({ msg: "HELLO" });
    } catch (error) {
      console.error("Error uploading Varient product:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading Varient product",
        error: error.message
      });
    }
  };
  

module.exports = addVariationListingHandler;
