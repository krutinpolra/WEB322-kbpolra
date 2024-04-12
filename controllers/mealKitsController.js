const express = require("express");
const mealKitUtil = require("../modules/mealkit-util");
const mealKitModel = require("../models/mealKitModel");
const path = require("path");
const fs = require('fs');
const { title } = require("process");

const router = express.Router();

router.get("/", (req, res) => {
    mealKitModel.find().sort({title: 1})
    .then(data => {
        let mealKits = data.map(value => value.toObject());
        res.render("on-the-menu",{
            title: "Culinary parcel - On-th-menu",
            mealKitsByCategory : mealKitUtil.getMealKitsByCategory(mealKits),
            categories: categories
        });
    })
    .catch(() => {
        res.render("common-errors", {title: "error-page", errMessage: "Did not find any mealkits to show in databse, You can log-in as a data clerk to add the kits"});
    })
        // // Retrieve meal kits by category
        // const mealKitsByCategory = mealKitUtil.getMealKitsByCategory(mealKitUtil.getAllMealKits());
        // // Pass meal kits by category data to the template
        // res.render("on-the-menu", { categories: mealKitsByCategory });
});

router.get("/list", (req, res) => {
    if(req.session && req.session.user && req.session.role === "data entry clerk") {
        mealKitModel.find().sort({title: 1})
            .then(data => {
                let mealKits = data.map(value => value.toObject());
                res.render("list", {
                    title: "Culinary Parcel - list",
                    allMealKits: mealKits,
                });
            })
            .catch(() => {
                res.render("common-errors", {title: "error-page", errMessage: "couldn't find any mealKits to show"});
            })
    }
    else {
        res.status(401).redirect("/error");
    }
});

router.get("/add", (req, res) => {
    if(req.session && req.session.user && req.session.role === "data entry clerk") {
        res.render("mealKit-form", {
           title: "Culinary Parcel - form" 
        });
    }
    else {
        res.status(401).redirect("/error");
    }
});

router.post("/add", (req, res) => {
    if(req.session && req.session.user && req.session.role === "data entry clerk") {

        const { title, includes, description, category, price, cookingTime, servings} = req.body;
        const featuredMealKit = req.body.featuredMealKit === 'on';

        const newMealKit = new mealKitModel({title, includes, description, category, price, cookingTime, servings, featuredMealKit});

        newMealKit.save()
            .then(savedMealKit => {

                
                const uploadedImage = req.files.imageUpload;
                const ImageAlt = `mealKit-img-${savedMealKit._id}${path.parse(uploadedImage.name).ext}`;
                
                
                uploadedImage.mv(`assets/images/${ImageAlt}`)
                    .then(() => {
                        
                        mealKitModel.updateOne({
                            _id: savedMealKit._id
                        },{
                            imageUrl: `/images/${ImageAlt}` 
                        })
                            .then(() => {
                                res.redirect("/mealKitsController/list");
                            })
                            .catch(err => {
                                res.render("common-errors", {title: "error-page", errMessage: "Couldn't update the URL of the image in database."});
                            })
                    })
                    .catch(err => {
                        res.render("common-errors", {title: "error-page", errMessage: "Something went wrong with image"});
                    })
            })
            .catch(err => {
                console.log(err);
                res.redirect("/error");
            })
    }
    else {
        res.status(401).redirect("/error");
    }
});

router.get("/edit/:id" ,(req, res) => {
    if(req.session && req.session.user && req.session.role === "data entry clerk") {
        const mealKitId = req.params.id;

        mealKitModel.findById(mealKitId)
            .then(mealKit => {
                res.render("edit", {title: "Culinary Parcel - form", mealKit})
            })
            .catch(err => {
                res.render("common-errors", {title: "error-page", errMessage: "Couldn't edit your mealKit"});
            })
    }
    else {
        res.status(401).redirect("/error");
    }
});

