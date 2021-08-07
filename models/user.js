const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: String,
  image: String,
  countInStock: {
    type: Number,
    required: true,
  },
});

exports.Product = mongoose.model('Product', userSchema);
