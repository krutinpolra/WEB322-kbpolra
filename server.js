/*************************************************************************************
* WEB322 - 2241 Project
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* Student Name  : Krutin Bharatbhai Polra
* Student ID    : kbpolra@myseneca.ca   135416220
* Course/Section: WEB322/NEE
*
**************************************************************************************/

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mealKitUtil = require('./modules/mealkit-util');

//set-up dotenv
const dotenv = require("dotenv");
dotenv.config({path: "./config/keys.env"})

//set up EJS
app.set("view engine", "ejs");
app.set("layout", "layouts/main");
app.use(expressLayouts);

//set-up body-parser
app.use(express.urlencoded({extended: false}));

//Make the "assets" folder public (aka static)
app.use(express.static(path.join(__dirname, "/assets")));

// Add your routes here
// e.g. app.get() { ... }

app.get("/", (req, res) => {
    // Retrieve all meal kits
    const mealKits = mealKitUtil.getAllMealKits();
    // Pass meal kits data to the template
    res.render("home", { mealKits: mealKits });
});

app.get("/on-the-menu", (req, res) => {
        // Retrieve meal kits by category
        const mealKitsByCategory = mealKitUtil.getMealKitsByCategory(mealKitUtil.getAllMealKits());
        // Pass meal kits by category data to the template
        res.render("on-the-menu", { categories: mealKitsByCategory });
});

app.get("/sign-up", (req, res) => {
    res.render("sign-up", {
        title: "sign-up",
        errors: {}
    });
});

// POST route for sign-up form submission
app.post("/sign-up", (req, res) => {
    const { firstName, email, password } = req.body;
    const errors = {};

    // Perform server-side validation
    if (!firstName || firstName.trim() === '') {
        errors.firstName = "Name is required.";
    }

    // Email validation with regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.email = "Invalid email address. Please enter valid email";
    }

    // Password validation with regular expression
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;
    if (!password || !passwordRegex.test(password)) {
        errors.password = "Password must be 8-12 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol.";
    }

    // If there are validation errors, render the sign-up page with errors
    if (Object.keys(errors).length > 0) {
        res.render("sign-up", { errors, firstName, email }); // Pass submitted data back to the form
    } else {
        // No validation errors, proceed with sign-up process
        const sgMail = require("@sendgrid/mail")
        sgMail.setApiKey(process.env.SEND_GRID_API_KEY)
        // Send welcome email to the user
        const msg = {
            to: email,
            from: "kbpolra@myseneca.ca",
            subject: 'Welcome to Our Website!',
            text: `Hello ${firstName},\n\nWelcome to our website! We're glad you signed up.`,
        };
     
        sgMail.send(msg)
            .then(() => {
                // Redirect to welcome page
                res.redirect("/welcome");
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send("Internal server error");
                res.render("sign-up", {
                    title: "sign-up",
                    errors: {}
                });
            });
    }
});

app.get("/welcome", (req, res)=>{
    res.render("welcome");
});


app.get("/log-in", (req, res) => {
    res.render("log-in", {
        title: "log-in",
        errors: {}
    });
});

// POST route for log-in form submission
app.post("/log-in", (req, res) => {
    const { email, password } = req.body;
    const errors = {};

    // Email validation with regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.email = "Invalid email address. Please enter valid email";
    }

    // Password validation with regular expression
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;
    if (!password || !passwordRegex.test(password)) {
        errors.password = "Password must be 8-12 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol.";
    }

    // If there are validation errors, render the sign-up page with errors
    if (Object.keys(errors).length > 0) {
        res.render("log-in", { errors, email }); // Pass submitted data back to the form
    } else {
        // No validation errors, proceed with sign-up process
        const sgMail = require("@sendgrid/mail")
        sgMail.setApiKey(process.env.SEND_GRID_API_KEY)
        // Send welcome email to the user
        const msg = {
            to: email,
            from: process.env.SENDER_EMAIL,
            subject: 'Welcome back to Our Website!',
            text: `Hello ${firstName},\n\nWelcome back to our website! We're glad you signed up.`,
        };
     
        sgMail.send(msg)
            .then(() => {
                // Redirect to welcome page
                res.redirect("/");
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send("Internal server error");
                res.render("log-in", {
                    title: "log-in",
                    errors: {}
                });
            });
    }
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/meal-kits", (req, res) => {
    res.render("meal-kits");
});

app.get("/headers", (req, res) => {

    const headers = req.headers;
    res.json(headers);
});

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send("Something broke!")
});


// *** DO NOT MODIFY THE LINES BELOW ***

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
  
// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
app.listen(HTTP_PORT, onHttpStart);