import { Router } from "express";
import { deleteUser, getAllUsers, getUserById, updateUser, updateUserPassword } from "../controllers/userController.js";
import authenticate  from "../middlewares/authMiddleware.js";

const router = Router();

router.get('/',getAllUsers);
router.get('/:id',getUserById);
router.put('/',authenticate,updateUser);
router.put('/password',authenticate,updateUserPassword);
router.delete('/',authenticate,deleteUser);


export default router;