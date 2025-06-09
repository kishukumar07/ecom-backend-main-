import Category from '../models/categoryModel.js';
import uploadOnCloudinary from '../utils/media/uploadImage.js';

// Create a new category
const createCategory = async (req, res) => {
  try {
    const {name,description}=req.body;
    if(!name || !description){
      return res.status(400).json({error:"All Fields are required"});
    }
    if(!req.file.path){
      return res.status(400).json({error:"Image is required"});
    }
    const result=await uploadOnCloudinary(req.file.path);
    if(!result){
      return res.status(400).json({error:"Image upload failed"});
    }
    const image=result.secure_url;
    const newCategory=new Category({
      name,
      description,
      image
    });
    await newCategory.save();
    res.status(201).json({message:"category created successfully",data:newCategory});
  } catch (error) {
    res.status(500).json({message:"Category creation failed", error: error.message });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const usePagination = req.query.pagination === 'true';

    if (usePagination) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const total = await Category.countDocuments();
      const categories = await Category.find().skip(skip).limit(limit);

      return res.status(200).json({
        message: 'categories fetched successfully',
        data: categories,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      });
    } else {
      const categories = await Category.find(); 
      return res.status(200).json({
        message: 'All categories fetched successfully (for dropdown)',
        data: categories,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Categories fetching failed",
      error: error.message,
    });
  }
};


const searchCategory = async (req, res) => {
  try {
    const { name } = req.query;
    const usePagination = req.query.pagination === 'true';

    if (!name) {
      return res.status(400).json({ message: "Search query is missing" });
    }

    const searchQuery = {
      $or: [
        { name: { $regex: name, $options: "i" } },
        { description: { $regex: name, $options: "i" } },
      ],
    };

    console.log("Search query:", searchQuery);
    console.log("Pagination enabled:", usePagination);

    if (usePagination) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const total = await Category.countDocuments(searchQuery);
      const categories = await Category.find(searchQuery).skip(skip).limit(limit);

      return res.status(200).json({
        message: "Categories fetched with search + pagination",
        data: categories,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      });
    } else {
      const categories = await Category.find(searchQuery);
      return res.status(200).json({
        message: "Categories fetched with search (no pagination)",
        data: categories,
      });
    }
  } catch (error) {
    console.error("Error while searching category:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const {id}=req.params
    const category = await Category.findById(id).populate('subCategories');
    if (!category){
      return res.status(404).json({error:'Category not found'});
    }
    res.status(200).json({message:'Category fetched by Id', data:category});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  try {
    const {name,description}=req.body;
    const {id}=req.params
    const category=await Category.findById(id);
    if(!category){
      return res.status(404).json({error:"Category not found"});
    }
    let image=null;
    if(req?.file?.path){
      const result=await uploadOnCloudinary(req.file.path);
      if(!result){
        return res.status(400).json({error:"Image upload failed"});
      }
      image=result.secure_url;
    }
    category.name=name || category.name;
    category.description=description || category.description;
    category.image=image || category.image;
    await category.save();
    res.status(200).json({message:"Category updated successfully",data:category});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  try {
    const {id}=req.params;
    const deletedCategory=await Category.findByIdAndDelete(id);
    if(!deletedCategory){
      return res.status(404).json({error:"cateogy not Found"});
    }
    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({message:"Category deletion failed", error: error.message });
  }
};

export {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  searchCategory
};