import prisma from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export class BillingService {
  static async generateBillForDevice(deviceId, unitPrice = 12500) {
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: { user: true },
    });

    if (!device) throw new AppError('Device not found', 404);

    const now = new Date();
    const usageMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const usageMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const billingDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const billNumber = `INV-${Date.now()}`;
    const billingPeriod = usageMonthStart.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const dueDate = new Date(billingDate.getFullYear(), billingDate.getMonth() + 1, 20);

    const usages = await prisma.waterUsage.findMany({
      where: {
        deviceId,
        timestamp: { gte: usageMonthStart, lte: usageMonthEnd },
      },
    });

    let totalLiter = 0;
    for (const item of usages) totalLiter += item.volume || 0;

    if (totalLiter === 0) {
      throw new AppError('No water usage data found for the previous month', 404);
    }

    const totalM3 = totalLiter / 1000;
    const waterCost = totalM3 * unitPrice;
    const tax = waterCost * 0.10;
    const adminFee = 2500;
    const totalAmount = Math.round(waterCost + tax + adminFee);

    return await prisma.bill.create({
      data: {
        userId: device.userId,
        deviceId: device.id,
        billNumber,
        billingPeriod,
        billingDate,
        dueDate,
        waterUsage: totalM3,
        unitPrice,
        totalAmount,
        status: 'pending',
      },
    });
  }

  static async getBillsByUserId(userId) {
    return await prisma.bill.findMany({
      where: { userId },
      include: {
        device: { select: { name: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getAllBills() {
    return await prisma.bill.findMany({
      include: {
        customer: true,
        device: { select: { name: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async syncUserBills(userId) {
    console.log('SYNC USER BILLS:', userId);

    const now = new Date();

    await prisma.bill.updateMany({
      where: {
        userId,
        status: 'UNPAID',
        dueDate: { lt: now },
      },
      data: { status: 'OVERDUE' },
    });

    const oldestBill = await prisma.bill.findFirst({
      where: { userId, status: { in: ['UNPAID', 'OVERDUE'] } },
      orderBy: { billingDate: 'asc' },
    });

    if (oldestBill) {
      const latestUnitPrice = await prisma.unitPrice.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      if (latestUnitPrice?.price != null) {
        const usageM3 = Number(oldestBill.waterUsage || 0);
        const waterCost = usageM3 * Number(latestUnitPrice.price);
        const tax = waterCost * 0.10;
        const adminFee = 2500;
        const totalAmount = waterCost + tax + adminFee;

        const updatedBill = await prisma.bill.update({
          where: { id: oldestBill.id },
          data: {
            unitPrice: Number(latestUnitPrice.price),
            totalAmount,
          },
        });

        return updatedBill;
      }

      return oldestBill;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const latestBill = await prisma.bill.findFirst({
      where: { userId },
      orderBy: { billingDate: 'desc' },
    });

    let startMonth;
    if (latestBill) {
      startMonth = new Date(latestBill.billingDate);
      startMonth.setMonth(startMonth.getMonth() + 1);
      startMonth.setDate(1);
    } else {
      const firstUsage = await prisma.waterUsage.findFirst({
        where: { userId },
        orderBy: { timestamp: 'asc' },
      });
      if (!firstUsage) return null;
      startMonth = new Date(firstUsage.timestamp);
      startMonth.setDate(1);
    }

    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    while (startMonth <= lastMonth) {
      const year = startMonth.getFullYear();
      const month = startMonth.getMonth();
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);
      const invoiceDate = new Date(year, month + 1, 1);
      const dueDate = new Date(year, month + 2, 20);

      const billPeriodLabel = monthStart.toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      const existingBill = await prisma.bill.findFirst({
        where: {
          userId,
          billingPeriod: billPeriodLabel,
        },
      });

      if (!existingBill) {
        const usages = await prisma.waterUsage.findMany({
          where: { userId, timestamp: { gte: monthStart, lte: monthEnd } },
        });

        let totalLiter = 0;
        for (const item of usages) totalLiter += item.volume || 0;

        const totalM3 = totalLiter / 1000;

        if (totalM3 > 0) {
          const latestUnitPrice = await prisma.unitPrice.findFirst({
            orderBy: { createdAt: 'desc' },
          });
          const unitPrice = latestUnitPrice?.price || 0;
          const waterCost = totalM3 * unitPrice;
          const tax = waterCost * 0.10;
          const adminFee = 2500;
          const totalAmount = waterCost + tax + adminFee;

          await prisma.bill.create({
            data: {
              userId,
              customer_number: user.customer_number,
              billNumber: `INV-${Date.now()}-${month}`,
              billingPeriod: billPeriodLabel,
              billingDate: invoiceDate,
              dueDate,
              waterUsage: totalM3,
              unitPrice,
              totalAmount,
              status: 'UNPAID',
            },
          });
        }
      }

      startMonth.setMonth(startMonth.getMonth() + 1);
    }

    const currentBill = await prisma.bill.findFirst({
      where: { userId, status: { in: ['UNPAID', 'OVERDUE'] } },
      orderBy: { billingDate: 'asc' },
    });

    if (currentBill) return currentBill;

    const latestPaidBill = await prisma.bill.findFirst({
      where: { userId },
      orderBy: { billingDate: 'desc' },
    });

    if (!latestPaidBill) return null;

    return {
      ...latestPaidBill,
      totalAmount: 0,
      dueDate: null,
      isCompleted: true,
    };
  }
}