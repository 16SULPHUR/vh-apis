const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderDetails:Object
});

const Order = mongoose.model("Order", OrderSchema)

module.exports = Order