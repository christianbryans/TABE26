import prisma from "./src/config/db.js";

async function main() {
  const bill = await prisma.bill.create({
    data: {
      customerId: "656357db-9da9-4b73-ad40-2815aa1ad9c9",
      billNumber: "BILL-002",
      billingPeriod: "May 2026",
      dueDate: new Date("2026-06-01"),
      waterUsage: 100,
      unitPrice: 500,
      totalAmount: 50000,
      status: "UNPAID",
    },
  });

  console.log("Bill berhasil dibuat:");
  console.log(bill);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });