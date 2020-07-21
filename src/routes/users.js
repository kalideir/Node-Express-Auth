const router = require("express").Router();
const mkdirp = require('mkdirp');
const multer = require('multer');

// auth
const verify = require('../auth/userAuth');

// controllers
const UsersController = require("../controllers/UsersController");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(req.user);
        const dir = `uploads/users/${req.user}/`;
        mkdirp(dir, err => cb(err, dir));
    },
    filename: function (req, file, cb) {
        let fileExtension = file.originalname.split('.')[1];
        cb(null, Date.now() + '.' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};

const upload = multer({ storage: storage, limits: {fileSize: 1024 * 1024 * 15}, fileFilter: fileFilter});


// routes declarations

// register
router.post('/register', UsersController.register);

// login
router.post('/login', UsersController.login);

// user's profile obj
router.get('/', verify, UsersController.profileObj);

// send verification email
router.post('/send-verification-email', verify, UsersController.sendVerificationEmail);

// send verification email
router.post('/verify-email', verify, UsersController.verifyByCode);

// reset password
router.post('/reset-password-email', UsersController.resetPassword);

// verify reset password code
router.post('/verify-reset-password-code', UsersController.verifyResetPasswordCode);

// post new password
router.post('/new-password', UsersController.newPassword);

// update user avatar
router.post('/update-avatar', verify, upload.single('avatar'), UsersController.updateAvatar);

// update user info
router.patch('/', verify, UsersController.updateProfile);

// delete user
router.delete('/', verify, UsersController.delete);


module.exports = router;