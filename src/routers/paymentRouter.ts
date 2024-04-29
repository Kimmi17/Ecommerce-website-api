import express from "express";
import {
  paymentCancel,
  paymentSuccess,
  stripePayment,
} from "../controllers/payment";

const router = express.Router();

router.post("/", stripePayment);
router.get("/success/:orderId", paymentSuccess);
router.get("/cancel/:orderId", paymentCancel);

export default router;
