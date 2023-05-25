const Sequelize = require('sequelize');

const sequelize = new Sequelize('marketplace', 'root', '1234', {
    dialect: 'mysql',
    host: 'localhost',
    port:'3307'
});

module.exports = sequelize;