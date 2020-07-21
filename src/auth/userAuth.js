const jwt = require('jsonwebtoken');
const User = require('../models/User');


module.exports = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({message: "Access Denied"});
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_KEY);
        User.findById(verified._id)
            .exec()
            .then(result => {
                req.user = verified._id;
                next();
            })
            .catch(err => {
                res.status(403).json({message: "No such account was found."});
            })
    }catch (error) {
        res.status(400).json({message: "Invalid token"});
    }
};
