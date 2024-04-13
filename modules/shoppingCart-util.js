const nodemailer = require('nodemailer');
// Data structure for shopping cart
let cart = [];

function addToCart(mealKitJSON, quantity = 1) {
    const mealKit = JSON.parse(mealKitJSON);
    const existingItem = cart.find(item => item.mealKit.id === mealKit.id);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ mealKit, quantity });
    }
}


// Function to remove meal kit from cart
function removeFromCart(mealKitId) {
    cart = cart.filter(item => item.mealKit.id !== mealKitId);
}

// Function to calculate subtotal
function calculateSubtotal() {
    return cart.reduce((total, item) => total + (item.mealKit.price * item.quantity), 0);
}

// Function to calculate tax (assuming 10% tax)
function calculateTax(subtotal) {
    return subtotal * 0.1;
}

// Function to calculate grand total
function calculateGrandTotal(subtotal, tax) {
    return subtotal + tax;
}

// Function to send order confirmation email and reset cart
function placeOrder(customerEmail) {
    // Implement sending email functionality here
    // Reset cart after sending email
    cart = [];
}

module.exports = { cart, addToCart, removeFromCart, calculateSubtotal, calculateTax, calculateGrandTotal, placeOrder };
