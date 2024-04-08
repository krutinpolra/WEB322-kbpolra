const express = require("express");
const mealkitUtil = require("../modules/mealkit-util");
const allMealKits = mealkitUtil.getAllMealKits();

const router = express.Router();

router.get("/", (req, res) => {
    res.render("on-the-menu",{
        title: "Culinary Parcel - On-th-menu",
        mealKitsByCategory : mealkitUtil.getMealKitsByCategory(allMealKits)
    });
});

router.get("/list", (req, res) => {
    if(req.session) {
        if(req.session.role === "Data Entry Clerk") {
            res.render("list", {
                title: "Prepster Kitchen - list",
                user: req.session.user,
                role: req.session.role
            });
        } 
        else {
            res.status(401).redirect("/error");
        } 
    }
    else {
        res.status(401).redirect("/error");
    }
});

module.exports = router;
