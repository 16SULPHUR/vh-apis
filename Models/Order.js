const mongoose = require("mongoose");

const trackingLinks = {
  nandan: "https://www.shreenandancourier.com/",
  anjani: "http://www.shreeanjanicourier.com/",
  delhivery: "https://www.delhivery.com/tracking",
  ecom: "https://ecomexpress.in/tracking/",
  bluedart: "https://bluedart.com/tracking",
  dtdc: "https://www.dtdc.in/tracking.asp",
  tirupati: "http://www.shreetirupaticourier.net/",
};

const OrderSchema = new mongoose.Schema({
  orderDetails: Object,
  productDetails: Object,
  phone: String,
  address: Object,
  date: {
    type: Date,
    default: Date()
  },
  orderStatus: {
    type: String,
    enum: ["payment received", "shipped to courier provider"],
    default: "payment received",
  },
  shipmentDetails: {
    shippingProvider: {
      type: String,
      enum: [
        "nandan",
        "anjani",
        "delhivery",
        "ecom",
        "bluedart",
        "dtdc",
        "tirupati",
        "",
      ],
      default: "",
    },
    trackingId: {
      type: String,
      default: "",
    },
    trackingLink:{
      type: String,
      default: ""
    }
  },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
