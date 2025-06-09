import express from 'express';
import {
  createCoupon,
  getAllCoupons,
  getActiveCoupons,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon
} from '../controllers/couponController.js';

const router = express.Router();

// Create a new coupon
router.post('/', createCoupon);

// Get all coupons
router.get('/', getAllCoupons);

// Get active coupons
router.get('/active', getActiveCoupons);

// Get coupon by code
router.get('/:code', getCouponByCode);

// Update coupon
router.put('/:id', updateCoupon);

// Delete coupon
router.delete('/:id', deleteCoupon);

// Validate coupon (for checkout)
router.post('/validate', validateCoupon);

// Apply coupon (increment usage)
// router.post('/:code/apply', applyCoupon);
router.post('/apply-coupon', applyCoupon);


export default router;