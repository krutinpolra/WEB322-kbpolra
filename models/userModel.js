const mongoose = require("mongoose");
const bcryptjs = require("bcrypt");

//create a Schema for our user data collection
const userSchema = new mongoose.Schema({

    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});

userSchema.pre("save", function(next) {
    let user = this;

    // generate a unique salt
    bcryptjs.genSalt()
        .then(salt => {
            bcryptjs.hash(user.password, salt)
                .then(hashedPwd => {
                    user.password = hashedPwd;
                    next();
                })
                .catch(err => {
                    console.log(`Error occurred when hashing...${err}`)
                })
        })
        .catch(err => {
            console.log(`Error occurred when hashing...${err}`)
        })
    
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;