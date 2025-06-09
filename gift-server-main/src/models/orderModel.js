import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant:{
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    isGift: {
      type: Boolean,
      default: false,
    },
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  priceToPay: {
    type: Number,
    required: true,
  },
  razorpayOrderId: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  coupon:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Coupon'
  },
  address:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Address",
    required:true,
  },
  status: {
    type: String,
    enum: ["placed", "Shipped", "Delivered", "Cancelled"],
    default: "Pending",
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending",
  },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);