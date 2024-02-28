// modules/mealKit-util.js

// Static data for meal kits
const mealKits = [
    {
        id: 1,
        title: "Sautéed Ground Pork over Jasmine Rice",
        includes: "Toasted Peanuts & Quick-Pickled Cucumber Salad",
        description: "Indulge in the rich flavors of gingery pork combined with the freshness of crunchy cucumbers and the nuttiness of toasted peanuts. Served over fragrant jasmine rice, this dish is a harmonious blend of savory and refreshing elements.",
        category: "Classic Meals",
        price: 19.99,
        cookingTime: 25,
        servings: 2,
        imageUrl: "/images/sauteed-ground-pork.jpg",
        featuredMealKit: true
    },
    {
        id: 2,
        title: "Grilled Chicken with Lemon Herb Sauce",
        includes: "Roasted Potatoes & Steamed Broccoli",
        description: "Treat yourself to succulent grilled chicken bathed in a zesty lemon herb sauce. Accompanied by flavorful roasted potatoes and tender steamed broccoli, this dish offers a burst of freshness and comforting flavors in every bite.",
        category: "Classic Meals",
        price: 21.99,
        cookingTime: 30,
        servings: 2,
        imageUrl: "/images/grilled-chicken.jpg",
        featuredMealKit: false
    },
    {
        id: 3,
        title: "Vegetarian Pad Thai",
        includes: "Tofu, Rice Noodles, and Fresh Vegetables",
        description: "Embark on a culinary journey with our vegetarian twist on the classic Thai dish, Pad Thai. Packed with tofu, rice noodles, and an array of fresh vegetables, this dish is bursting with vibrant flavors and textures that will tantalize your taste buds.",
        category: "Classic Meals",
        price: 18.99,
        cookingTime: 20,
        servings: 2,
        imageUrl: "/images/vegetarian-pad-thai.jpg",
        featuredMealKit: true
    },
    {
        id: 4,
        title: "Salmon Teriyaki with Vegetable Stir-Fry",
        includes: "Brown Rice & Sauteed Bok Choy",
        description: "Delight in the delicate flavors of flaky salmon glazed with a sweet and savory teriyaki sauce. Accompanied by wholesome brown rice and a flavorful vegetable stir-fry, this dish offers a balanced combination of protein, grains, and vegetables.",
        category: "Healthy Choices",
        price: 24.99,
        cookingTime: 35,
        servings: 2,
        imageUrl: "/images/salmon-teriyaki.jpg",
        featuredMealKit: false
    },
    {
        id: 5,
        title: "Beef Tacos with Homemade Salsa",
        includes: "Corn Tortillas, Lettuce, and Cheese",
        description: "Experience the fiesta of flavors with our beef tacos featuring tender beef seasoned to perfection. Wrapped in warm corn tortillas and topped with fresh homemade salsa, crisp lettuce, and melted cheese, these tacos are a crowd-pleaser for any occasion.",
        category: "Classic Meals",
        price: 17.99,
        cookingTime: 25,
        servings: 3,
        imageUrl: "/images/beef-tacos.jpg",
        featuredMealKit: true
    },
    {
        id: 6,
        title: "Mushroom Risotto with Parmesan Cheese",
        includes: "Arborio Rice & Fresh Mushrooms",
        description: "Indulge in the creamy and luxurious goodness of mushroom risotto made with arborio rice, fresh mushrooms, and grated Parmesan cheese. Each spoonful is a symphony of flavors and textures that will transport you to culinary bliss.",
        category: "Healthy Choices",
        price: 22.99,
        cookingTime: 40,
        servings: 2,
        imageUrl: "/images/mushroom-risotto.jpg",
        featuredMealKit: false
    }
];

// Function to get all meal kits
function getAllMealKits() {
    return mealKits;
}

// Function to get featured meal kits
function getFeaturedMealKits(mealKits) {
    const featuredMealKits = [];
    mealKits.forEach(mealKit => {
        if (mealKit.featuredMealKit) {
            featuredMealKits.push(mealKit);
        }
    });
    return featuredMealKits;
}

// Function to get meal kits by category
function getMealKitsByCategory(mealKits) {
    const mealKitsByCategory = {};
    mealKits.forEach(mealKit => {
        if (!mealKitsByCategory[mealKit.category]) {
            mealKitsByCategory[mealKit.category] = [];
        }
        mealKitsByCategory[mealKit.category].push(mealKit);
    });

    const result = [];
    for (const category in mealKitsByCategory) {
        result.push({
            categoryName: category,
            mealKits: mealKitsByCategory[category]
        });
    }
    return result;
}


module.exports = { getAllMealKits, getFeaturedMealKits, getMealKitsByCategory };
