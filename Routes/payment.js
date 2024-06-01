const express = require("express");
const router = express.Router();
const { load } = require("@cashfreepayments/cashfree-js");
const { Cashfree } = require("cashfree-pg");
const { SingleProduct, VariantProduct } = require("../Models/Product");
const Order = require("../Models/Order");
require("dotenv").config();
const crypto = require("crypto");
const zlib = require("zlib");
const createReceipt = require("../invoice");
const Catagories = require("../Models/Catagory");
const { getProductAmountWithoutGST } = require("../Handlers/helperFunctions");

// Encryption function
function encryptData(data, key) {
  // Convert JSON to string
  const jsonString = JSON.stringify(data);

  // Compress the JSON string
  const compressedData = zlib.deflateSync(jsonString);

  // Encrypt the compressed data
  const cipher = crypto.createCipher("aes-256-cbc", key);
  let encryptedData = cipher.update(compressedData, "buffer", "hex");
  encryptedData += cipher.final("hex");

  return encryptedData;
}

// Decryption function
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

function convertNumberToWords(num) {
  function numberToWords(n) {
    const belowTwenty = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];

    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];

    const thousands = ["", "thousand", "million", "billion"];

    function helper(num) {
      if (num < 20) return belowTwenty[num];
      else if (num < 100)
        return (
          tens[Math.floor(num / 10)] +
          (num % 10 === 0 ? "" : " " + belowTwenty[num % 10])
        );
      else
        return (
          belowTwenty[Math.floor(num / 100)] +
          " hundred" +
          (num % 100 === 0 ? "" : " " + helper(num % 100))
        );
    }

    let word = "";
    let i = 0;

    while (n > 0) {
      if (n % 1000 !== 0) {
        word =
          helper(n % 1000) +
          (thousands[i] ? " " + thousands[i] : "") +
          (word ? " " + word : "");
      }
      n = Math.floor(n / 1000);
      i++;
    }

    return word.trim();
  }

  const roundedNum = Math.round(num);
  const NumberInWords =
    numberToWords(roundedNum).toUpperCase() + " RUPEES ONLY";

  return {
    RoundedNumber: roundedNum,
    NumberInWords,
  };
}

