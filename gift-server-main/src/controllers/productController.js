import Product from "../models/productModel.js";
import SubCategory from '../models/subCategoryModel.js';
import mongoose from "mongoose";
import uploadOnCloudinary from "../utils/media/uploadImage.js";

const createProduct = async (req, res) => {
  try {
    const { title, description, vDescription, price, color, stock, isGift, subCategoryId, categoryId, descriptionsecond, titlev} = req.body;
    if (!title || !description || !vDescription || !price || !color || !stock || !subCategoryId || !categoryId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) {
      res.status(401).json({ message: "Sub category not found" });
    }

    const mainImages = req.files.images;
    if (!mainImages || mainImages.length === 0) {
      return res.status(400).json({ message: "Main images are required" });
    }
    const variantImages = req.files.variantImages;
    if (!variantImages || variantImages.length === 0) {
      return res.status(400).json({ message: "Variant images are required" });
    }
    let mainImagesUrls = [];
    let variantImagesUrls = [];

    for (const file of mainImages) {
      const result = await uploadOnCloudinary(file.path);
      if (!result) {
        return res.status(400).json({ message: "Image upload failed" });
      }
      mainImagesUrls.push(result.secure_url);
    }
    for (const file of variantImages) {
      const result = await uploadOnCloudinary(file.path);
      if (!result) {
        return res.status(400).json({ message: "Image upload failed" });
      }
      variantImagesUrls.push(result.secure_url);
    }
    const newProduct = new Product({
      title,
      description,
      images: mainImagesUrls,
      category: categoryId,
      subCategory: subCategoryId,
      variants: [
        { title:titlev,
          description: vDescription,
          price,
          color,
          stock,
          images: variantImagesUrls,
          isGift,
          descriptionsecond
        }
      ]
    });
    await newProduct.save();
    subCategory.products.push(newProduct._id);
    await subCategory.save();
    res.status(201).json({ message: "Product created successfully", data: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Invalid product data", error: error.message });
  }
};

// const getSearchProducts=async (req, res) => {
//   try {
//     const { query } = req.query;
//     console.log(query)
//     if (!query) {
//       return res.status(400).json({ message: "Search query is required" });
//     }
//     const products = await Product.find({
//       $or: [
//         { title: { $regex: query, $options: 'i' } },
//         { description: { $regex: query, $options: 'i' } },
//         { 'variants.description': { $regex: query, $options: 'i' } },
//         { 'variants.color': { $regex: query, $options: 'i' } }
//       ]
//     }).populate('subCategory category');
//     res.status(200).json({ message: "Products fetched successfully", data: products });
//   } catch (error) {
//     res.status(500).json({ message: "Server error while fetching products", error: error.message });
//   }
// };

const getSearchProducts = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    console.log(query);

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchFilter = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'variants.description': { $regex: query, $options: 'i' } },
        { 'variants.color': { $regex: query, $options: 'i' } }
      ]
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(searchFilter)
        .populate('subCategory category')
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(searchFilter)
    ]);

    res.status(200).json({
      message: "Products fetched successfully",
      data: products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching products", error: error.message });
  }
};

// const FilterProducts = async (req, res) => {
//   try {
//     const { categories, minPrice, maxPrice, colors, isGift, page = 1, limit = 6 } = req.body;

//     const query = {};

//     // Category filter
//     if (categories && categories.length > 0) {
//       query.category = { $in: categories };
//     }

//     // Variant filters
//     const variantFilters = [];

//     if (minPrice != null && maxPrice != null) {
//       variantFilters.push({
//         variants: {
//           $elemMatch: {
//             price: { $gte: minPrice, $lte: maxPrice }
//           }
//         }
//       });
//     }

//     if (colors && colors.length > 0) {
//       variantFilters.push({
//         variants: {
//           $elemMatch: {
//             color: { $in: colors }
//           }
//         }
//       });
//     }

//     if (isGift !== undefined) {
//       variantFilters.push({
//         variants: {
//           $elemMatch: {
//             isGift: isGift
//           }
//         }
//       });
//     }

//     const finalQuery = {
//       ...query,
//       ...(variantFilters.length > 0 ? { $and: variantFilters } : {})
//     };

//     // Pagination
//     const skip = (page - 1) * limit;

//     // Total items
//     const totalItems = await Product.countDocuments(finalQuery);

//     // Fetch filtered products with pagination
//     const products = await Product.find(finalQuery)
//       .populate('category')
//       .populate('subCategory')
//       .skip(skip)
//       .limit(limit);

//     // Total pages
//     const totalPages = Math.ceil(totalItems / limit);

//     // Response
//     res.json({
//       data: products,
//       currentPage: parseInt(page),
//       totalPages,
//       totalItems
//     });

//   } catch (error) {
//     console.error('Filter Error:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };


