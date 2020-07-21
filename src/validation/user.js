const Joi = require('@hapi/joi');

function validateSignUp(user) {
    const schema = {
        email: Joi.string().min(12).max(120).required().email(),
        password: Joi.string().min(5).max(255).required(),
        fullName: Joi.string().min(5).max(20).required(),
    };
    return Joi.validate(user, schema);
}

function validateLogin(user) {
    const schema = {
        email: Joi.string().min(5).max(30).required().email(),
        password: Joi.string().min(5).max(255).required()
    };

    return Joi.validate(user, schema);
}

exports.validateSignUp = validateSignUp;
exports.validateLogin = validateLogin;