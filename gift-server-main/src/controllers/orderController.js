import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Address from '../models/addressModel.js';
import razorpay from '../config/razorpayConfig.js';
import Coupon from '../models/couponsModel.js';
import Cart from '../models/cartModel.js';
import { sendEmail } from '../utils/mail/mailer.js';

// const createOrder = async (req, res) => {
//   try {
//     const { promoCode,addressId } = req.body;
//     const userId = req.userId;
//     const user = await User.findById(userId);
//     const cart = await Cart.findById(user.cart);
//     const products = [];
//     let totalAmount = 0;
//     let priceToPay = 0;
//     let discount = 0;

//     let couponId;
//     if (promoCode) {
//       const coupon = await Coupon.findOne({code:promoCode});
//       couponId=coupon._id;
//       if (!coupon) {
//         return res.status(400).json({ message: "Coupon not found" });
//       }
//       const isValid = await coupon.isValid();
//       if (!isValid) {
//         return res.status(400).json({ message: "Coupon is not valid" });
//       }
//       discount = coupon.discountValue;
//     }
//     for (const item of cart.products) {
//       const product = await Product.findById(item.product);
//       const variant = product.variants.find((variant) => variant._id.toString() === item.variant.toString());
//       products.push({
//         product: product._id,
//         variant: variant._id,
//         title: product.title,
//         description: variant.description,
//         price: variant.price,
//         color: variant.color,
//         images: variant.images,
//         isGift: variant.isGift,
//         quantity: item.quantity,
//       });
//       totalAmount += variant.price * item.quantity;
//     }
//     if (!products.length) {
//       return res.status(400).json({ message: "No products in cart" });
//     }
//     priceToPay = totalAmount - discount;
//     const razorpayOrder = await razorpay.orders.create({
//       amount: priceToPay * 100,
//       currency: "INR",
//       receipt: "Receipt No. #1234" + Date.now(),
//     });
//     const address = await Address.findById(addressId);
//     if (!address) {
//       return res.status(400).json({ message: "Address not found" });
//     }
//     console.log('first')
//     const newOrder = await Order.create({
//       user: userId,
//       products,
//       address: address._id,
//       paymentStatus: "Pending",
//       status: "placed",
//       totalAmount,
//       priceToPay,
//       razorpayOrderId: razorpayOrder.id,
//       discount,
//       coupon: couponId,
//     });
//     await Cart.findByIdAndUpdate(user.cart, { products: [] });
//     const val = {
//       customerName: user.name,
//       orderId: newOrder._id,
//       orderDate: new Date().toLocaleDateString(),
//       paymentStatus: newOrder.paymentStatus,
//       shippingAddress: `${address.addressLine1}, ${address.addressLine2}, ${address.zipCode}, ${address.city}, ${address.state}, ${address.country}`,
//       items: products,
//       totalAmount: priceToPay
//     };
//     await sendEmail({ email: user.email, emailType: "ORDER_PLACED", val });
//     res.status(201).json({ message: "Order created successfully", order: newOrder });
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// };


