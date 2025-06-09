import { Router } from "express";
import { createReview, deleteReview, getAllReviews, getReviewById, getReviewsByProductId, updateReview } from "../controllers/reviewController.js";

const router = Router();

router.get('/',getAllReviews);
router.get('/:id',getReviewById);
router.get('/product/:productId',getReviewsByProductId);
router.post('/',createReview);
router.put('/:id',updateReview);
router.delete('/:id',deleteReview);

export default router;