import Order from '../models/orderModel.js';
import Transaction from '../models/transactionModel.js';
import crypto from 'crypto'

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
      const order=await Order.findOne({razorpayOrderId:razorpay_order_id});
      if(!order){
        res.status(404).json({ message: "Order not found" });
      }
      let options;
      if(generatedSignature === razorpay_signature) {
        options = {
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
          userId: order.user,
          orderId: order._id,
          amount: order.priceToPay,
          status: "completed",
        }
        order.paymentStatus = "Paid";
      }else{
        options = {
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
          userId: order.user,
          orderId: order._id,
          amount: order.priceToPay,
          status: "failed",
        }
        order.paymentStatus = "Failed";
      }
      const txn=await Transaction.create(options);
      await order.save();
      res.status(200).json({ message: "Payment verified successfully",data:txn });
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate("userId").populate("orderId");
    res.status(200).json({ message: "Transactions fetched successfully", transactions:transactions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
const getUserTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const transactions = await Transaction.find({ userId: userId }).populate("userId").populate("orderId");
    if (!transactions) {
      return res.status(404).json({ message: "No transactions found" });
    }
    res.status(200).json({ message: "Transactions fetched successfully", transactions:transactions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id).populate("userId").populate("orderId");
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({ message: "Transaction fetched successfully", transaction:transaction });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByIdAndDelete(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({ message: "Transaction deleted successfully", transaction:transaction });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export {
  verifyPayment,
  getAllTransactions,
  getUserTransactions,
  getTransactionById,
  deleteTransaction
}