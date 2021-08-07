const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  name: String,
  image: String,
  countInStock: {
    type: Number,
    required: true,
  },
});

exports.Product = mongoose.model('Product', categorySchema);
