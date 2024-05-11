const User = require("../Models/User")

const checkIfSignupCompleteHandler = async(req, res)=>{
    const body = req.query
    console.log(body)

    let isSignupComplete = false

    const user = await User.findOne({phone:body.phone})

    if(!user){
        const newUser = new User({
            phone:body.phone
        })

        console.log(newUser)

        await newUser.save()

        res.json({user: newUser, isNew: true})

        return
    }

    if(user.name && user.address){
        isSignupComplete= true
    }

    res.json({user: user, isSignupComplete: isSignupComplete})
}

module.exports = checkIfSignupCompleteHandler