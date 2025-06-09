import SubCategory from '../models/subCategoryModel.js';
import Category from '../models/categoryModel.js';
import uploadOnCloudinary from '../utils/media/uploadImage.js';

// Create sub-category
const createSubCategory = async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;
    if (!name || !description || !categoryId) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!req?.file?.path) {
      return res.status(400).json({ error: 'Image is required' });
    }
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const existingSubCategory = await SubCategory.findOne({ name });
    if (existingSubCategory) {
      return res.status(400).json({ error: 'SubCategory already exists' });
    }
    const result = await uploadOnCloudinary(req.file.path);
    if (!result) {
      return res.status(400).json({ error: 'Image upload failed' });
    }
    const subCategory = new SubCategory({
      name,
      description,
      image: result.secure_url,
    });
    await subCategory.save();

    category.subCategories.push(subCategory._id);
    await category.save();

    res.status(201).json({ message: 'SubCategory created successfully', data: subCategory });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all sub-categories
const getAllSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId).populate('subCategories');
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const subCategories = category.subCategories;
    if (!subCategories || subCategories.length === 0) {
      return res.status(404).json({ error: 'No sub-categories found' });
    }
    res.status(200).json({ message: 'SubCategories fetched successfully', data: subCategories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllSubCategoriesWithoutByCategory = async (req, res) => {
  try {
    const subCategories = await SubCategory.find({}, '_id name');
    if (!subCategories || subCategories.length === 0) {
      return res.status(404).json({ error: 'No sub-categories found' });
    }
    res.status(200).json({
      message: 'SubCategories fetched successfully',
      data: subCategories
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Get sub-category by ID
const getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const subCategory = await SubCategory.findById(id).populate('products');
    if (!subCategory) {
      return res.status(404).json({ error: 'SubCategory not found' });
    }
    res.status(200).json({ message: 'SubCategory fetched successfully', data: subCategory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update sub-category
const updateSubCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { id } = req.params;
    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({ error: 'SubCategory not found' });
    }
    let image = null;
    if (req?.file?.path) {
      const result = await uploadOnCloudinary(req.file.path);
      if (!result) {
        return res.status(400).json({ error: 'Image upload failed' });
      }
      image = result.secure_url;
    }
    subCategory.name = name || subCategory.name;
    subCategory.description = description || subCategory.description;
    subCategory.image = image || subCategory.image;
    await subCategory.save();
    res.status(200).json({ message: 'SubCategory updated successfully', data: subCategory });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete sub-category
const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SubCategory.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'SubCategory not found' });
    await Category.updateMany(
      { subCategories: id },
      { $pull: { subCategories: id } }
    );
    res.json({ message: 'SubCategory deleted and removed from associated categories' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  getAllSubCategoriesWithoutByCategory
};