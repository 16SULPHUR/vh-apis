const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderDetails:Object,
  productDetails: Object
});

const Order = mongoose.model("Order", OrderSchema)

module.exports = Order