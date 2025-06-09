import express from 'express';
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory, searchCategory} from '../controllers/categoryController.js';
import { upload } from '../middlewares/multer.js';
const router = express.Router();

router.get('/search', searchCategory);
router.post('/',upload.single('image'), createCategory);
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.put('/:id',upload.single('image') ,updateCategory);
router.delete('/:id', deleteCategory);

export default router;
