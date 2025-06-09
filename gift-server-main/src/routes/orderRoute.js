import { Router } from "express";
import { createOrder, deleteOrder, getAllOrders, getOrderById, getUserOrders, updateOrder,getOrderByIdByAdmin } from "../controllers/orderController.js";
import authenticate from "../middlewares/authMiddleware.js";

const router = Router();

router.post('/',createOrder);
router.get('/',getAllOrders);
router.get('/:id',getOrderById);
router.post('/user',authenticate,getUserOrders);
router.put('/:id',updateOrder);
router.delete('/:id',deleteOrder);
router.post('/admin',getOrderByIdByAdmin)

export default router;