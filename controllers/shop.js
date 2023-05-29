const Product = require('../models/product');
const Sequelize = require('sequelize');
const {Op} = require('sequelize');

exports.getProducts = (req, res, next) => {
    console.log(req.session.user);
    Product
        .findAll()
        .then(products => {
            res.render('shop/product-list', { 
                prods: products, 
                pageTitle: 'All Products', 
                path: '/products',
                isAuthenticated: req.session.isLoggedIn,
                isAdmin: req.session.isAdmin
            });
        })
        .catch(err => {
            console.log(err);
        });
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product
        .findByPk(prodId)
        .then(product => {
            console.log(product);
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products',
                isAuthenticated: req.session.isLoggedIn,
                isAdmin: req.session.isAdmin
            });
        })
        .catch(err => console.log(err));
        
}

exports.getIndex = (req, res, next) =>{
    console.log(req.session.isLoggedIn);
    Product
        .findAll()
        .then(products => {
            res.render('shop/index', { 
                prods: products, 
                pageTitle: 'Shop', 
                path: '/',
                isAuthenticated: req.session.isLoggedIn,
                isAdmin: req.session.isAdmin
            });
        })
        .catch(err => {
            console.log(err);
        });    
}

exports.getCart = (req, res, next) =>{

    req.user
        .getCart()
        .then(cart =>{
            return cart
                .getProducts()
                .then(products =>{
                    res.render('shop/cart', {  
                    pageTitle: 'Your Cart', 
                    path: '/cart',
                    products: products,
                    isAuthenticated: req.session.isLoggedIn,
                    isAdmin: req.session.isAdmin
                    });
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
}

exports.postCart = (req, res, next) =>{
    const prodId = req.body.productId;
    const total = req.body.price;
    let fetchedCart;
    let newTotal = total;
    let newQuantity = 1;
    req.user
        .getCart()
        .then(cart => {
        fetchedCart = cart;
        return cart.getProducts({ where: { id: prodId } });
        })
        .then(products => {
        let product;
    if (products.length > 0) {
            product = products[0];
        }

        if (product) {
            const prevQuantity = product.cartItem.quantity;
            const prevTotal = product.cartItem.totalPrice;
            newQuantity = prevQuantity + 1;
            newTotal = prevTotal + +total;

            return product;
        }
        return Product.findByPk(prodId);
        })
        .then(product => {
        return fetchedCart.addProduct(product, {
            through: { quantity: newQuantity, totalPrice: newTotal }
        });
        })
        .then(() => {
        res.redirect('/cart');
        })
        .catch(err => console.log(err));
}

exports.postCartDeleteProduct = (req, res, next) =>{
    const prodId = req.body.productId;
    req.user
        .getCart()
        .then(cart =>{
            return cart.getProducts({ where: {id: prodId} });
        })
        .then(products =>{
            const product = products[0];
            return product.cartItem.destroy();
        })
        .then(result =>{
            res.redirect('/cart');
        })
        .catch(err =>console.log(err));
}

exports.postOrder = (req, res, next) => {
    let fetchedCart;
    let totalCart=0;
    req.user
        .getCart()
        .then(cart =>{
            fetchedCart = cart;
            console.log(fetchedCart)
            return cart.getProducts();
        })
        .then(products => {
            console.log(products)
            return req.user
                .createOrder()
                .then(order => {
                    return order.addProducts(products.map(product =>{
                        let totalOrder = totalCart + product.cartItem.totalPrice;
                        product.orderItem = { quantity: product.cartItem.quantity, totalPrice: totalOrder}
                        return product;
                    }));
                })
                .catch(err => console.log(err));
        })
        .then(result => {
            return fetchedCart.setProducts(null);
        })
        .then(result => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) =>{
    req.user
        .getOrders({ include: ['products'] })
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders,
                isAuthenticated: req.session.isLoggedIn,
                isAdmin: req.session.isAdmin
              });
        })
        .catch(err => console.log(err));
}

exports.postSearch = (req, res, next) =>{
    const searchedProduct = req.body.search;
    const originPath = req.body.originPath;

    console.log(searchedProduct);
    console.log('origin ',originPath);

    Product.findAll({where: {description: {
        [Op.like]: `%${searchedProduct}%`
      }}})
        .then(products => {
            console.log(products);
            if(originPath === '/products'){
                res.render('shop/product-list', { 
                    prods: products, 
                    pageTitle: 'All Products', 
                    path: '/products',
                    isAuthenticated: req.session.isLoggedIn,
                    isAdmin: req.session.isAdmin
                });
            }
            if(originPath === '/admin/products'){
                res.render('admin/products', { 
                    prods: products, 
                    pageTitle: 'Admin Products', 
                    path: '/admin/products',
                    isAuthenticated: req.session.isLoggedIn,
                    isAdmin: req.session.isAdmin
                });
            }else{
                res.render('shop/index', {
                    path: '/',
                    pageTitle: 'Shop',
                    prods: products,
                    isAuthenticated: req.session.isLoggedIn,
                    isAdmin: req.session.isAdmin
                });
            }
            
        })
        .catch(err => console.log(err));
}

exports.searchCategory = (req, res, next) =>{
    const category = req.params.category;
    console.log('category ',category);
    const originPath = req.params.originPath;

    console.log('origin ',originPath);

    Product.findAll({where: {category: category}})
        .then(products => {
            console.log(products);
            if(originPath === 'shop'){
                res.render('shop/index', {
                    path: '/',
                    pageTitle: 'Shop',
                    prods: products,
                    isAuthenticated: req.session.isLoggedIn,
                    isAdmin: req.session.isAdmin
                });
            }
            else if(originPath === 'products'){
                res.render('shop/product-list', { 
                    prods: products, 
                    pageTitle: 'All Products', 
                    path: '/products',
                    isAuthenticated: req.session.isLoggedIn,
                    isAdmin: req.session.isAdmin
                });
            }
            else{
                res.redirect('/');
            }
            
        })
        .catch(err => console.log(err));
}

exports.searchAdminCategory = (req, res, next) =>{
    const category = req.params.category;
    console.log('category ',category);
    Product.findAll({where: {category: category}})
        .then(products => {
            console.log(products);
            res.render('admin/products', { 
                prods: products, 
                pageTitle: 'Admin Products', 
                path: '/admin/products',
                isAuthenticated: req.session.isLoggedIn,
                isAdmin: req.session.isAdmin
            });
                        
        })
        .catch(err => console.log(err));
}