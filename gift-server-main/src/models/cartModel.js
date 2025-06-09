import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  products:[{
    product:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    quantity:{
      type: Number,
      min: 1,
    },
    variant:{
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  }]
},{timestamps: true});

export default mongoose.model("Cart", cartSchema);