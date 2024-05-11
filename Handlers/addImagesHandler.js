const { SingleProduct } = require("../Models/Product");
const { uploadImages, uploadImage } = require("./uploadImages");

const addImagesHandler = async (req, res) => {
  const body = req.query;

  const id = body.id;
  const imageIndex = body.imageIndex;

  console.log(imageIndex);

  const file = req.file;

//   console.log(file);

  const product = await SingleProduct.findOne({ _id: id });

  console.log(product)

  const uploadedImage = await uploadImage(file);

  switch (imageIndex) {
    case "1":
      product.image1 = uploadedImage.url;
      break;

    case "2":
      product.image2 = uploadedImage.url;
      break;

    case "3":
      product.image3 = uploadedImage.url;
      break;

    case "4":
      product.image4 = uploadedImage.url;
      break;

    case "5":
      product.image5 = uploadedImage.url;
      break;

    default:
        console.log("image index not matched")
      break;
  }

  const saved = await product.save();

  console.log(saved)

  res.json({ product: saved });
};

module.exports = addImagesHandler;
