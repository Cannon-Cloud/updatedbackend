const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

const app = express();
//Routers Import
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');

require('dotenv/config');

app.use(cors());
app.options('*', cors());

const api = process.env.API_URL;
const mongodbconnect = process.env.MONGO_URL;

//MIDDLEWARE
app.use(express.json());
app.use(morgan('dev'));
app.use(authJwt());
app.use('/public/my-uploads', express.static(__dirname + '/public/my-uploads'));
app.use(errorHandler);

//Routers
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

//Connect to Database
mongoose
  .connect(mongodbconnect, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('MongoDB Connected...');
  })
  .catch((err) => {
    console.log(err);
  });

//Setup server to listen on port 3000 - can also use environment
app.listen(3000, () => {
  console.log('Server is running http://localhost:3000');
});
