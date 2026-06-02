import express from 'express';
import prisma from "../config/db.js";
import { authMiddleware } from '../middleware/authMiddleware.js';
import { PaymentController } from '../controllers/PaymentController.js';

const router = express.Router();

/**
 * DEBUG ROUTE
 */
router.get("/all-bills", async (req, res) => {

  const bills = await prisma.bill.findMany();

  res.json(bills);

});

/**
 * SEED BILL
 */

router.get("/reset-bill", async (req, res) => {

  const bill = await prisma.bill.update({
    where: {
      id: "e7643768-1f97-4cc8-8311-028e2f0f95b0",
    },
    data: {
      status: "UNPAID",
      paymentUrl: null,
      externalId: null,
    },
  });

  res.json(bill);

});

router.get("/seed", async (req, res) => {

  const latestBill = await prisma.bill.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  const nextNumber = latestBill
    ? parseInt(latestBill.billNumber.split("-")[1] || "1") + 1
    : 1;

  // compute billingDate as start of current month, and dueDate as 20th of next month
  const now = new Date();
  const billingDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const dueDate = new Date(billingDate.getFullYear(), billingDate.getMonth() + 1, 20);

  // fetch user to get customer_number
  const userIdForSeed = "P0001"; // Andi Hidayat seeded user
  const userRecord = await prisma.user.findUnique({ where: { id: userIdForSeed } });

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const usageRows = await prisma.waterUsage.findMany({
    where: {
      userId: userIdForSeed,
      timestamp: { gte: monthStart, lte: monthEnd }
    }
  });
  const totalLiter = usageRows.reduce((sum, row) => sum + (row.volume || 0), 0);
  const totalM3 = totalLiter / 1000;
  const latestUnitPrice = await prisma.unitPrice.findFirst({ orderBy: { createdAt: "desc" } });
  const unitPrice = latestUnitPrice?.price || 0;
  const waterCost = totalM3 * unitPrice;
  const adminFee = 2500;
  const tax = waterCost * 0.1;
  const totalAmount = waterCost + adminFee + tax;

  const bill = await prisma.bill.create({
    data: {
      userId: userIdForSeed,
      customer_number: userRecord?.customer_number || userRecord?.id || `CN-${Date.now()}`,

      billNumber: `INV-${nextNumber}`,

      billingPeriod: billingDate.toLocaleString('en-US', { month: 'long', year: 'numeric' }),

      billingDate,

      dueDate,

      waterUsage: totalM3,

      unitPrice,

      totalAmount,

      status: "UNPAID",
    },
  });

  res.json({
    message: "Bill created successfully",
    data: bill,
  });

});
/**
 * @route   POST /api/v1/payment
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

router.post(
  '/callback',
  PaymentController.xenditCallback
);

router.get(
  '/status/:id',
  PaymentController.getPaymentStatus
);

router.get(
  "/invoice/:billId",
  authMiddleware,
  PaymentController.downloadInvoice
);

export default router;