function formatAddress(address) {
  let formattedAddress = "";

  if (address.houseNumberAndStreetAddress)
    formattedAddress += address.houseNumberAndStreetAddress + "\n";

  if (address.area) formattedAddress += address.area + "\n";
  if (address.city) formattedAddress += address.city + ", ";
  if (address.state) formattedAddress += address.state + " ";
  if (address.pin) formattedAddress += address.pin;

  return formattedAddress.trim();
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

    const productDetails = await VariantProduct.findById({ _id: body.pId });

    console.log(productDetails);

    function getCustomTimestamp() {
      const currentDate = new Date();
      const hours = currentDate.getHours().toString().padStart(2, "0");
      const minutes = currentDate.getMinutes().toString().padStart(2, "0");
      const date = currentDate.getDate().toString().padStart(2, "0");
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based, so we add 1
      const year = currentDate.getFullYear().toString().slice(-2); // Get last two digits of the year

      return `${hours}${minutes}${date}${month}${year}`;
    }

    const currentTime = getCustomTimestamp();

    const addressData = {
      houseNumberAndStreetAddress: body.houseNumberAndStreetAddress,
      area: `${body.area}`,
      city: `${body.city}`,
      state: `${body.state}`,
      pin: `${body.pin}`,
      customerGSTIN: `${body.customerGSTIN}`,
      selectedVarient: body.varient
    };

    var request = {
      order_amount: productDetails.discountedPrice,
      order_currency: "INR",
      order_id: `${body.phone}_${body.pId}_${currentTime}`,
      customer_details: {
        customer_id: body.phone,
        customer_phone: body.phone,
        customer_email: body.email,
        customer_name: body.fullName,
      },
      order_meta: {
        return_url: "https://varietyheaven.in",
      },
      order_tags: addressData,
      // order_note: encryptData(addressData, key),
    };

    console.log(request); 

    

    Cashfree.PGCreateOrder("2023-08-01", request)
      .then(async (response) => {
        console.log("Order created successfully:", response.data);

        const newOrder = new Order({
          orderDetails: response.data,
          productDetails: productDetails,
          phone: response.data.customer_details.customer_phone,
          address: formatAddress(response.data.order_tags),
          invoice: "",
        });

        console.log("newOrder")
        console.log(newOrder)

        await newOrder.save()


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
    console.log(body);

    const orderId = body.details.order_id;
    const parts = orderId.split("_");
    const productId = parts[1]; // Index 1 contains "6641d127c234693c101fcc7a"
    console.log(productId);

    const productDetails = await VariantProduct.findById({ _id: productId });
    const catagories = await Catagories.findById({
      _id: "662e846c1fd35b13d42f4549",
    });
    catagories.invoiceNumber++;
    const savedCatagories = await catagories.save();
    console.log(savedCatagories);

    // const decAddress = decryptData(body.details.order_note, key);
    const customerGSTIN = body.details.order_tags.customerGSTIN;
    const address = formatAddress(body.details.order_tags);

    function getDate() {
      const currentDate = new Date();
      const date = currentDate.getDate().toString().padStart(2, "0");
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based, so we add 1
      const year = currentDate.getFullYear().toString().slice(-2); // Get last two digits of the year

      return `${date}/${month}/${year}`;
    }

    const tax = {
      sgst: body.details.order_tags.state.toLowerCase() == "gujarat" ? 2.5 : 0,
      cgst: body.details.order_tags.state.toLowerCase() == "gujarat" ? 2.5 : 0,
      igst: body.details.order_tags.state.toLowerCase() == "gujarat" ? 0 : 5,
    };

    const productAmountWithoutGST = getProductAmountWithoutGST(
      body.details.order_amount
    );
    const productAmountWithGST = body.details.order_amount;

    const calculateTotalAmountWithTax = (amount) => {
      // Define the tax rates based on the state
      // const tax = {
      //   sgst: address.state.toLowerCase() === "gujarat" ? 2.5 : 0,
      //   cgst: address.state.toLowerCase() === "gujarat" ? 2.5 : 0,
      //   igst: address.state.toLowerCase() === "gujarat" ? 0 : 5,
      // };

      // Calculate the individual tax amounts
      // const sgstAmount = (tax.sgst / 100) * amount;
      // const cgstAmount = (tax.cgst / 100) * amount;
      // const igstAmount = (tax.igst / 100) * amount;

      // Calculate the total tax amount
      const totalTax = sgstAmount + cgstAmount + igstAmount;

      // Calculate the total amount with taxes included
      const totalAmountWithTax = amount + totalTax;

      // Return the tax breakdown and total amount with tax
      return {
        totalAmountWithTax,
      };
    };

    const inviceDetails = {
      cfOId: body.details.cf_order_id,
      Invoice: {
        Date: getDate(),
        Number: savedCatagories.invoiceNumber,
        Items: [
          {
            ItemTitle:productDetails.title,
            Item: productDetails.variations[body.details.order_tags.selectedVarient].sku.toUpperCase(),
            Hsn: productDetails.hsn,
            UnitPrice: body.details.order_amount,
            Quantity: 1,
            Total: productAmountWithoutGST,
          },
        ],
      },
      Customer: {
        Name: body.details.customer_details.customer_name || "",
        Address: address,
        PhoneNumber: body.details.customer_details.customer_phone,
        Email: body.details.customer_details.customer_email || "",
        GSTIN: customerGSTIN,
        State: body.details.order_tags.state,
      },
      Tax: {
        TaxPercentage: tax,
        TaxAmount: {
          Sgst:
            body.details.order_tags.state.toLowerCase() == "gujarat"
              ? ((productAmountWithGST - productAmountWithoutGST) / 2).toFixed(2)
              : 0,
          Cgst:
            body.details.order_tags.state.toLowerCase() == "gujarat"
              ? ((productAmountWithGST - productAmountWithoutGST) / 2).toFixed(2)
              : 0,
          Igst:
            body.details.order_tags.state.toLowerCase() == "gujarat"
              ? 0
              : (productAmountWithGST - productAmountWithoutGST).toFixed(2),
        },
      },
      Shipping: "free",
      clause: {
        overseas: "The shipment might take 5-10 more than informed.",
      },
      Total: {
        TotalQuantity: 1,
        TotalAmount: productAmountWithoutGST,
      },
      GrandTotal: convertNumberToWords(productAmountWithGST),
    };

    const invoiceURL = await createReceipt(inviceDetails);

    console.log(invoiceURL);

    const newOrder = new Order({
      orderDetails: body.details,
      productDetails: productDetails,
      phone: body.details.customer_details.customer_phone,
      address: address,
      invoice: invoiceURL,
    });

    console.log(newOrder);

    const savedOrder = await newOrder.save();

    res.json({ msg: savedOrder });
  });

module.exports = router;
