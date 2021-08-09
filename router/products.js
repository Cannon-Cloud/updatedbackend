const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const { Category } = require('../models/category');
const { Product } = require('../models/product');

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, '/public/my-uploads');
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

const router = express.Router();

router.get('/', async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    const filter = { category: req.query.categories.split(',') };
  }

  const productList = await Product.find(filter).populate('category');

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(productList);
});

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(500).send('Invalid ID');
  }
  const product = await Product.findById(req.params.id).populate('category');

  if (!product) {
    return res.status(500).json({
      success: false,
      message: `Could not find product with ID: ${req.params.id}`,
    });
  }
  res.status(200).send(product);
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
  const category = await Category.findById(req.body.category);

  if (!category) {
    return res.status(500).send('Invalid Category');
  }

  const file = req.file;
  if (!file) {
    return res.status(500).send('Invalid File');
  }
  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get('host')}/public/my-uploads/`;

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  await product.save();

  if (!product) {
    return res.status(500).send('the product was unable to be created');
  }
  res.status(200).send(product);
});

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(500).send('Invalid ID');
  }
  const category = await Category.findById(req.body.category);

  if (!category) {
    return res.status(500).send('Invalid Category');
  }
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send('Invalid Product!');

  const file = req.file;
  let imagePath;

  if (file) {
    const fileName = file.fileName;
    const basePath = `${req.protocol}://${req.get('host')}/public/my-uploads/`;
    imagePath = `${basePath}${fileName}`;
  } else {
    imagePath = product.image;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagePath,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );

  if (!updatedProduct) {
    return res.status(500).json({
      success: false,
      message: `Could not update Product id: ${req.params.id}`,
    });
  } else {
    return res.status(200).send(updatedProduct);
  }
});

router.delete('/:id', (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then((Product) => {
      if (Product) {
        return res
          .status(200)
          .json({ success: true, message: 'Product deleted sucessfully' });
      } else {
        return res
          .status(404)
          .json({ sucess: false, message: 'Product not found.' });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get('/get/count', async (req, res) => {
  const productCount = await Product.countDocuments((count) => count);

  if (!productCount) {
    return res.status(500).json({
      success: false,
      message: 'Could not find products to count',
    });
  }
  res.status(200).send({
    productCount: productCount,
  });
});

router.get('/get/featured/:count', async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const featured = await Product.find({ isFeatured: true }).limit(+count);

  if (!featured) {
    return res.status(500).json({
      success: false,
      message: 'Could not find products to count',
    });
  }
  res.status(200).send({ featured });
});

router.put(
  'gallery-images/:id',
  uploadOptions.array('image', 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(500).send('Invalid ID');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/my-uploads/`;
    if (files) {
      files.map((file) => imagesPaths.push(`${basePath}${file.filename}`));
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );
    if (!product) {
      return res.status(500).send('the product was unable to be created');
    }
    res.status(200).send(product);
  }
);

module.exports = router;
