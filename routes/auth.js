const express = require('express');
const recaptcha = require('express-recaptcha');


const authController = require('../controllers/auth');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.get('/register', authController.getRegister);

router.post('/register', authController.postRegister);

router.post('/logout', authController.postLogout);

router.get('/forgot-password', authController.getForgotPassword);

router.post('/forgot-password', authController.postForgotPassword);

module.exports = router;