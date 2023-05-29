module.exports = ((req, res, next) => {
    if(!req.session.isLoggedIn){
        return res.redirect('/login');
    }
    // if(req.session.isLoggedIn && !req.user.isAdmin){
    // console.log('isAdmin ', req.user.isAdmin);

    //     return res.redirect('/');
    // }
    next();
});
