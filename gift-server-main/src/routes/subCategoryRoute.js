import express from 'express';
import { createSubCategory, deleteSubCategory, getAllSubCategories, getSubCategoryById, updateSubCategory, getAllSubCategoriesWithoutByCategory } from '../controllers/subCategoryController.js';
import { upload } from '../middlewares/multer.js';
const router = express.Router();

router.get('/all',getAllSubCategoriesWithoutByCategory)
router.post('/',upload.single('image'), createSubCategory);
router.get('/:categoryId', getAllSubCategories);
router.get('/single/:id', getSubCategoryById);
router.put('/:id',upload.single('image') ,updateSubCategory);
router.delete('/:id', deleteSubCategory);

export default router;
