const path = require('path');

const http = require('http');

const express = require('express');

const bodyParser = require('body-parser');

// const recaptcha = require('express-recaptcha');

const errorController = require('./controllers/error');
const sequelize= require('./util/database');

const session = require('express-session');
var SequelizeSession = require('connect-session-sequelize')(session.Store);

const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');
const Session = require('./models/session');

 
const app = express();
const store = new SequelizeSession({
    db: sequelize,
    table: 'session',
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 4 * 60 * 60 * 1000
});

app.use(express.static('public/images'));

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'my secret', 
    store: store,
    resave: false, 
    saveUninitialized: false
}));

app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    User.findByPk(req.session.user.id)
        .then(user => {
        req.user = user;
        next();
        })
        .catch(err => console.log(err));
});

// recaptcha.init('6LdOSj8mAAAAAG7VB3FjFvPY9h1Bgj70UX-3980a', '6LdOSj8mAAAAAO0a4g-Rz_FY_U5hj8jE-Zn3m1ks', {
//     hl: 'es', // Opcional: establece el idioma
// });

// app.use((req, res, next) => {
//     res.locals.recaptcha = recaptcha.render();
//     next();
// });

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);
const server = http.createServer(app);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Session);
Session.belongsTo(User);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem});
Product.belongsToMany(Cart, { through: CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem});

sequelize
    // .sync( { force: true })
    .sync()
    // .then(result => {
    //     return User.findByPk(1);
    // })
    // .then(user =>{
    //     if(!user){
    //         return User.create({username: 'Jose', email: 'prueba@prueba.com', password: '1234', userType: 'Admin'});
    //     }
    //     return user;
    // })
    // .then(user =>{
    //     let result = [user];
    //     user.getCart()
    //     .then(cart => {
    //         result.push(cart);
    //         return result;       
    //     })
    //     .then(result => {
    //         const user = result[0];
    //         const cart = result[1];
    //         if(!cart){
    //             return user.createCart();
    //         }
    
    //         return result;
    //     })
        .then(result =>{
            server.listen(3000);
        })
        // .catch(err => console.log(err));
    // })
    .catch(err => {
        console.log(err);
    });