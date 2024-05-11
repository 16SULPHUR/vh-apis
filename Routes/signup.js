const express = require("express");
const checkIfSignupCompleteHandler = require("../Handlers/checkIfSignupCompleteHandler");
const User = require("../Models/User");
const router = express.Router();

router
  .get("/checkIfSignupComplete", (req, res) => {
    checkIfSignupCompleteHandler(req, res);
  })
  .get("/user", async (req, res) => {
    const body = req.query;
    const user = await User.findOne({ phone: body.ph });

    console.log("user");
    console.log(user);
    res.json({ user: user });
  })
  .get("/updateUser", async (req, res) => {
    const body = req.query;
    console.log(req.query);

    const userToUpdate = await User.findOne({ phone: body.phone });

    userToUpdate.name = body.name;
    userToUpdate.address = body.address;

    const updatedUser = await userToUpdate.save();

    res.json({ updatedUser: updatedUser });
  })
  .get("/addToCart", async (req, res) => {
    const body = req.query;

    console.log(body);

    const updatedCart = await User.findOneAndUpdate(
      { phone: body.ph },
      {
        $push: {
          cart: body.id,
        },
      }
    );

    console.log(updatedCart);

    res.json({ updatedCart: updatedCart });
  })
  .get("/getCart", async (req, res) => {
    const body = req.query;

    console.log(body);

    const user = await User.findOne({ phone: body.ph });

    console.log(user.cart);

    res.json({ cart: user.cart });
  })
  .get("/removeFromCart", async (req, res) => {
    const body = req.query;

    console.log(body);

    try {
      const cart = await User.findOneAndUpdate(
        { phone: body.ph },
        {
          $pull: {
            cart: body.id,
          },
        },
      );

      const user = await User.findOne({phone: body.ph})


      console.log(user.cart)

      res
        .status(200)
        .json({ message: "Item removed from cart", cart: user.cart });
    } catch (error) {
      console.error("Error removing item from cart:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

module.exports = router;
