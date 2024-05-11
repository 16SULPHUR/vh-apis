const express = require('express');
const Catagories = require("./../Models/Catagory");
const addCatagoryHandler = require('../Handlers/addCatagoryHandler');
const router = express.Router();

router.get('/', (req, res) => {
    addCatagoryHandler(req,res)
}).get('/getCatagories', async (req,res)=>{
    const catagories = await Catagories.find()

    res.json({catagories:catagories[0].catagory})
})

module.exports = router;