const createOrder = async (req, res) => {
  try {
    const { promoCode, addressId } = req.body;
    const userId = req.userId;
    const user = await User.findById(userId);
    const cart = await Cart.findById(user.cart);
    const products = [];

    let totalAmount = 0;
    let priceToPay = 0;
    let discount = 0;
    let couponId;

    // Calculate total from cart
    for (const item of cart.products) {
      const product = await Product.findById(item.product);
      const variant = product.variants.find(
        (variant) => variant._id.toString() === item.variant.toString()
      );
      if (!variant) {
        return res.status(400).json({ message: "Variant not found" });
      }
      products.push({
        product: product._id,
        variant: variant._id,
        title: product.title,
        description: variant.description,
        price: variant.price,
        color: variant.color,
        images: variant.images,
        isGift: variant.isGift,
        quantity: item.quantity,
      });
      totalAmount += variant.price * item.quantity;
    }

    if (!products.length) {
      return res.status(400).json({ message: "No products in cart" });
    }

    // Promo code validation
    if (promoCode) {
      const coupon = await Coupon.findOne({ code: promoCode });

      if (!coupon) {
        return res.status(400).json({ message: "Invalid coupon code" });
      }
      console.log("XXXXXXXXXXXXXX:", coupon)
      // Date check
      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validTo) {
        return res.status(400).json({ message: "Coupon is expired or not yet active" });
      }

      // Minimum purchase check
      if (totalAmount < coupon.minimumPurchase) {
        return res.status(400).json({
          message: `Minimum purchase should be ₹${coupon.minimumPurchase}`,
        });
      }

      // Usage limit check
      if (coupon.currentUsage >= coupon.usageLimit) {
        return res.status(400).json({ message: "Coupon usage limit exceeded" });
      }

      // Discount calculation
      if (coupon.discountType === "percentage") {
        discount = (totalAmount * coupon.discountValue) / 100;

        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
      } else if (coupon.discountType === "fixed") {
        discount = coupon.discountValue;
      }

      // Save couponId
      couponId = coupon._id;
    }

    priceToPay = totalAmount - discount;

    const razorpayOrder = await razorpay.orders.create({
      amount: priceToPay * 100,
      currency: "INR",
      receipt: "Receipt No. #1234" + Date.now(),
    });

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(400).json({ message: "Address not found" });
    }

    const newOrder = await Order.create({
      user: userId,
      products,
      address: address._id,
      paymentStatus: "Pending",
      status: "placed",
      totalAmount,
      priceToPay,
      razorpayOrderId: razorpayOrder.id,
      discount,
      coupon: couponId,
    });

    await Cart.findByIdAndUpdate(user.cart, { products: [] });

    const val = {
      customerName: user.name,
      orderId: newOrder._id,
      orderDate: new Date().toLocaleDateString(),
      paymentStatus: newOrder.paymentStatus,
      shippingAddress: `${address.addressLine1}, ${address.addressLine2}, ${address.zipCode}, ${address.city}, ${address.state}, ${address.country}`,
      items: products,
      totalAmount: priceToPay,
    };

    await sendEmail({ email: user.email, emailType: "ORDER_PLACED", val });
    if (couponId) {
      await Coupon.findByIdAndUpdate(couponId, { $inc: { currentUsage: 1 } });
    }

    res.status(201).json({ message: "Order created successfully", order: newOrder });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error?.response?.data?.message || "Internal server error",
      error: error.message,
    });
  }
};


const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user");
    res.status(200).json({ message: 'Orders fetched successfully', orders: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

const getUserOrders = async (req, res) => {
  const userId = req.userId;
  try {
    const orders = await Order.find({ user: userId });
    if (!orders) {
      return res.status(404).json({ message: 'No orders found' });
    }
    res.status(200).json({ message: 'Orders fetched successfully', orders: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find order by ID with populated address and products.product
    const order = await Order.findById(id)
      .populate("address")
      .populate("products.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2. Enrich products with full variant details from product.variants array
    const enrichedProducts = order.products.map((item) => {
      const fullProduct = item.product;
      const matchedVariant = fullProduct.variants.find(
        (variant) => variant._id.toString() === item.variant.toString()
      );

      return {
        ...item.toObject(),
        product: fullProduct,
        variant: matchedVariant || null, // fallback if not found
      };
    });

    // 3. Return enriched order
    const enrichedOrder = {
      ...order.toObject(),
      products: enrichedProducts,
    };

    res.status(200).json({ order: enrichedOrder });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const getOrderByIdByAdmin = async (req, res) => {
  console.log("Request Body:", req.body);

  try {
    const { id } = req.body;

    const order = await Order.findById(id)
      .populate("user")
      .populate("address")
      .populate({
        path: "products",
        populate: [
          { path: "product" }
        ]
      });


    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order fetched successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};




const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    if (!status && !paymentStatus) {
      return res.status(400).json({ message: "Please provide order status or payment status" });
    }
    const order = await Order.findById(id).populate('user address');
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const val = {
      customerName: order.user.name,
      orderId: order._id,
      createdAt: new Date(order.createdAt),
      shippingAddress: `${order.address.addressLine1}, ${order.address.addressLine2}, ${order.address.zipCode}, ${order.address.city}, ${order.address.state}, ${order.address.country}`,
      items: order.products
    };
    if (status) {
      if (status === "Shipped") {
        await sendEmail({ email: order.user.email, emailType: 'ORDER_SHIPPED', val });
      }
      if (status === "Delivered") {
        await sendEmail({ email: order.user.email, emailType: 'ORDER_DELIVERED', val });
      }
      if (status === "Cancelled") {
        await sendEmail({ email: order.user.email, emailType: 'ORDER_CANCELLED', val });
      }
      order.status = status || order.status;
    }
    order.paymentStatus = paymentStatus || order.paymentStatus;
    await order.save();
    res.status(200).json({ message: "Order updated successfully", order: order });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully", order: deletedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrder,
  deleteOrder,
  getOrderByIdByAdmin
}