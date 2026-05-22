import prisma from '../config/db.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { DashboardService } from '../services/DashboardService.js';

/**
 * DashboardController
 */
export class DashboardController {

  /**
   * GET /api/v1/dashboard
   * Dashboard customer
   */
  static getDashboard = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        devices: {
          include: {
            waterUsages: {
              orderBy: {
                timestamp: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Customer not found', 404);
    }

    const devices = user.devices;

    const totalDevices = devices.length;

    const activeDevices = devices.filter(
      (device) => device.status !== 'inactive'
    ).length;

    let totalUsage = 0;

    devices.forEach((device) => {
      if (device.waterUsages.length > 0) {
        totalUsage += device.waterUsages[0].cumulative || 0;
      }
    });

    const dashboardData = {
      customer: {
        id: user.id,
        name: user.name,
        email: user.email,
        customer_number:
          user.customer_number ||
          user.id.substring(0, 8).toUpperCase(),
      },

      summary: {
        totalDevices,
        activeDevices,
        totalWaterUsage: parseFloat(totalUsage.toFixed(2)),
        totalUsageUnit: 'liter',
      },

      devices: devices.map((device) => ({
        id: device.id,
        name: device.name,
        location: device.location,
        status: device.status,
        latestUsage: device.waterUsages[0] || null,
      })),

      timestamp: new Date().toISOString(),
    };

    res.success(
      dashboardData,
      'Dashboard fetched successfully',
      200
    );
  });

  /**
   * GET /api/v1/dashboard/chart
   * Customer chart
   */
  static getChartData = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const takeLimit = parseInt(req.query.limit) || 20;

    const user = await prisma.user.findUnique({
      where: { id: userId },

      include: {
        devices: {
          include: {
            waterUsages: {
              orderBy: {
                timestamp: 'asc',
              },

              take: takeLimit,
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Customer not found', 404);
    }

    const chartData = user.devices.map((device) => ({
      deviceId: device.id,
      deviceName: device.name,

      data: device.waterUsages.map((usage) => ({
        timestamp: usage.timestamp,
        cumulative: usage.cumulative,
        forward: usage.forward,
        backward: usage.backward,
      })),
    }));

    res.success(
      chartData,
      'Chart data fetched successfully',
      200
    );
  });

  /**
   * GET /api/v1/dashboard/admin
   * Admin stats
   */
  static getAdminStats = asyncHandler(async (req, res) => {
    const stats = await DashboardService.getAdminStats();

    res.success(
      stats,
      'Admin dashboard stats fetched successfully',
      200
    );
  });

  /**
   * GET /api/v1/dashboard/customer/:deviceId
   * Device stats
   */
  static getDeviceStats = asyncHandler(async (req, res) => {
    const { deviceId } = req.params;

    const stats = await DashboardService.getDeviceStats(deviceId);

    res.success(
      stats,
      'Device stats fetched successfully',
      200
    );
  });

  /**
   * GET /api/v1/dashboard/admin/chart
   * Grafik volume pemakaian air admin
   */
  static getAdminChart = asyncHandler(async (req, res) => {
    const bills = await prisma.bill.findMany({
      orderBy: {
        billingDate: 'asc',
      },
    });

    const chartData = bills.map((bill) => ({
      month: bill.billingPeriod,
      usage: bill.waterUsage,
      amount: bill.totalAmount,
      status: bill.status,
    }));

    res.success(
      chartData,
      'Admin chart fetched successfully',
      200
    );
  });

  /**
   * GET /api/v1/dashboard/admin/payment-status
   * Sebaran status pembayaran
   */
  static getPaymentStatus = asyncHandler(async (req, res) => {
    const paid = await prisma.bill.count({
      where: {
        status: 'PAID',
      },
    });

    const unpaid = await prisma.bill.count({
      where: {
        status: 'UNPAID',
      },
    });

    res.success(
      {
        paid,
        unpaid,
        total: paid + unpaid,
      },
      'Payment status fetched successfully',
      200
    );
  });
}