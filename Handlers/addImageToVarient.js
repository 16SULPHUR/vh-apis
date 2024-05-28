const { VariantProduct } = require("../Models/Product");
const { uploadImage, uploadThumbnail } = require("./uploadImages");

const addImageToVarient = async (req, res) => {
  const { pId, vId, imageIndex } = req.query;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imageUrl = await uploadImage(file);

  try {
    // Step 1: Unset the image at the specified index
    let result = await VariantProduct.updateOne(
      { _id: pId, "variations._id": vId },
      {
        $unset: {
          [`variations.$.images.${imageIndex}`]: 1
        }
      }
    );

    console.log("Unset Result:", result);

    // Step 2: Set the new image at the specified index
    result = await VariantProduct.updateOne(
      { _id: pId, "variations._id": vId },
      {
        $set: {
          [`variations.$.images.${imageIndex}`]: imageUrl.url
        }
      }
    );

    console.log("Set Result:", result);

    const updatedProduct = await VariantProduct.findById(pId);
    console.log(updatedProduct);

    res.status(200).json({
      success: true,
      message: "Image updated in variant successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating image in variant:", error);
    res.status(500).json({
      success: false,
      message: "Error updating image in variant",
      error: error.message,
    });
  }
};

module.exports = addImageToVarient;
