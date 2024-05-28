const stream = require("stream");
const express = require("express");
const multer = require("multer");
const { google } = require("googleapis");
const { SingleProduct, VariantProduct } = require("../Models/Product");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

function convertURL(url) {
  // Check if the URL contains the string '/view'
  if (url.includes("/view")) {
    // Replace '/view' with '/preview'
    return url.replace("/view", "/preview");
  } else {
    // If the URL does not contain '/view', return it unchanged
    return url;
  }
}

async function generateURL(id) {
  try {
    const fileId = id;
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const result = await drive.files.get({
      fileId: fileId,
      fields: "webViewLink",
    });

    console.log(result.data);

    return convertURL(result.data.webViewLink);
  } catch (error) {
    console.log(error);
  }
}

async function uploadVideosToDrive(req, res) {
  try {
    // console.log(fs.createReadStream(filePath))
    const body = req.query;
    const file = req.file;
    console.log(body);

    const product = await VariantProduct.findOne({ _id: body.id });

    console.log(product);

    console.log(file);

    const bufferStream = stream.PassThrough();
    bufferStream.end(file.buffer);

    const response = await drive.files.create({
      requestBody: {
        name: `${product.sku}_${body.videoIndex}.mp4`,
        mimeType: "video/mp4",
      },
      media: {
        mimeType: "image/png",
        body: bufferStream,
      },
    });

    console.log(response.data);
    const id = response.data.id;
    const urls = await generateURL(id);

    console.log(urls);

    let savedProduct;

    switch (body.videoIndex) {
      case "1":
        product.video1 = urls;
        savedProduct = await product.save();
        break;

      case "2":
        product.video2 = urls;
        savedProduct = await product.save();
        break;

      default:
        break;
    }

    console.log(savedProduct)
    res.json({ msg: savedProduct });
  } catch (e) {
    console.log(e);
  }
}

module.exports = { uploadVideosToDrive };

