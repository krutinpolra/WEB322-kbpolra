const mongoose = require("mongoose");

const mealKitSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
      },
    includes: {
        type: String,
        required: true,
      },
    description: {
        type: String,
        required: true,
      },
    category: {
        type: String,
        required: true,
      },
    price: {
        type: Number,
        required: true,
      },
    cookingTime: {
        type: Number,
        required: true,
      },
    servings: {
        type: Number,
        required: true,
      },
    imageUrl: {
        type: String,
      },
    featuredMealKit: {
        type: Boolean,
        required: true,
        default: false,
      }
})

const mealKitModel = mongoose.model("mealKits", mealKitSchema);
module.exports = mealKitModel;