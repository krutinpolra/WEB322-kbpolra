const express = require("express");
const mealkitUtil = require("../modules/mealkit-util");
const userModel = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const allMealKits = mealkitUtil.getAllMealKits();

const router = express.Router();

// Route to the home page
router.get("/", (req, res) =>{
    const allMealKits = mealkitUtil.getAllMealKits();
    const mealKitsByCategory = mealkitUtil.getMealKitsByCategory(allMealKits);

    res.render("home", {
        title : "Culinary Parcel - Home",
        featuredMealKits : mealkitUtil.getFeaturedMealKits(allMealKits),
        mealKitsByCategory: mealKitsByCategory
    });
});

// Route(get) to sing-up page
router.get("/sign-up", (req, res) =>{
    res.render("sign-up", {
        title : "Culinary Parcel - Sign-up",
        errors : {},
        values : {
            firstName: "",
            lastName: "",
            email: "",
            password: ""
        }
    });
});

// Route(post) to sing-up page
router.post("/sign-up", (req, res) =>{

    const { firstName, lastName, email, password } = req.body;
    let validationStatus = {
        validFirstName: false,
        validLastName: false,
        validEmail: false,
        validPassword: false
    };      
    let errors = {};

    // First Name Validation
    if(typeof firstName !== "string") {
        validationStatus.validFirstName = false;
        errors.firstName = "You must enter First Name.";
    }
    else if (firstName.trim().length === 0) {
        validationStatus.validFirstName = false;
        errors.firstName = "The First Name is required."
    }
    else {
        validationStatus.validFirstName = true;
    }

    // Email Validation using Regex
    if (!email || typeof email !== "string") {
        validationStatus.validEmail = false;
        errors.email = "You must enter an email address.";
    } 
    else if (email.trim().length === 0) {
        validationStatus.validEmail = false;
        errors.email = "The email address is required.";
    }
    else if (email.indexOf('@') === -1 || email.indexOf('.', email.indexOf('@')) === -1 || email.indexOf(' ') !== -1) {
        validationStatus.validEmail = false;
        errors.email = "Please enter a valid email address.";
    } 
    else {
        validationStatus.validEmail = true;
    }

    // Password Validation
    if (!password || typeof password !== "string") {
        validationStatus.validPassword = false;
        errors.password = "You must enter a password.";
    } 
    else if (password.length < 8 || password.length > 12) {
        validationStatus.validPassword = false;
        errors.password = "Password must be between 8 and 12 characters.";
    }
    else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
        validationStatus.validPassword = false;
        errors.password = "Password must contain at least one lowercase letter, one uppercase letter, one number, and one symbol.";
    } 
    else {
        validationStatus.validPassword = true;
    }

    // Check if all validations pass
    if(validationStatus.validFirstName && validationStatus.validEmail && validationStatus.validPassword) {

        const newUser = new userModel({firstName, lastName, email, password});

        newUser.save()
            .then(userSaved => {
                const sgMail = require("@sendgrid/mail");
                sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

                const msg = {
                to: email,
                from: "krutinpolra@gmail.com",
                subject: "Welcome to Culinary Parcel!",
                html: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Welcome to Culinary Parcel!</title>
                    </head>
                    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">

                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">

                            <h2 style="text-align: center; color: #333333;">Welcome to Culinary Parcel!</h2>

                            <p style="font-size: 16px; color: #666666;">Dear ${firstName} ${lastName},</p>

                            <p style="font-size: 16px; color: #666666;">Thank you for registering with Culinary Parcel! We're thrilled to have you on board.</p>

                            <p style="font-size: 16px; color: #666666;">At Culinary Parcel, we provide you with the freshest ingredients and most delicious recipes, delivered right to your doorstep. Get ready to embark on a culinary journey like no other!</p>

                            <p style="font-size: 16px; color: #666666;">Stay tuned for exciting updates, mouth-watering recipes, and exclusive offers.</p>

                            <p style="font-size: 16px; color: #666666;">If you have any questions or need assistance, feel free to reach out to us at <a href="mailto:krutinpolra@gmail.com" style="color: #009688;">krutinpolra@gmail.com</a>.</p>

                            <p style="font-size: 16px; color: #666666;">Happy cooking!</p>

                            <p style="font-size: 16px; color: #666666;">Best regards,<br> The Culinary Parcel Team</p>

                        </div>

                    </body>
                    </html>
                    `
                };

                sgMail.send(msg)
                    .then(() => {
                        res.render("welcome", {
                            title: "Culinary Parcel - Welcome Page"
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        errors.sendGrid = "Sorry! email was not sent.";
                    })
            })
            .catch(err => {
                if (err.code === 11000 && err.keyPattern.email) {
                    errors.email = "Email already exists!";
                } else {
                    // Handle other errors
                    res.render("sign-up", {
                        title : "Culinary Parcel - Sign-up",
                        values: req.body,
                        errors 
                    });
                }
            })
    } 
    else {
        res.render("sign-up", {
            title : "Culinary Parcel - Sign-up",
            values: req.body,
            errors 
        });
    }
});

// Route(get) to log-in page
router.get("/log-in", (req, res) => {
    res.render("log-in", {
        title : "Culinary Parcel - Log-in",
        errors : {},
        values : {
            email: "",
            password: ""
        }
    });
});

// Route(post) to log-in page
router.post("/log-in", (req, res) => {
    const { email, password, role} = req.body;
    let errors = {};
    let validationStatus = {
        validEmail: false,
        validPassword: false
    }; 

    // Email Validation
    if (!email || typeof email !== "string") {
        validationStatus.validEmail = false;
        errors.email = "You must enter an email address.";
    } 
    else if (email.trim().length === 0) {
        validationStatus.validEmail = false;
        errors.email = "The email address is required.";
    }
    else if (email.indexOf('@') === -1 || email.indexOf('.', email.indexOf('@')) === -1 || email.indexOf(' ') !== -1) {
        validationStatus.validEmail = false;
        errors.email = "Please enter a valid email address.";
    } 
    else {
        validationStatus.validEmail = true;
    }

    // Password Validation
    if (!password || typeof password !== "string") {
        validationStatus.validPassword = false;
        errors.password = "You must enter a password.";
    } 
    else if (password.length === 0) {
        validationStatus.validPassword = false;
        errors.password = "You must enter a password.";
    } 
    else {
        validationStatus.validPassword = true;
    }

    // Check if all validations pass
    if(validationStatus.validEmail && validationStatus.validPassword) {
        userModel.findOne({email})
            .then(user => {
                if(user) {
                    bcryptjs.compare(password, user.password)
                        .then(matched => {
                            if (matched) {
                                req.session.user = user;
                                if (role) {
                                    req.session.role = role;
                                    if(req.session.role === "Data Entry Clerk") {
                                        res.redirect("/mealkits/list");
                                    }
                                    else if(req.session.role === "Customer") {
                                        res.redirect("/cart");
                                    }
                                }
                                else {
                                    req.session.role = "Data Entry Clerk";
                                    res.redirect("/cart");
                                }
                            }
                            else {
                                errors.password = "Invalid password";
                                res.render("log-in", {
                                    title : "Culinary Parcel- post - Log-in",
                                    values: req.body,
                                    errors
                                });
                            }
                        })
                }
                else {
                    errors.general = "Sorry, you entered an invalid email and/or password";
                    res.render("log-in", {
                        title : "Culinary Parcel- post - Log-in",
                        values: req.body,
                        errors
                    });
                }
            })
            .catch(err => {
                errors.email = "email does not exist";
                res.render("log-in", {
                    title : "Culinary Parcel- post - Log-in",
                    values: req.body,
                    errors
                });
            })
    } 
    else {
        res.render("log-in", {
            title : "Culinary Parcel- post - Log-in",
            values: req.body,
            errors
        });
    }
});

// Route to welcome page
router.get("/welcome", (req, res) => {
    res.render("welcome", {
        title: "Culinary Parcel - welcome"
    });
});

router.get("/log-out", (req, res) => {
    req.session.destroy();
    res.redirect("log-in");
});

//about page
router.get("/about", (req, res) => {
    res.render("about", { title: "About Culinary Parcel" });
});

router.get("/cart", (req, res) => {
    if(req.session) {
        if(req.session.role === "Customer") {
            res.render("cart", {
                title: "Culinary Parcel - cart",
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

router.get("/error", (req, res) => {
    res.render("error", {
        title: "Culinary Parcel - Error"
    });
});

module.exports = router;