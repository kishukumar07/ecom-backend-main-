import { Router } from "express";
import { getCurrentUser, login, logout, register, verifyOtp } from "../controllers/authController.js";
import authenticate from "../middlewares/authMiddleware.js";

const router=Router();

router.get('/',authenticate,getCurrentUser);   //TODO: add middleware
router.post('/register',register);
router.post('/login',login);    
router.post('/logout',logout);
router.post('/verify',authenticate,verifyOtp);


export default router;