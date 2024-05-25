const {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  DocumentMergeParams,
  OutputFormat,
  DocumentMergeJob,
  DocumentMergeResult,
  SDKError,
  ServiceUsageError,
  ServiceApiError,
} = require("@adobe/pdfservices-node-sdk");

require("dotenv").config();

const fs = require("fs");

var ImageKit = require("imagekit");

var imagekit = new ImageKit({
  publicKey: "public_gkPbyKgZlAzLEh+N4QjuH1lJzYo=",
  privateKey: "private_KLXMquDly6NZvTLUjtAA0mYFRss=",
  urlEndpoint: "https://ik.imagekit.io/dqn1rnabh/",
});

const uploadImage = async (buffer, oId) => {
  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: buffer, // required
        fileName: oId, // required
      },
      function (error, result) {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          // console.log(result);
          resolve(result);
        }
      }
    );
  });
};



const createReceipt = async (invoiceDetails) => {
  console.log(process.env.PDF_SERVICES_CLIENT_ID);
  // Initial setup, create credentials instance
  const credentials = new ServicePrincipalCredentials({
    clientId: process.env.PDF_SERVICES_CLIENT_ID,
    clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET,
  });

  // Creates a PDF Services instance
  const pdfServices = new PDFServices({ credentials });

  // Creates an asset(s) from source file(s) and upload
  readStream = fs.createReadStream("./receiptTemplate.docx");
  const inputAsset = await pdfServices.upload({
    readStream,
    mimeType: MimeType.DOCX,
  });

  // Setup input data for the document merge process
  // const inputData = {
  //   author: "Gary Lee",
  //   Company: {
  //     Name: "Projected",
  //     Address: "19718 Mandrake Way",
  //     PhoneNumber: "+1-100000098",
  //   },
  //   Invoice: {
  //     Date: "January 15, 2021",
  //     Number: 123,
  //     Items: [
  //       {
  //         item: "Gloves",
  //         description: "Microwave gloves",
  //         UnitPrice: 5,
  //         Quantity: 2,
  //         Total: 10,
  //       },
  //     ],
  //   },
  //   Customer: {
  //     Name: "Collins Candy",
  //     Address: "315 Dunning Way",
  //     PhoneNumber: "+1-200000046",
  //     Email: "cc@abcdef.co.dw",
  //   },
  //   Tax: 5,
  //   Shipping: 5,
  //   clause: {
  //     overseas: "The shipment might take 5-10 more than informed.",
  //   },
  // };

  const inputData = invoiceDetails

  const jsonDataForMerge = inputData;

  // Create parameters for the job
  const params = new DocumentMergeParams({
    jsonDataForMerge,
    outputFormat: OutputFormat.PDF,
  });

  // Creates a new job instance
  const job = new DocumentMergeJob({ inputAsset, params });

  // Submit the job and get the job result
  const pollingURL = await pdfServices.submit({ job });
  const pdfServicesResponse = await pdfServices.getJobResult({
    pollingURL,
    resultType: DocumentMergeResult,
  });

  // Get content from the resulting asset(s)
  const resultAsset = pdfServicesResponse.result.asset;
  const streamAsset = await pdfServices.getContent({ asset: resultAsset });

  const buffer = await new Promise((resolve, reject) => {
    const chunks = [];
    streamAsset.readStream.on('data', chunk => chunks.push(chunk));
    streamAsset.readStream.on('end', () => resolve(Buffer.concat(chunks)));
    streamAsset.readStream.on('error', reject);
  });

  console.log("buffer")
  console.log(buffer)

const pdf = await uploadImage(buffer, invoiceDetails.cfOId)
console.log(pdf.url)

  // console.log("resultAsset")
  // console.log(resultAsset._downloadURI)

  return pdf.url
  // Creates a write stream and copy stream asset's content to it
  // const outputFilePath = "./generatePDFOutput.pdf";
  // console.log(`Saving asset at ${outputFilePath}`);

  // const writeStream = fs.createWriteStream(outputFilePath);
  // streamAsset.readStream.pipe(writeStream);
};

// createReceipt();

module.exports = createReceipt