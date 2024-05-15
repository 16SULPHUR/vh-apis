const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = 3005;
// const fetch = require('node-fetch');

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const connect = async () => {
  await mongoose
    .connect(
      "mongodb+srv://akpatil51340:%40Ankit2005@cluster0.rwylpqs.mongodb.net/vh?retryWrites=true&w=majority&appName=cluster0"
    )
    // .connect(
    //   "mongodb+srv://akpatil51340:Ankit5134@cluster0.4vncxmi.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0"
    // )
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((e) => {
      console.log(e);
    });
};

connect();

app.get("/", async (req, res) => {
  res.json({
    msg: "/WORKING",
  });
});

const addProductRouter = require("./Routes/addProduct");
const getAllProductsRouter = require("./Routes/getAllProducts");
const addThumbnailRouter = require("./Routes/addThumbnail");
const getProductRouter = require("./Routes/getProduct");
const deleteProductRouter = require("./Routes/deleteProduct");
const addImagesRouter = require("./Routes/addImages");
const addCatagoryRouter = require("./Routes/addCatagory");
const signupRouter = require("./Routes/signup");
const paymentRouter = require("./Routes/payment");
const ordersRouter = require("./Routes/orders");
const createReceiptRouter = require("./Routes/createReceipt");

app.use("/addProduct", addProductRouter);
app.use("/getAllProducts", getAllProductsRouter);
app.use("/addThumbnail", addThumbnailRouter);
app.use("/getProduct", getProductRouter);
app.use("/deleteProduct", deleteProductRouter);
app.use("/addImages", addImagesRouter);
app.use("/addCatagory", addCatagoryRouter);
app.use("/signup", signupRouter);
app.use("/payment", paymentRouter);
app.use("/orders", ordersRouter);
app.use("/receipt", createReceiptRouter);

const url = "https://api.phone.email/v1/sendmail";
const apiKey = "Kt2ZhlZ0blszcUyNWZpOGv0Cs99MPeVW";
const fromCountryCode = "+91";
const fromPhoneNo = "9512467691";
const toCountrycode = "+91";
const toPhoneNo = "9512467691";
const subject = "Welcome to VARIETY HEAVEN";
const messageBody = "V2VsY29tZSB0byBWQVJJVEVZX0hFQVZFTg==";

const data = {
  apiKey: apiKey,
  fromCountryCode: fromCountryCode,
  fromPhoneNo: fromPhoneNo,
  toCountrycode: toCountrycode,
  toPhoneNo: toPhoneNo,
  subject: subject,
  tinyFlag: true,
  messageBody: messageBody,
};

fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
})
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    console.log("Response:", data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

app.listen(PORT, () => {
  console.info(`Running on http://127.0.0.1:${PORT}`);
});
