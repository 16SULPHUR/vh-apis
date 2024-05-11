const mongoose = require("mongoose");

const ImagesSchema = new mongoose.Schema({});

const SingleProductSchema = new mongoose.Schema({
  title: String,
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
  likes:{
    type:Number,
    default: 0
  }
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
