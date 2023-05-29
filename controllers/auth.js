const bcrypt = require('bcryptjs');

const nodemailer = require('nodemailer');

const User = require('../models/user');

const { RecaptchaV3 } = require('express-recaptcha');
const recaptcha = new RecaptchaV3('6LdOSj8mAAAAAG7VB3FjFvPY9h1Bgj70UX-3980a', '6LdOSj8mAAAAAO0a4g-Rz_FY_U5hj8jE-Zn3m1ks');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'jimenez.jcarlos28@gmail.com',
    pass: 'mqfuosvzfyuhcbcd',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.getLogin = (req, res, next) => {
  if(req.session.isLoggedIn){
    return res.redirect('/');
  }else{
    let errorMessage = req.flash('error');
    let message = req.flash('message');
    if(message.length > 0){
      message = message[0];
      errorMessage = null;
    } else{
      errorMessage= errorMessage[0];
      message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false,
        errorMessage: errorMessage,
        message: message,
        isADmin: req.session.isAdmin
      });
  }
}

exports.postLogin = (req, res, next) =>{
  const email = req.body.email;
  const password = req.body.password;

    User.findOne({ where: { email: email } })
    .then(user => {
        console.log(user)
        if(!user){
          req.flash('error', 'Invalid credentials.');
          return res.redirect('login');
        }
        bcrypt.compare(password, user.password)
        .then(match =>{
          if(match){
            req.session.isLoggedIn = true;
            req.session.isAdmin = user.userType === 'Admin' ? true : false; 
            req.session.user = user;
            return req.session.save(err =>{
                console.log(err);
                res.redirect('/');
            });
          }
          req.flash('error', 'Invalid credentials.');
          res.redirect('login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('login');
        });
    })
    .catch(err => console.log(err));
}

exports.getRegister = (req, res, next) => {
  if(req.session.isLoggedIn){
    return res.redirect('/');
  }else {
    let message = req.flash('error');
  if(message.length > 0){
    message = message[0];
  } else{
    message= null;
  }
    res.render('auth/register', {
        path: '/register',
        pageTitle: 'Register',
        isAuthenticated: false,
        errorMessage: message,
        isAdmin: false
    });
  }
}

exports.postRegister = (req, res, next) => {
  recaptcha.verify(req, (error, data) => {
    if (!error) {
      const username = req.body.username;
      const email = req.body.email;
      const password = req.body.password;
      const userType = req.body.userType;

      User.findOne({ where: { email: email } })
      .then(user => {
        console.log(user);
        if (user) {
          req.flash('error', 'E-mail address already exist, please choose a different');
          return res.redirect('/register');
        }
        return bcrypt.hash(password, 12)
          .then(hashedPassword => {
            return User.create({
              username: username,
              email: email,
              password: hashedPassword,
              userType: userType
            });
          })
          .then(user => {
            return user.createCart();
          })
          .then(result => {
              console.log(result)
            res.redirect('/login');
          })
          .catch(err => {
            console.log(err);
          });
        
      })    
        .catch(err => {
        console.log(err);
      });
    } 
    else {
      console.log(error);
      res.redirect('/register');
    }
  });
    
}

exports.postLogout = (req, res, next) =>{
    req.session.destroy(err =>{
        console.log(err);
        res.redirect('/');
    });
}

exports.getForgotPassword = (req, res, next) =>{
  let message = req.flash('error');
    if(message.length > 0){
      message = message[0];
    } else{
      message= null;
    }
    res.render('auth/forgot-password', {
        path: '/forgot-password',
        pageTitle: 'Forgot Password',
        isAuthenticated: false,
        errorMessage: message,
        isAdmin: req.session.isAdmin
      });
}

exports.postForgotPassword = (req, res, next) => {
  const email = req.body.email;

  User.findOne({ where: { email: email } })
    .then(user => {
      if (user) {
        transporter.sendMail({
          from: 'jimenez.jcarlos28@gmail.com',
          to: user.email,
          subject: 'Password from Cube´s Carfters login',
          text: 'Tu contraseña es la siguiente: ' + user.password,
        }, (error, info) => {
          if (error) {
            console.log('Error al enviar el correo:', error);
            req.flash('error', 'Error trying to send email');
            return res.redirect('/forgot-password');
          } else {
            console.log('Correo enviado:', info.response);
            req.flash('message', 'The password was sended to the email provided');
            return res.redirect('/login');
          }
        });
      } else {
        req.flash('error', 'There is no user for the email provided');
        return res.redirect('/forgot-password');
      }
    })
    .catch(err => {
      console.log(err);
    });
};