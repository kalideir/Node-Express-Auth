// imports
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const mkdirp = require("mkdirp");
const fs = require('fs');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const {validateSignUp, validateLogin} = require('../validation/user.js');

// models
const User = require('../models/User');

// Gmail credentials
const transporter = nodemailer.createTransport(smtpTransport({
    service: 'Gmail',
    auth: { user: process.env.EMAIL, pass: process.env.PASSWORD }
}));

// user register
exports.register = async (req, res, next) => {
    const { error } = validateSignUp(req.body);
    if (error) return res.status(400).json({message: error.details[0].message});

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({message: 'User already registered.'});

    user = new User({
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password,
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    const verifyCode = Math.floor(100000 + Math.random() * 900000);
    user.verifyCode = await verifyCode;
    user.verifyCodeExpiration = await Date.now() + 3600000;

    await user.save().then((result) => {
        res.status(200).json({message: 'Successfully registered.'});
        // return nodemailer.sendMail({
        //     to: result.email,
        //     from: 'lippo.grup@gmail.com',
        //     subject: 'Successfully registered!',
        //     html: `
        //     <h1>You successfully signed up!</h1>
        //     <p>activation code ${verifyCode}</p>
        //       `
        // });
    })
        .catch(err => res.status(400).json(err));
};

// login user
exports.login = async (req, res, next) => {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).json({message: error.details[0].message});

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({message: 'Invalid email or password.'});

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({message: 'Invalid email or password.'});

    const token = user.generateAuthToken();
    const userId = user._id;
    console.log('here');
    res.status(200).json({token, userId : userId.toString(), emailVerified: user.emailVerified});
};

// user by request id
exports.profileObj = async (req, res, next) => {
    await User.findById(req.user)
        .select('-password')
        .exec()
        .then(user => {
            if (!user) return res.status(404).json({message: 'user not found'});
            return res.status(200).json({profileObj: user});
        })
        .catch(err => res.status(500).json({message: err}));
};


// update user's profile info
exports.updateProfile = (req, res, next) => {
    User.findOneAndUpdate({_id: req.user}, { $set: req.body }, {new: true})
        .exec()
        .then(user => {
            if (user) {
                res.status(200).json({message: "Your info was successfully updated", user})
            }
            else {
                res.status(404).json({message: "user not found"})
            }
        })
        .catch(error => {
            res.status(500).json({
                message: error
            });
        });
};



// update user profile avatar
exports.updateAvatar = (req, res, next) => {
    if (req.file) {
        User.findOne({_id: req.user}, function (error, user) {
            if (error) {
                console.log(error);
                res.status(500).json({
                    message: JSON.stringify(error)
                });
            }
            else {
                if (user) {
                    user.avatar = req.file.path.replace(/\\/g, "/");
                    user.save();
                    console.log('Uploading file...');
                    const filename = req.file.filename;
                    res.status(200).json({message: 'your profile avatar was successfully updated' + ' ' + filename});
                }
                else {
                    res.status(401).json({message: 'not allowed'});
                }
            }
        })
    } else {
        res.status(403).json({message: 'please include an image'});
    }
};

// send Verification to email
exports.sendVerificationEmail = async (req, res, next) => {
    const verifyCode = Math.floor(100000 + Math.random() * 900000);
    User.findOne({_id: req.user}, function (error, user) {
        if (error) {
            console.log(error);
            res.status(500).json({
                error: error
            });
        } else {
            if (user) {
                user.verifyCode = verifyCode;
                user.verifyCodeExpiration = Date.now() + 3600000;
                user.save().then(result => {
                    transporter.sendMail({
                        to: result.email,
                        from: process.env.EMAIL,
                        subject: 'Verify your email!',
                        html: `<h1>Please use the code below to verify your email in our mobile app.</h1> <br /> <p>activation code ${verifyCode}</p>`
                    });
                    res.status(200).json({ message: 'We have sent a verification code to your email.' });
                })
            } else {
                console.log(req.user)
                res.status(401).json({message: 'not allowed'});
            }

        }
    })
};


// verify by email
exports.verifyByCode = async (req, res, next) => {
    const verifyCode = req.body.verifyCode;
    console.log(typeof verifyCode);
    await User.findOne({_id: req.user}, async function (error, user) {
        if (error) {
            res.status(500).json({message: 'Server error'});
        } else {
            if (user) {
                console.log(user.verifyCode, verifyCode);
                if (user.verifyCode === verifyCode) {
                    if (user.verifyCodeExpiration < Date.now()) {
                        res.status(403).json({ message: 'Verification code has expired.'});
                    } else {
                        user.emailVerified = true;
                        user.verifyCode = '';
                        user.verifyCodeExpiration = '';
                        await user.save();
                        res.status(200).json({ message: 'Verify was successfully verified.' });
                    }
                } else {
                    res.status(403).json({ message: 'Invalid verification code'});
                }
            }else {
                res.status(400).json({ message: 'There is no user with this ID.' });
            }
        }
    });
};


// reset password
exports.resetPassword = async (req, res, next) => {
    const email = req.body.email;
    const resetCode = Math.floor(100000 + Math.random() * 900000);
    await User.findOne({email}, function (error, user) {
        if (error) {
            console.log(error);
            res.status(500).json({error: err});
        } else {
            if (user) {
                user.resetCode = resetCode;
                user.resetCodeExpiration = Date.now() + 3600000;
                user.save().then(result => {
                    transporter.sendMail({
                        to: result.email,
                        from: process.env.EMAIL,
                        subject: 'Password reset',
                        html: `<h1>Did you want to reset your password?!</h1><br><p>reset code ${resetCode}</p>`
                    });
                    res.status(200).json({ message: 'Please check the email we have sent to reset your password.', success: true });
                });
            }else {
                console.log(email);
                res.status(400).json({ message: 'Invalid info'});
            }
        }
    });
};


// this function is to guarantee that the code entered by the user matched the one that was sent to the user's email.
// verify reset password code
exports.verifyResetPasswordCode = (req, res, next) => {
    const email = req.body.email;
    const resetCode = req.body.resetCode;
    User.findOne({email}, function (error, user) {
        if (error) {
            console.log(error);
            res.status(500).json({error: error});
        } else {
            if (user) {
                if (user.resetCode && resetCode &&  user.resetCode === resetCode) {
                    console.log(3, user.resetCode, resetCode);
                    res.status(200).json({ message: 'Reset code was matched', matching: true});
                } else {
                    res.status(400)
                        .json({ message: 'Invalid reset password code.' +
                                ' Please use the one we sent to your email or resend a new reset password email.', matched: false});
                }
            } else {
                console.log(444, email);
                res.status(400).json({ message: 'Invalid info'});
            }
        }
    })

};

// set new password password
exports.newPassword = async (req, res, next) => {
    const resetCode = req.body.resetCode;
    const email = req.body.email;
    const newPassword = req.body.password;
    console.log(resetCode, email, newPassword);
    if (email && resetCode && newPassword) {
        await User.findOne({email}, async function (error, user) {
            if (error) {
                console.log(error);
                res.status(500).json({error: err});
            } else {
                if (user) {
                    console.log(11, user);
                    console.log(user.resetCode, resetCode);
                    if (user.resetCode === resetCode) {
                        if (user.resetCodeExpiration < Date.now()) {
                            res.status(400).json({ message: 'Reset code has expired.'});
                        } else {
                            const salt = await bcrypt.genSalt(10);
                            user.password = await bcrypt.hash(newPassword, salt);
                            user.resetCode = await undefined;
                            user.resetCodeExpiration = await undefined;
                            await user.save();
                            res.status(200).json({ message: 'Your password has been saved successfully.' });
                        }
                    } else {
                        res.status(400).json({ message: 'Invalid reset password code.'});
                    }
                } else {
                    res.status(400).json({ message: 'Invalid info'});
                }
            }
        });
    } else {
        res.status(400).json({message: 'All fields are required.'});
    }
};


// delete user
exports.delete = (req, res, next) => {
    User.remove({ _id: req.user})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "User deleted"
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
