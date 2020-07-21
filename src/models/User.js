const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');


const UserSchema = new Schema({
    email: {type: String, required: true, unique: true, match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/},
    password: {type: String, required: true},
    fullName: {type: String, required: true},
    verifyCodeExpiration: Date,
    verifyCode: String,
    resetCodeExpiration: Date,
    emailVerified: {type: Boolean, default: false},
    avatar: {type: String, default: ''},
    resetCode: String,
}, {timestamps: { createdAt: true, updatedAt: true }});

UserSchema.methods.generateAuthToken = function() {
    return jwt.sign({ _id: this._id }, process.env.JWT_KEY);
};
let User = mongoose.model("User", UserSchema);
module.exports = User;
