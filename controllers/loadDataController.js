const express = require("express");
const mealKitUtil = require("../modules/mealkit-util");
const mealKitModel = require("../models/mealKitModel");
const allMealKits = mealKitUtil.getAllMealKits();

const router = express.Router();

router.get("/mealKits", (req, res) => {
    if (req.session && req.session.user && req.session.role === "Data Entry Clerk") {
        mealKitModel.countDocuments()
            .then(tempCount => {
                if (tempCount === 0) {
                    mealKitModel.insertMany(allMealKits)
                        .then(() => {
                            mealKitModel.updateMany({}, {
                                imageUrl: "/images/"
                            })
                            res.render("message", {
                                title: "Culinary Parcel- Message",
                                message: "Added meal kits to the database."
                            });
                        })
                        .catch(err => {
                            res.render("message", {
                                title: "Culinary Parcel- Message",
                                message: "Something went wrong couldn't add the mealKits into the dataBase"
                            });
                        })
                }
                else {
                    res.render("message", {
                        title: "Culinary Parcel- Message",
                        message: "The mealKit you are trying to add is already been added."
                    });
                }
            })
    }
    else {
        res.status(403).redirect("/error");
    }
});

module.exports = router;