const express = require("express");
const mealKitUtil = require("../modules/mealkit-util");
const userModel = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const mealKitModel = require("../models/mealKitModel");

const router = express.Router();

router.get("/", (req, res) =>{
    mealKitModel.find().sort({title: 1})
            .then(data => {
                let mealKits = data.map(value => value.toObject());
                res.render("home", {
                    title : "Culinary Parcel - Home",
                    featuredMealKits : mealKitUtil.getFeaturedMealKits(mealKits),
                    mealKitsByCategory: mealKitUtil.getMealKitsByCategory(mealKits) // Pass mealKitsByCategory here
                });
            })
            .catch(() => {
                res.render("home", {
                    title: "Culinary Parcel - Home",
                    featuredMealKits: [], // or pass an empty array if no data is available
                    mealKitsByCategory: [] // or pass an empty array if no data is available
                });
            })
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

// Route(post) to sign-up page
router.post("/sign-up", (req, res) =>{

    const { firstName, lastName, email, password } = req.body;
    let statusOfValidation = {
        isValidFirstName: false,
        isValidLastName: false,
        isValidEmail: false,
        isValidPassword: false
    };      
    let errors = {};

    // First Name Validation
    if(typeof firstName !== "string") {
        statusOfValidation.isValidFirstName = false;
        errors.firstName = "please enter First Name.";
    }
    else if (firstName.trim().length === 0) {
        statusOfValidation.isValidFirstName = false;
        errors.firstName = "First Name is required."
    }
    else {
        statusOfValidation.isValidFirstName = true;
    }

    // Email Validation using Regex
    if (!email || typeof email !== "string") {
        statusOfValidation.isValidEmail = false;
        errors.email = "please enter an email address.";
    } 
    else if (email.trim().length === 0) {
        statusOfValidation.isValidEmail = false;
        errors.email = "The email address is required.";
    }
    else if (email.indexOf('@') === -1 || email.indexOf('.', email.indexOf('@')) === -1 || email.indexOf(' ') !== -1) {
        statusOfValidation.isValidEmail = false;
        errors.email = "Please enter a valid email address.";
    } 
    else {
        statusOfValidation.isValidEmail = true;
    }

    // Password Validation
    if (!password || typeof password !== "string") {
        statusOfValidation.isValidPassword = false;
        errors.password = "please enter a password.";
    } 
    else if (password.length < 8 || password.length > 12) {
        statusOfValidation.isValidPassword = false;
        errors.password = "Password must be between 8 and 12 characters.";
    }
    else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
        statusOfValidation.isValidPassword = false;
        errors.password = "Password must contain at least one lowercase letter, one uppercase letter, one number, and one symbol.";
    } 
    else {
        statusOfValidation.isValidPassword = true;
    }
    
    // Check if all validations pass
    if (statusOfValidation.isValidFirstName && statusOfValidation.isValidEmail && statusOfValidation.isValidPassword) {

        const newUser = new userModel({ firstName, lastName, email, password });

        userModel.findOne({ email: email })
            .then(existingUser => {
                if (existingUser) {
                    // If the user already exists, set an error message and render the sign-up page again
                    errors.email = "Email already exists!";
                    res.render("sign-up", {
                        title: "Culinary Parcel - Sign-up",
                        values: req.body,
                        errors: errors
                    });
                } else {
                    newUser.save()
                        .then(() => {

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

                                    <h2 style="text-align: center; color: #333333;">Welcome to Culinary Parcel, ${firstName}!</h2>

                                    <p style="font-size: 16px; color: #666666;">Get ready to embark on a culinary adventure like no other!</p>

                                    <p style="font-size: 16px; color: #666666;">At Culinary Parcel, we're dedicated to delivering the freshest ingredients and most delicious recipes right to your doorstep.</p>

                                    <p style="font-size: 16px; color: #666666;">We're thrilled to have you join our community of food enthusiasts. Whether you're a seasoned chef or just starting out, there's something for everyone at Culinary Parcel.</p>

                                    <p style="font-size: 16px; color: #666666;">Stay tuned for exciting updates, mouth-watering recipes, and exclusive offers. Plus, be sure to check out our blog for tips and tricks from our expert chefs!</p>

                                    <p style="font-size: 16px; color: #666666;">If you ever have any questions or need assistance, don't hesitate to reach out to us at <a href="mailto:krutinpolra@gmail.com" style="color: #009688;">krutinpolra@gmail.com</a>.</p>

                                    <p style="font-size: 16px; color: #666666;">Enjoy your culinary journey!</p>

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
                                    });
                                })
                                .catch(err => {
                                    console.log(err);
                                    errors.sendGrid = "Sorry! couldn't send email.";
                                });
                        })
                        .catch(err => {
                            if (err.code === 11000 && err.keyPattern.email) {
                                errors.email = "Email already exists!";
                            } else {
                                // Handle other errors
                                res.render("sign-up", {
                                    title: "Culinary Parcel - Sign-up",
                                    values: req.body,
                                    errors
                                });
                            }
                        });
                }
            })
            .catch(err => {
                console.error("Error checking existing user:", err);
                res.status(500).send("Internal Server Error");
            });
    } else {
        res.render("sign-up", {
            title: "Culinary Parcel - Sign-up",
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
    let statusOfValidation = {
        isValidEmail: false,
        isValidPassword: false
    }; 

    // Email Validation
    if (!email || typeof email !== "string") {
        statusOfValidation.isValidEmail = false;
        errors.email = "please enter an email address.";
    } 
    else if (email.trim().length === 0) {
        statusOfValidation.isValidEmail = false;
        errors.email = "The email address is required.";
    }
    else if (email.indexOf('@') === -1 || email.indexOf('.', email.indexOf('@')) === -1 || email.indexOf(' ') !== -1) {
        statusOfValidation.isValidEmail = false;
        errors.email = "Please enter a valid email address.";
    } 
    else {
        statusOfValidation.isValidEmail = true;
    }

    // Password Validation
    if (!password || typeof password !== "string") {
        statusOfValidation.isValidPassword = false;
        errors.password = "please enter a password.";
    } 
    else if (password.length === 0) {
        statusOfValidation.isValidPassword = false;
        errors.password = "please enter a password.";
    } 
    else {
        statusOfValidation.isValidPassword = true;
    }

    
    // Check if all validations pass
    if(statusOfValidation.isValidEmail && statusOfValidation.isValidPassword) {
        
        userModel.findOne({email})
            .then(user => {
                
                if(user) {
                    bcryptjs.compare(password, user.password)
                        .then(matched => {
                            if (matched) {
                                
                                req.session.user = user;
                                if (role) {
                                    req.session.role = role;
                                    if(req.session.role === "data entry clerk") {
                                        res.redirect("/mealKitsController/list");
                                    }
                                    else {
                                        res.redirect("/cart");
                                    }
                                }
                                else {
                                    req.session.role = "data entry clerk";
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
    if (req.session && req.session.role === "customer") {
        mealKitModel.find()
            .then(data => {
                const allMealKits = data.map(value => value.toObject());
                res.render("cart", {
                    title: "Culinary Parcel - Cart",
                    user: req.session.user,
                    role: req.session.role,
                    mealKits: allMealKits
                });
            })
            .catch(err => {
                console.error("Error fetching meal kits:", err);
                res.status(500).redirect("/error");
            });
    } else {
        res.status(401).redirect("/error");
    }
});

router.get("/on-the-menu", (req, res) => {
    // Retrieve meal kits by category
    const mealKitsByCategory = mealKitUtil.getMealKitsByCategory(mealKitUtil.getAllMealKits());
    // Pass meal kits by category data to the template
    res.render("on-the-menu", { categories: mealKitsByCategory });
});

router.get("/error", (req, res) => {
    res.render("error", {
        title: "Culinary Parcel - Error"
    });
});

module.exports = router;