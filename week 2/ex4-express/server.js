var path = require("path");
var express = require("express");
var app = express();

// Setup a 'route' to listen on the default URL
// Example: http://localhost:8080/
app.get("/", function(req, res) {
    res.send("Hello World<br/><a href='/about'>Go to the about page</a><br/>");
});

// Setup an 'about' route.
app.get("/about", function(req, res) {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

// Configure and start listening to new HTTP requests.
var HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// Setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);