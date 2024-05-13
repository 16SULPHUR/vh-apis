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

router.get("/getOrders", async (req, res) => {
  const body = req.query;

  const orders = await Order.find();

  console.log(orders);

  

  res.json({ orders: orders });
});

module.exports = router;
