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

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const OrderSchema = new mongoose.Schema({
  orderDetails: Object,
  productDetails: Object,
  phone: String,
  address: Object,
  invoice: {
    type: String,
    default: "",
  },
  gst: {
    cgst: {
      type: Number,
      default: 0,
    },
    sgst: {
      type: Number,
      default: 0,
    },
    igst: {
      type: Number,
      default: 0,
    },
  },
  date: {
    type: Date,
    default: Date.now,
    get: formatDate,
  },
  orderStatus: {
    type: String,
    enum: ["payment received", "shipped to courier provider"],
    default: "payment received",
  },
  customer_gstin:{
    type: String,
    default: ""
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
        "indiaPost"
      ],
      default: "",
    },
    trackingId: {
      type: String,
      default: "",
    },
    trackingLink: {
      type: String,
      default: "",
    },
  },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
