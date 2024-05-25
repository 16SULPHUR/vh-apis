const mongoose = require("mongoose");

const ImagesSchema = new mongoose.Schema({});

const SingleProductSchema = new mongoose.Schema({
  title: String,
  sku: String,
  hsn: String,
  description: String,
  thumbnail: {
    type: String,
    default: "",
  },
  image1: {
    type: String,
    default: "",
  },
  image2: {
    type: String,
    default: "",
  },
  image3: {
    type: String,
    default: "",
  },
  image4: {
    type: String,
    default: "",
  },
  image5: {
    type: String,
    default: "",
  },
  price: Number,
  discountedPrice: Number,
  catagory: String,
  likes: {
    type: Number,
    default: 0,
  },
  hsn: {
    type: Number,
    default: 5407,
  },
  gstRate: {
    type: Number,
    enum: [5, 12, 18, 28],
    default: 5,
  },
  video1: {
    type: String,
    default: "",
  },
  video2: {
    type: String,
    default: "",
  },
});

const VarientSchema = new mongoose.Schema({
  color: String,
  images: [String],
  thumbnail: [String],
});

const VarientProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  thumbnail: String,
  varients: [VarientSchema],
  price: Number,
});

module.exports = {
  SingleProduct: mongoose.model("SingleProduct", SingleProductSchema),
  VariantProduct: mongoose.model("VariantProduct", VarientProductSchema),
};
