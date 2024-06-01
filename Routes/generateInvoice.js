const express = require("express");
const router = express.Router();
const Order = require("../Models/Order");
const createReceipt = require("../invoice");
const Catagories = require("../Models/Catagory");

const getProductAmountWithoutGST = (grandTotal) => {
  const numerator = grandTotal;
  const percentage = 105;

  const decimal = percentage / 100;

  const result = numerator / decimal;

  return result.toFixed(2);
};

function getDate() {
  const currentDate = new Date();
  const date = currentDate.getDate().toString().padStart(2, "0");
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based, so we add 1
  const year = currentDate.getFullYear().toString().slice(-2); // Get last two digits of the year

  return `${date}/${month}/${year}`;
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

router.get("/", async (req, res) => {
  const body = req.query;
  console.log(body);

  const orderForInvoice = await Order.findById({ _id: body.oid });
  console.log(orderForInvoice);

  if (!orderForInvoice.invoice) {
    try {
      const catagories = await Catagories.findById({
        _id: "662e846c1fd35b13d42f4549",
      });
      catagories.invoiceNumber++;
      const savedCatagories = await catagories.save();

      const productAmountWithoutGST = getProductAmountWithoutGST(
        orderForInvoice.orderDetails.order_amount
      );
      const productAmountWithGST = orderForInvoice.orderDetails.order_amount;

      const address = formatAddress(orderForInvoice.orderDetails.order_tags);

      const customerGSTIN =
        orderForInvoice.orderDetails.order_tags.customerGSTIN;

      const tax = {
        sgst:
          orderForInvoice.orderDetails.order_tags.state.toLowerCase() ==
          "gujarat"
            ? 2.5
            : 0,
        cgst:
          orderForInvoice.orderDetails.order_tags.state.toLowerCase() ==
          "gujarat"
            ? 2.5
            : 0,
        igst:
          orderForInvoice.orderDetails.order_tags.state.toLowerCase() ==
          "gujarat"
            ? 0
            : 5,
      };

      const inviceDetails = {
        cfOId: orderForInvoice.orderDetails.cf_order_id,
        Invoice: {
          Date: getDate(),
          Number: savedCatagories.invoiceNumber,
          Items: [
            {
              ItemTitle: orderForInvoice.title,
              Item: orderForInvoice.productDetails.variations[
                orderForInvoice.orderDetails.order_tags.selectedVarient
              ].sku.toUpperCase(),
              Hsn: orderForInvoice.hsn,
              UnitPrice: orderForInvoice.orderDetails.order_amount,
              Quantity: 1,
              Total: productAmountWithoutGST,
            },
          ],
        },
        Customer: {
          Name:
            orderForInvoice.orderDetails.customer_details.customer_name || "",
          Address: address,
          PhoneNumber:
            orderForInvoice.orderDetails.customer_details.customer_phone,
          Email:
            orderForInvoice.orderDetails.customer_details.customer_email || "",
          GSTIN: customerGSTIN,
          State: orderForInvoice.orderDetails.order_tags.state,
        },
        Tax: {
          TaxPercentage: tax,
          TaxAmount: {
            Sgst:
              orderForInvoice.orderDetails.order_tags.state.toLowerCase() ==
              "gujarat"
                ? (
                    (productAmountWithGST - productAmountWithoutGST) /
                    2
                  ).toFixed(2)
                : 0,
            Cgst:
              orderForInvoice.orderDetails.order_tags.state.toLowerCase() ==
              "gujarat"
                ? (
                    (productAmountWithGST - productAmountWithoutGST) /
                    2
                  ).toFixed(2)
                : 0,
            Igst:
              orderForInvoice.orderDetails.order_tags.state.toLowerCase() ==
              "gujarat"
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

      orderForInvoice.invoice = invoiceURL

      orderForInvoice.save()

      const ordersToSend = await Order.find({ phone: body.cid });
      res.json({ orders: ordersToSend });
      
    } catch (e) {
        console.error(e);
        res.json({ error: "Something went wrong" });
    }
  }


});

module.exports = router;
