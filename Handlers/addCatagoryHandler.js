const Catagories = require("./../Models/Catagory");

const addCatagoryHandler = async (req, res) => {
  const body = req.query;

  console.log(body);

  const catagoriesToReplace = await Catagories.findByIdAndUpdate({_id:"662e846c1fd35b13d42f4549"},
  {
    $push:{
        "catagory":body.catagory.toLowerCase()  
    }
  }
)

const catagories = await Catagories.findById({_id:"662e846c1fd35b13d42f4549"})
  console.log(catagories)





  res.send({catagories: catagories.catagory})
};

module.exports = addCatagoryHandler;
