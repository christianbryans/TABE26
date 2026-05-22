import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { PaymentController } from '../controllers/PaymentController.js';

const router = express.Router();

/**
 * @route   POST /api/v1/payment
 * @desc    Create a Xendit Invoice for a bill
 * @access  Private (Customer/Admin)
 */
router.post("/", PaymentController.createPayment);

router.post(
  "/webhook",
  PaymentController.xenditCallback
);

router.get(
  "/:id",
  PaymentController.getPaymentStatus
);
router.post('/callback', PaymentController.xenditCallback);

/**
 * @route   GET /api/v1/payment/status/:id
 * @desc    Get payment status for a specific bill
 * @access  Private/Public (depending on security needs, but here we allow lookup by ID)
 */
router.get('/status/:id', PaymentController.getPaymentStatus);

export default router;