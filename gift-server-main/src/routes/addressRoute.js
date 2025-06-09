import { Router } from "express";
import { createAddress, deleteAddress, getAddressById, getAllAddresses, updateAddress, getAddress } from "../controllers/addressController.js";
import authenticate  from "../middlewares/authMiddleware.js";
const router = Router();

// router.get('/',getAllAddresses);
router.get('/:id',getAddressById);
router.post('/',createAddress);
router.get('/',authenticate,getAddress);
router.put('/:id',updateAddress);
router.delete('/:id',deleteAddress);

export default router;