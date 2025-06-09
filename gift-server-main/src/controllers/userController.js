import User from '../models/userModel.js';
import Cart from '../models/cartModel.js';
import Wishlist from '../models/wishListModel.js';
import Address from '../models/addressModel.js';
import Order from '../models/orderModel.js';

const getAllUsers = async (_, res) => {
  try {
    const users = await User.find()
      .populate('addresses')
      .select('-password -otp -otpExpires');
    res.status(200).json({ message: 'Users fetched successfully', data: users });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .populate('addresses cart wishlist')
      .select('-password -otp -otpExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const orders = await Order.find({ user: user._id });
    if(!orders)
    {
      return res.status(200).json({ message: 'User fetched successfully', data: user , orders:[{}] });
    }
    //TODO : also send order data
    res.status(200).json({ message: 'User fetched successfully', data: user , orders:orders});
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    await user.save();
    res.status(200).json({ message: 'User updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new passwords are required' });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete associated addresses, cart, and wishlist
    user.addresses.forEach(async (addressId) => {
      await Address.findByIdAndDelete(addressId);
    });
    await Cart.findByIdAndDelete(user.cart);
    await Wishlist.findByIdAndDelete(user.wishlist);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserPassword,
  deleteUser
}