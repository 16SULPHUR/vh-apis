const express = require("express");
const router = express.Router();
const { load } = require("@cashfreepayments/cashfree-js");
const { Cashfree } = require("cashfree-pg");
const { SingleProduct } = require("../Models/Product");
const Order = require("../Models/Order");
require("dotenv").config();
const crypto = require('crypto');
const zlib = require('zlib');


// Encryption function
function encryptData(data, key) {
    // Convert JSON to string
    const jsonString = JSON.stringify(data);

    // Compress the JSON string
    const compressedData = zlib.deflateSync(jsonString);

    // Encrypt the compressed data
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encryptedData = cipher.update(compressedData, 'buffer', 'hex');
    encryptedData += cipher.final('hex');

    return encryptedData;
}

// Decryption function
function decryptData(encryptedData, key) {
    // Decrypt the data
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decryptedData = decipher.update(encryptedData, 'hex', 'buffer');
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

    function getCustomTimestamp() {
      const currentDate = new Date();
      const hours = currentDate.getHours().toString().padStart(2, '0');
      const minutes = currentDate.getMinutes().toString().padStart(2, '0');
      const date = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based, so we add 1
      const year = currentDate.getFullYear().toString().slice(-2); // Get last two digits of the year
  
      return `${hours}${minutes}${date}${month}${year}`;
  }
  
  const currentTime = getCustomTimestamp();

  const addressData = {
    streetAddress: body.streetAddress,
    aptSuite: body.aptSuite,
    floor: body.floor,
    building: body.building,
    landmark: body.landmark,
    city: body.city,
    state: body.state,
    zip: body.zip
};

    var request = {
      order_amount: productDetails.discountedPrice,
      order_currency: "INR",
      order_id: `${body.phone}_${body.pId}_${currentTime}`,
      customer_details: {
        customer_id: body.phone,
        customer_phone: body.phone,
        customer_email: body.email,
        customer_name: body.fullname
      },
      order_meta: {
        return_url: "https://varietyheaven.in",
      },
      order_note: encryptData(addressData, key)
      
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

    console.log(productDetails)

    const newOrder = new Order({
      orderDetails: body.details,
      productDetails: productDetails,
      phone:body.details.customer_details.customer_phone,
      address: decryptData(body.details.order_note, key)
    });

    console.log(newOrder);

    const savedOrder = await newOrder.save();

    res.json({ msg: savedOrder });
  });

module.exports = router;
