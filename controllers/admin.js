const Product = require('../models/product');


exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Product', 
        path:'/admin/add-product',
        editing: false,
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin
    });
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const category = req.body.category;
    
    req.user.createProduct({
        title: title,
        imageUrl: imageUrl,
        description: description,
        price: price,
        category: category
    })
    .then(result => {
        console.log('Product added!');
        res.redirect('/admin/products');
    })
    .catch(err =>{
        console.log(err);
    });
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if(!editMode){
        res.redirect('/');
    }
    const prodId = req.params.productId;
    req.user
        .getProducts({ where: {id: prodId}})
    // Product.findByPk(prodId)
        .then(products => {
            const product = products[0];
            if(!product){
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                product: product,
                pageTitle: product.title,
                path:'/admin/edit-product',
                editing: editMode,
                isAuthenticated: req.session.isLoggedIn,
                isAdmin: req.session.isAdmin
            });           
        })
        .catch(err => console.log(err));
}

exports.postEditProduct = (req,res,next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;    
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;
    const updatedPrice = req.body.price;
    const updatedCategory = req.body.category;
    
    Product.findByPk(prodId)
        .then(product => {
            console.log(product)
            product.title = updatedTitle;
            product.imageUrl = updatedImageUrl;
            product.description = updatedDesc;
            product.price = updatedPrice;
            product.category = updatedCategory;

            return product.save();
        })
        .then(result => {
            res.redirect('/admin/products');
            console.log('UPDATED PRODUCT!');
        })
        .catch( err => {
            console.log(err);
        });
}

exports.postDeleteProduct = (req,res,next) => {
    const prodId = req.body.productId;
    Product.findByPk(prodId)
        .then(product => {
            return product.destroy();
        })
        .then(result => {
            res.redirect('/admin/products');
            console.log('PRODUCT DELETED');
        })
        .catch( err => {
            console.log(err);
        });
}

exports.getProducts = (req, res, next) => {
    Product.findAll({ where: { userId: req.user.id } })
        .then(products => {
            res.render('admin/products', { 
                prods: products, 
                pageTitle: 'Admin Products', 
                path: '/admin/products',
                isAuthenticated: req.session.isLoggedIn,
                isAdmin: req.session.isAdmin
            });
        })
        .catch(err => {
            console.log(err);
        });
}

exports.saveAllProducts = (req, res, next) => {
    console.log('entro al route');
    saveProducts(req.body.products)
    .then(result => {
        console.log('añadidos');
        res.redirect('/');
    })
    .catch(err => console.log(err));
}
function saveProducts(products){
    for(i = 0; i < products.length; i++){
        req.user.createProduct({
            title: products[i].title,
            imageUrl: products[i].imageUrl,
            description: products[i].description,
            price: products[i].price,
            category: products[i].category
        })
        .then(result => {
            console.log('Product added!');
        })
        .catch(err =>{
            console.log(err);
        });
    }    
}