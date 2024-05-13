const express = require("express");
const router = express.Router();
const { load } = require("@cashfreepayments/cashfree-js");
const { Cashfree } = require("cashfree-pg");
const { SingleProduct } = require("../Models/Product");
const Order = require("../Models/Order");
require("dotenv").config();

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
  .post("/createOrder", async (req, res) => {
    let cashfree;
    var initializeSDK = async function () {
      cashfree = await load({
        mode: "production",
      });
    };
    initializeSDK();
    Cashfree.XClientId = "677179181db74e5412762e07c2971776";
    Cashfree.XClientSecret = process.env.SECRETE;
    Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

    const body = req.body;

    console.log(body);

    const productDetails = await SingleProduct.findById({ _id: body.pId });

    console.log(productDetails);

    const currentTime = new Date().getTime();

    var request = {
      order_amount: productDetails.discountedPrice,
      order_currency: "INR",
      order_id: `${body.phone}_${body.pId}_${currentTime}`,
      customer_details: {
        customer_id: body.phone,
        customer_phone: body.phone,
        customer_email: body.email,
      },
      order_meta: {
        return_url: "https://varietyheaven.in",
      },
      order_note: `{ address: {fullName: ${body.fullName},streetAddress: ${body.streetAddress}, aptSuite: ${body.aptSuite}, floor: ${body.floor}, building: ${body.building}, landmark: ${body.landmark}, city: ${body.city}, state: ${body.state}, zip: ${body.zip}, }, },`,
    };

    console.log(request);

    Cashfree.PGCreateOrder("2023-08-01", request)
      .then((response) => {
        console.log("Order created successfully:", response.data);
        res.json({ msg: response.data });
      })
      .catch((error) => {
        console.error("Error:", error.response.data.message);
        res.json({ error: error.response.data.message });
      });

    // res.json({ msg: "response.data" });
  })
  .post("/registerOrder", async (req, res) => {
    const body = req.body;

    const orderId = body.details.order_id;
    const parts = orderId.split("_");
    const productId = parts[1]; // Index 1 contains "6641d127c234693c101fcc7a"
    console.log(productId);

    const productDetails = await SingleProduct.findById({ _id: productId });

    const newOrder = new Order({
      orderDetails: body.details,
      productDetails: productDetails,
    });

    console.log(newOrder);

    const savedOrder = await newOrder.save();

    res.json({ msg: savedOrder });
  });

module.exports = router;
