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

const createReceipt = async () => {
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
  const inputData = {
    author: "Gary Lee",
    Company: {
      Name: "Projected",
      Address: "19718 Mandrake Way",
      PhoneNumber: "+1-100000098",
    },
    Invoice: {
      Date: "January 15, 2021",
      Number: 123,
      Items: [
        {
          item: "Gloves",
          description: "Microwave gloves",
          UnitPrice: 5,
          Quantity: 2,
          Total: 10,
        },
        {
          item: "Bowls",
          description: "Microwave bowls",
          UnitPrice: 10,
          Quantity: 2,
          Total: 20,
        },
      ],
    },
    Customer: {
      Name: "Collins Candy",
      Address: "315 Dunning Way",
      PhoneNumber: "+1-200000046",
      Email: "cc@abcdef.co.dw",
    },
    Tax: 5,
    Shipping: 5,
    clause: {
      overseas: "The shipment might take 5-10 more than informed.",
    },
    paymentMethod: "Cash",
  };

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

  console.log("resultAsset")
  console.log(resultAsset._downloadURI)

  return resultAsset._downloadURI
  // Creates a write stream and copy stream asset's content to it
  // const outputFilePath = "./generatePDFOutput.pdf";
  // console.log(`Saving asset at ${outputFilePath}`);

  // const writeStream = fs.createWriteStream(outputFilePath);
  // streamAsset.readStream.pipe(writeStream);
};

// createReceipt();

module.exports = createReceipt