const FilterProducts = async (req, res) => {
  try {
    const {
      categories,
      subCategory,
      minPrice,
      maxPrice,
      colors,
      isGift,
      page = 1,
      limit = 6
    } = req.body;

    const query = {};

    // Category filter
    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }
    if (subCategory && subCategory.length > 0) {
      query.subCategory = { $in: subCategory };
    }
    const variantFilter = {};

    if (minPrice != null || maxPrice != null) {
      variantFilter.price = {};
      if (minPrice != null) variantFilter.price.$gte = minPrice;
      if (maxPrice != null) variantFilter.price.$lte = maxPrice;
    }

    if (colors && colors.length > 0) {
      variantFilter.color = { $in: colors };
    }

    if (isGift !== undefined) {
      variantFilter.isGift = isGift;
    }

    if (Object.keys(variantFilter).length > 0) {
      query.variants = { $elemMatch: variantFilter };
    }

    const skip = (page - 1) * limit;

    console.log("FINAL QUERY:", query);

    const totalItems = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate({
        path: 'category',
        populate: {
          path: 'subCategories',
          model: 'SubCategory',
          select: '_id name'
        }
      })
      .populate('subCategory')
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      data: products,
      currentPage: parseInt(page),
      totalPages,
      totalItems
    });
  } catch (error) {
    console.error('Filter Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};




const getProducts = async (req, res) => {
  try {
    const usePagination = req.query.pagination === 'true';
    const { name, color, minPrice, maxPrice } = req.query;
    const filter = {};
    if (name) {
      filter.title = { $regex: name, $options: 'i' };
    }
    if (color) {
      filter['variants.color'] = { $regex: color, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      filter['variants.price'] = {};
      if (minPrice) filter['variants.price'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['variants.price'].$lte = parseFloat(maxPrice);
    }
    if (usePagination) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const total = await Product.countDocuments(filter);

      const products = await Product.find(filter)
        .populate('subCategory category')
        .skip(skip)
        .limit(limit);

      return res.status(200).json({
        message: 'Paginated products fetched successfully',
        data: products,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      });
    } else {
      const products = await Product.find(filter).populate('subCategory category');
      return res.status(200).json({
        message: 'All products fetched successfully',
        data: products,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Server error while fetching products',
      error: error.message,
    });
  }
};



const getProductById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(req.params.id).populate('subCategory category');
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product fetched successfully", data: product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const { title, description, category, subCategory } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    let images = product.images;
    if (req.files && req.files.length > 0) {
      images = [];
      for (const file of req.files) {
        const result = await uploadOnCloudinary(file.path);
        if (!result) {
          return res.status(400).json({ message: "Image upload failed" });
        }
        images.push(result.secure_url);
      }
    }
    if (title) product.title = title;
    if (description) product.description = description;
    if(category) product.category = category;
    if(subCategory) product.subCategory = subCategory;
    product.images = images;

    const updatedProduct = await product.save();
    res.json({ message: "Product updated successfully", data: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};


const deleteProduct = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addProductVariant = async (req, res) => {

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const { description, price, color, stock, isGift, descriptionsecond } = req.body;

    if (!description || !price || !color || stock === undefined) {
      return res.status(400).json({
        message: "Description, price, color and stock are required"
      });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    let images = [];
    if (req.files && req.files?.variantImages.length > 0) {
      images = [];
      for (const file of req.files?.variantImages) {
        const result = await uploadOnCloudinary(file.path);
        if (!result) {
          return res.status(400).json({ message: "Image upload failed" });
        }
        images.push(result.secure_url);
      }
    }

    product.variants.push({
      description,
      price,
      color,
      stock,
      images: images || [],
      isGift: isGift || false,
      descriptionsecond
    });

    const updatedProduct = await product.save();
    res.status(201).json({ message: "Variant added successfully", data: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Invalid variant data", error: error.message });
  }
};

const removeProductVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    if (!variantId) {
      return res.status(400).json({ message: "Invalid variant ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.variants = product.variants.filter((variant) => variant._id.toString() !== variantId);
    await product.save();
    res.status(200).json({ message: "Variant removed successfully", data: product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateProductVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    const updateData = req.body;

    if (!id || !variantId) {
      return res.status(400).json({ message: "Product ID or Variant ID is missing" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the variant to update
    const variantIndex = product.variants.findIndex(
      (variant) => variant._id.toString() === variantId
    );

    if (variantIndex === -1) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Update the fields of the variant
    product.variants[variantIndex] = {
      ...product.variants[variantIndex]._doc,
      ...updateData,
    };

    // Save the updated product
    await product.save();

    res.status(200).json({
      message: "Variant updated successfully",
      data: product.variants[variantIndex],
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductVariant,
  removeProductVariant,
  getSearchProducts,
  FilterProducts,
  updateProductVariant
};