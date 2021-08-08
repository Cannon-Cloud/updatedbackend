const express = require('express');
const router = express.Router();

const { Category } = require('../models/category');

router.get('/', async (req, res) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.send(categoryList);
});

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(500).send('Invalid ID');
  }
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(500).json({
      success: false,
      message: `Category with id: ${req.params.id} not found`,
    });
  } else {
    res.status(200).send(category);
  }
});

router.post('/', async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  category = await category.save();

  if (!category) {
    return res.status(500).send('the category was unable to be created');
  }
  res.status(200).send(category);
});

router.delete('/:id', (req, res) => {
  Category.findByIdAndDelete(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: 'Category deleted sucessfully' });
      } else {
        return res
          .status(404)
          .json({ sucess: false, message: 'Category not found.' });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(500).send('Invalid ID');
  }
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    },
    { new: true }
  );

  if (!category) {
    return res.status(500).json({
      success: false,
      message: `Could not update Category id: ${req.params.id}`,
    });
  } else {
    return res.status(200).send(category);
  }
});

module.exports = router;
