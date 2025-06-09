import express from 'express';
import { createBanner, getAllBanners, getBanner, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import authenticate from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/multer.js';

const router = express.Router();

// Create a new banner (protected route)
router.post('/', authenticate, upload.single('image'), createBanner);

// Get all banners
router.get('/', getAllBanners);

// Get a single banner
router.get('/:id', getBanner);

// Update a banner (protected route)
router.put('/:id', authenticate, upload.single('image'), updateBanner);

// Delete a banner (protected route)
router.delete('/:id', authenticate, deleteBanner);

export default router; 