router.post("/edit/:id", (req, res) => {
    if(req.session && req.session.user && req.session.role === "data entry clerk") {
        const mealKitId = req.params.id;
        const { title, includes, description, category, price, cookingTime, servings} = req.body;
        const featuredMealKit = req.body.featuredMealKit === 'on';

        const uploadedImage = req.files.imageUpload;
        const ImageAlt = `mealKit-img-${mealKitId}${path.parse(uploadedImage.name).ext}`;
                
        const rootDirectory = path.join(__dirname, '../');
        const newImagePath = path.join(rootDirectory, `/assets/images/${ImageAlt}`);
        const previousImagePath = path.join(rootDirectory, `/assets/images/mealKit-img-${mealKitId}${path.parse(uploadedImage.name).ext}`);

        fs.unlink(previousImagePath, (err) => {
            if (err) {
                uploadedImage.mv(newImagePath)
                    .then(() => {
                        mealKitModel.updateOne({
                            _id: mealKitId
                        },{
                            title: title,
                            includes: includes,
                            description: description,
                            category: category,
                            price: price,
                            cookingTime: cookingTime,
                            servings: servings,
                            imageUrl: `/images/${ImageAlt}`,
                            featuredMealKit: featuredMealKit
                        })  
                        .then(() => {
                            
                            res.redirect("/mealKitsController/list");
                        })
                        .catch(err => {
                            
                            res.render("common-errors", {title: "error-page", errMessage: "Couldn't update the URL of the image in database."});
                        });
                    })
                    .catch(err => {
                        
                        res.render("common-errors", {title: "error-page", errMessage: "Couldn't update the location of the image."});
                    });
            } else {
                console.log("Previous image deleted successfully");
                
                uploadedImage.mv(newImagePath)
                    .then(() => {
                        
                        mealKitModel.updateOne({
                            _id: mealKitId
                        },{
                            title: title,
                            includes: includes,
                            description: description,
                            category: category,
                            price: price,
                            cookingTime: cookingTime,
                            servings: servings,
                            imageUrl: `/images/${ImageAlt}`,
                            featuredMealKit: featuredMealKit
                        })  
                        .then(() => {
                            
                            res.redirect("/mealKitsController/list");
                        })
                        .catch(err => {
                            
                            res.render("common-errors", {title: "error-page", errMessage: "Couldn't update the image URL in database."});
                        });
                    })
                    .catch(err => {
                        
                        res.render("common-errors", {title: "error-page", errMessage: "Couldn't move the new image file."});
                    });
            }
        });
    } else {
        res.status(401).redirect("/error");
    }
});

router.get("/delete/:id" ,(req, res) => {
    if(req.session && req.session.user && req.session.role === "data entry clerk") {
        const mealKitId = req.params.id;
        res.render("confirmation", {title: "Culinary Parcel - Confirmation", mealKitId: mealKitId});
    }
    else {
        res.status(401).redirect("/error");
    }
});

router.post("/delete/:id", (req, res) => {
    if(req.session && req.session.user && req.session.role === "data entry clerk") {
        const mealKitId = req.params.id;

        
        mealKitModel.findById(mealKitId)
            .then(mealKit => {
                if (!mealKit) {
                    
                    res.status(404).render("common-errors", {title: "error-page", errMessage: "Meal kit not found."});
                    return;
                }

                
                mealKitModel.deleteOne({_id: mealKitId})
                    .then(() => {
                        
                        const imagePath = path.join(__dirname, `../assets/images/mealKit-img-${mealKitId}${path.parse(mealKit.imageUrl).ext}`);
                        fs.unlink(imagePath, (err) => {
                            if (err) {
                                console.error("Error deleting meal kit image:", err);
                                res.redirect("/mealKitsController/list");
                            }
                            else {
                                res.redirect("/mealKitsController/list");
                            }
                        });
                    })
                    .catch(err => {
                        
                        res.render("common-errors", {title: "error-page", errMessage: "Failed to delete the meal kit from the database."});
                    });
            })
            .catch(err => {
                
                res .render("common-errors", {title: "error-page", errMessage: "Failed to fetch meal kit information from the database."});
            });
    } else {
        
        res.status(401).redirect("/error");
    }
});


module.exports = router;