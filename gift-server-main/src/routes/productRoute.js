import express from "express";
import { addProductVariant, createProduct, deleteProduct, FilterProducts, getProductById, getProducts, getSearchProducts, removeProductVariant, updateProduct, updateProductVariant } from "../controllers/productController.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

const options = [
  { name: "images", maxCount: 10 },
  { name: "variantImages", maxCount: 10 }
]

router.post('/',upload.fields(options),createProduct);
router.get('/',getProducts);
router.get('/search',getSearchProducts);
router.get('/:id',getProductById);
router.put('/:id',upload.array('images',10),updateProduct);
router.delete('/:id',deleteProduct);
router.post('/filter', FilterProducts);
// Product Variant Routes
router.put('/variant/:id',upload.fields(options),addProductVariant);
router.put('/variant/:id/:variantId', upload.fields(options), updateProductVariant);
router.delete('/variant/:id/:variantId',removeProductVariant);
// Review Routes

export default router;