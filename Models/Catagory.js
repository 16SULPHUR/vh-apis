const mongoose = require("mongoose");

const catagorySchema = new mongoose.Schema({
  catagory: {
    type: Array,
    default: ["Ruffel Saree", "Georgett", "Jimmi chu"]
  }
});

const Catagories = mongoose.model("Catagory", catagorySchema);
module.exports = Catagories;
