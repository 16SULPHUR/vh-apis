const express = require("express");
const router = express.Router();
const { load } = require("@cashfreepayments/cashfree-js");
const { Cashfree } = require("cashfree-pg");
const { SingleProduct, VariantProduct } = require("../Models/Product");
const Order = require("../Models/Order");
require("dotenv").config();
const crypto = require("crypto");
const zlib = require("zlib");
const fetch = require("node-fetch");

const trackingLinks = {
  nandan: "https://www.shreenandancourier.com/track-shipment/",
  anjani: "http://www.shreeanjanicourier.com/",
  delhivery: "https://www.delhivery.com/tracking",
  ecom: "https://ecomexpress.in/tracking/",
  bluedart: "https://bluedart.com/tracking",
  dtdc: "https://www.dtdc.in/tracking.asp",
  tirupati: "http://www.shreetirupaticourier.net/",
  indiaPost:
    "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx",
};

function decryptData(encryptedData, key) {
  // Decrypt the data
  const decipher = crypto.createDecipher("aes-256-cbc", key);
  let decryptedData = decipher.update(encryptedData, "hex", "buffer");
  decryptedData = Buffer.concat([decryptedData, decipher.final()]);

  // Decompress the decrypted data
  const decompressedData = zlib.inflateSync(decryptedData);

  // Convert decompressed data to JSON
  const json = JSON.parse(decompressedData.toString());

  return json;
}

// Sample key (should be 32 characters for AES-256)
const key = "0123456789abcdef0123456789abcdef";

const decryptPhoneNumber = (encryptedPhoneNumber, shift) => {
  // Check if the input is a valid encrypted phone number
  if (!/^\d{10}$/.test(encryptedPhoneNumber)) {
    return;
  }

  let decryptedPhoneNumber = "";
  for (let i = 0; i < encryptedPhoneNumber.length; i++) {
    const digit = parseInt(encryptedPhoneNumber[i], 10);
    const decryptedDigit = (digit - shift + 10) % 10; // Apply inverse shift to decrypt each digit
    decryptedPhoneNumber += decryptedDigit.toString();
  }
  return decryptedPhoneNumber;
};

router
  .get("/getOrders", async (req, res) => {
    const body = req.query;

    const orders = await Order.find();

    console.log(orders);

    res.json({ orders: orders });
  })
  .get("/getOrder", async (req, res) => {
    const body = req.query;

    const order = await Order.findById({ _id: body.id });

    console.log(order);

    res.json({ order: order });
  })
  .get("/updateOrder", async (req, res) => {
    const body = req.query;

    const orderToUpdate = await Order.findById({ _id: body.id });

    if (body.orderStatus) {
      orderToUpdate.orderStatus = body.orderStatus;
    }

    if (body.shippingProvider) {
      orderToUpdate.shipmentDetails.shippingProvider = body.shippingProvider;

      orderToUpdate.shipmentDetails.trackingLink =
        trackingLinks[body.shippingProvider];
    }

    if (body.trackingId) {
      orderToUpdate.shipmentDetails.trackingId = body.trackingId;
    }

    const savedOrder = await orderToUpdate.save();

    res.json({ updatedOrder: savedOrder });
  })
  .get("/trackOrders", async (req, res) => {
    const body = req.query;

    console.log(body);

    const orders = await Order.find({ phone: body.cid });
    

    console.log(orders);

    for (const order of orders) {
      if (!order.isPaymentStatusChecked) {
        
        console.log("order status not checkd");
        const url = `https://api.cashfree.com/pg/orders/${order.orderDetails.order_id}`;
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            "x-api-version": "2023-08-01",
            "x-client-id": "677179181db74e5412762e07c2971776",
            "x-client-secret":
            process.env.SECRETE,
          },
        };
        
        await fetch(url, options)
        .then((res) => res.json())
        .then(async (json) => {

            const orderToChange = await Order.findById({_id: order._id})
            // console.log(orderToChange)
            console.log(json);

            orderToChange.orderDetails = json
            orderToChange.isPaymentStatusChecked = true

            if(json.order_status == "PAID"){
              orderToChange.orderStatus = "payment received"
            }

            await orderToChange.save()

            order.orderDetails = json

          })
          .catch((err) => console.error("error:" + err));
      }
    }

    const ordersToSend = await Order.find({ phone: body.cid });
    res.json({ orders: ordersToSend });
  });

module.exports = router;
