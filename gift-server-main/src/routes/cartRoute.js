import { Router } from "express";
import { addToCart, getCart, removeFromCart, updateCart, clearCart } from "../controllers/cartController.js";

const router = Router();

router.get('/',getCart);
router.post('/',addToCart);
router.put('/',updateCart);
router.delete('/',removeFromCart);
router.delete('/clear', clearCart);

export default router;