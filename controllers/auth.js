const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false
      });
}

exports.postLogin = (req, res, next) =>{
    User.findByPk(1)
    .then(user => {
        console.log(user)
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save(err =>{
            console.log(err);
            res.redirect('/');
        });
    })
    .catch(err => console.log(err));
}

exports.getRegister = (req, res, next) => {

    res.render('auth/register', {
        path: '/register',
        pageTitle: 'Register',
        isAuthenticated: false
    });
}

exports.postRegister = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const userType = req.body.userType;

    User.findOne({ where: { email: email } })
    .then(user => {
      if (user) {
        return res.redirect('/signup');
      }
      return User.create({
        username: username,
        email: email,
        password: password,
        userType: userType
      });
    })
    .then(result => {
        console.log(result)
      res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
    });
}

exports.postLogout = (req, res, next) =>{
    req.session.destroy(err =>{
        console.log(err);
        res.redirect('/');
    });
}