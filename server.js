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
const session = require("express-session");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");

//set-up dotenv
const dotenv = require("dotenv");
dotenv.config({path: "./config/keys.env"})

const allMealKits = mealKitUtil.getAllMealKits();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    //save the use to the global variable for user;
    res.locals.user = req.session.user;
    res.locals.role = req.session.role;
    next();
})

//set up EJS
app.set("view engine", "ejs");
app.set("layout", "layouts/main");
app.use(expressLayouts);

//set-up body-parser
app.use(express.urlencoded({extended: false}));

//Make the "assets" folder public (aka static)
app.use(express.static(path.join(__dirname, "/assets")));

//use file upload 
app.use(fileUpload());

const generalController = require("./controllers/generalController");
const mealKitsController = require("./controllers/mealKitsController");
const loadDataController = require("./controllers/loadDataController");

// Add your routes here
// e.g. app.get() { ... }
app.use("/", generalController);
app.use("/mealKitsController/", mealKitsController);
app.use("/loadDataController/", loadDataController)

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname))
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
//connect to mongodb
mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
.then(() => {
    app.listen(HTTP_PORT, onHttpStart);
})
.catch(err => {
    console.log("can't connect to the Database: " + err);
})