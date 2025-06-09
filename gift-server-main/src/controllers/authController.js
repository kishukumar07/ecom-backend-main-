import User from '../models/userModel.js';
import Cart from '../models/cartModel.js';
import Wishlist from '../models/wishListModel.js';
import generateOTP from '../utils/auth/generateOtp.js';
import { removeToken, setToken } from '../utils/auth/token.js';
import { sendEmail } from '../utils/mail/mailer.js';

const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email or phone number" });
    }
    const cart = await Cart.create({});
    const wishlist = await Wishlist.create({});
    const otpCred = generateOTP(4);
    const newUser = await User.create({
      name,
      email,
      phone,
      password,
      otp: otpCred.otp,
      otpExpires: otpCred.expires,
      cart: cart._id,
      wishlist: wishlist._id,
    });
    setToken(newUser._id, res)
    sendEmail({ email: newUser.email, emailType: 'OTP', val: { otp: otpCred.otp, name: newUser.name } });

    res.status(201).json({ message: 'User registered successfully', status: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message, status: false });
  }
};

const login = async (req, res) => {
  const { email, phone, password } = req.body;
  try {
    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone required" });
    }
    const user = await User.findOne({ $or: [{ email }, { phone }] })
      .populate({
        path: "cart",
        populate: {
          path: "products.product products.variant",
        },
      });
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Incorrect Password' });
    }
    const token = setToken(user._id, res);
    const userData = { ...user._doc };
    delete userData.password;

    if (!user.isVerified) {
      const otpCred = generateOTP(4);
      user.otp = otpCred.otp,
        user.otpExpires = otpCred.expires,
        await user.save()
      await sendEmail({ email: user.email, emailType: 'OTP', val: { otp: otpCred.otp, name: user.name } });
      return res.status(200).json({ message: 'Before verify with otp',data: userData});
    } 
      res.status(200).json({ message: 'Logged in successfull', data: userData, token });
    
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const userId = req.userId; 
  try {
    if (!otp || !userId) {
      return res.status(400).json({ message: 'Otp and UserId required' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isOtpValid = user.otp === otp &&   user.otpExpires > Date.now() ;
    if (!isOtpValid) {
      return res.status(401).json({ message: 'Invalid or Expire OTP' });
    }
    user.otp = null;
    user.otpExpires = null;
    user.isVerified = true;
    await user.save();
    res.status(200).json({ message: 'User verified successfully', data: user })
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('-password -otp -otpExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Current User fetched successfully', data: user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

const logout = async (_, res) => {
  try {
    removeToken(res);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}


export {
  register,
  login,
  verifyOtp,
  getCurrentUser,
  logout
}