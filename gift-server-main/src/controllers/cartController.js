import Cart from '../models/cartModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';

const addToCart = async (req, res) => {
  try {
    const { productId, quantity,variantId } = req.body;
    if (!productId || !quantity || !variantId) {
      return res.status(400).json({ message: 'Product ID, quantity, and variant ID are required' });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const cart = await Cart.findById(user.cart);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    cart.products.push({ product:productId,quantity,variant:variantId });
    await cart.save();
    res.status(200).json({ message: 'Product added to cart successfully', data: cart });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('cart');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const cart = await Cart.findById(user.cart).populate('products.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const cartProducts = await Promise.all(cart.products.map(async (item) => {
      const product = await Product.findById(item.product).lean();
      if (!product) return null;
      const variant=product.variants.find((variant)=>variant._id.toString()===item.variant.toString());
      if (!variant) return null;
      return {
        productId: product._id,
        title: product.title,
        description: product.description,
        productImages: product.images,
        variantId: variant._id,
        variantDescription: variant.description,
        variantPrice: variant.price,
        variantColor: variant.color,
        variantStock: variant.stock,
        variantImages: variant.images,
        isGift: variant.isGift,
        quantity: item.quantity,
      };
    }));
    
    res.status(200).json({ message: 'Cart fetched successfully', data: cartProducts });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const { productId, quantity,variantId } = req.body;
    if (!productId || !quantity || !variantId) {
      return res.status(400).json({ message: 'Product ID, quantity, and variant ID are required' });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const cart = await Cart.findById(user.cart);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const productIndex = cart.products.findIndex(item => item.product.toString() === productId && item.variant.toString() === variantId);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }
    cart.products[productIndex].quantity = quantity;
    await cart.save();
    res.status(200).json({ message: 'Cart updated successfully', data: cart });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId,variantId } = req.body;
    if (!productId || !variantId) {
      return res.status(400).json({ message: 'Product ID and variant ID are required' });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const cart = await Cart.findById(user.cart);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    cart.products = cart.products.filter(item => item.product.toString() !== productId || item.variant.toString() !== variantId);
    await cart.save();
    res.status(200).json({ message: 'Product removed from cart successfully', data: cart });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


const clearCart = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user || !user.cart) {
      return res.status(404).json({ message: "User or cart not found" });
    }

    const cart = await Cart.findById(user.cart);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    cart.products = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear cart", error: err.message });
  }
};

export {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  clearCart
};