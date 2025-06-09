import { Router } from "express";
import { deleteTransaction, getAllTransactions, getUserTransactions, verifyPayment } from "../controllers/transactionController.js";

const router=Router();

router.post("/verify",verifyPayment);
router.get("/",getAllTransactions);
router.get("/user",getUserTransactions);
router.get("/:id",getUserTransactions);
router.delete("/:id",deleteTransaction);


export default router;