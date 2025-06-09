import Coupon from '../models/couponsModel.js';
import Product from "../models/productModel.js";
// Create a new coupon
export const createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all coupons
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get active coupons
export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validTo: { $gte: now },
      $or: [
        { usageLimit: 0 },
        { $expr: { $lt: ['$currentUsage', '$usageLimit'] } }
      ]
    });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get coupon by code
export const getCouponByCode = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update coupon
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json(coupon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Validate coupon (for checkout)
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ valid: false, error: 'Coupon not found' });
    }

    if (!coupon.isActive ||
      new Date() < coupon.validFrom ||
      new Date() > coupon.validTo ||
      (coupon.usageLimit > 0 && coupon.currentUsage >= coupon.usageLimit)) {
      return res.json({ valid: false, error: 'Coupon is not valid' });
    }

    if (cartAmount < coupon.minimumPurchase) {
      return res.json({
        valid: false,
        error: `Minimum purchase of ${coupon.minimumPurchase} required`
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      valid: true,
      discount,
      finalAmount: cartAmount - discount,
      coupon: coupon
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Apply coupon (increment usage)
// export const applyCoupon = async (req, res) => {
//   try {
//     const coupon = await Coupon.findOneAndUpdate(
//       { code: req.params.code.toUpperCase() },
//       { $inc: { currentUsage: 1 } },
//       { new: true }
//     );

//     if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
//     res.json(coupon);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };


export const applyCoupon = async (req, res) => {
  try {
    const { couponCode, cart } = req.body;
    if (!couponCode || !cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    // Step 1: Check coupon existence
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon && !coupon?.isActive || !coupon.isValid() ) {
      return res.status(400).json({ success: false, message: "Invalid or expired coupon" });
    }

    // Step 2: Calculate total amount from cart
    let total = 0;
    for (let item of cart) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
    
      // Variant find karna
      const variant = product.variants.find(v => v._id.toString() === item.product.variants[0]._id);
      if (!variant) {
        return res.status(404).json({ success: false, message: "Variant not found" });
      }
      total += variant.price * item.quantity;
    }

    // Step 3: Check minimum purchase
    if (total < coupon.minimumPurchase) {
      return res.status(400).json({ success: false, message: `Minimum purchase should be ₹${coupon.minimumPurchase}` });
    }

    // Step 4: Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (total * coupon.discountValue) / 100;

      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    const finalAmount = total - discount;

    return res.status(200).json({
      success: true,
      totalAmount: total,
      discount,
      priceToPay: finalAmount,
      message: "Coupon applied successfully"
    });

  } catch (error) {
    console.error("Coupon apply error:", error);
    return res.status(500).json({ success: false, message: "Server error"});
  }
};