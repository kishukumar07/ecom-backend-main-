import mongoose from "mongoose";

const wishListSchema = new mongoose.Schema({
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  }],
}, { timestamps: true });

export default mongoose.model("Wishlist", wishListSchema);