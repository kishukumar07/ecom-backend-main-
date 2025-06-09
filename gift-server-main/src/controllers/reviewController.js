import Review from '../models/reviewModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';

// const createReview = async (req, res) => {
//   try {

//     const { productId, rating, comment } = req.body;
//     if (!productId || !rating || !comment) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     const user = await User.findById(req.userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     // Check if user has purchased the product
//     const hasPurchased = await Order.findOne({
//       user: req.userId,
//       'products.product': productId,
//       status: 'Delivered',
//       paymentStatus: 'Paid'
//     });

//     if (!hasPurchased) {
//       return res.status(403).json({ 
//         message: 'You can only review products that you have purchased and received' 
//       });
//     }

//     // Check if user has already reviewed this product
//     const existingReview = await Review.findOne({
//       user: req.userId,
//       product: productId
//     });

//     if (existingReview) {
//       return res.status(400).json({ 
//         message: 'You have already reviewed this product' 
//       });
//     }

//     const review = await Review.create({
//       user: user._id,
//       rating,
//       comment,
//       product: productId
//     });

//     product.reviews.push(review._id);
//     await product.save();
    
//     res.status(201).json({ message: 'Review added successfully', data: review });
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// };


// controllers/reviewController.js
const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        code: 'FIELDS_MISSING',
        message: 'Please fill-in rating and comment to submit a review.'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'Your session looks invalid. Please login again.'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Oops! We could not find this product.'
      });
    }

    const hasPurchased = await Order.findOne({
      user: req.userId,
      'products.product': productId,
      status: 'Delivered',
      paymentStatus: 'Paid'
    });

    if (!hasPurchased) {
      return res.status(403).json({
        code: 'NOT_PURCHASED',
        message: 'You can review a product only after you have bought and received it.'
      });
    }

    const existingReview = await Review.findOne({
      user: req.userId,
      product: productId
    });

    if (existingReview) {
      return res.status(400).json({
        code: 'ALREADY_REVIEWED',
        message: 'You have already reviewed this product.'
      });
    }

    const review = await Review.create({
      user: user._id,
      rating,
      comment,
      product: productId
    });

    product.reviews.push(review._id);
    await product.save();

    res.status(201).json({
      code: 'REVIEW_CREATED',
      message: 'Thanks! Your review has been added.',
      data: review
    });
  } catch (err) {
    res.status(500).json({
      code: 'SERVER_ERROR',
      message: 'Something went wrong on our side. Please try again later.',
      error: err.message
    });
  }
};


const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('product');
    res.status(200).json({ message: 'All reviews fetched successfully', data: reviews });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id).populate('user', 'name email');
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json({ message: 'Review fetched successfully', data: review });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getReviewsByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const reviews = product.reviews;
    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this product' });
    }
    res.status(200).json({ message: 'Reviews fetched successfully', data: reviews });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'You are not authorized to update this review' });
    }
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();
    res.status(200).json({ message: 'Review updated successfully', data: review });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this review' });
    }
    await review.remove();
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export {
  createReview,
  getAllReviews,
  getReviewById,
  getReviewsByProductId,
  updateReview,
  deleteReview,
};