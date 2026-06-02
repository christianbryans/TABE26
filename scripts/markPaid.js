import prisma from '../src/config/db.js';

async function main(){
  try{
    const userId = 'P0001';
    const targetMonths = [
      { name: 'March', year: 2026, payDate: new Date('2026-04-02T10:00:00Z') },
      { name: 'April', year: 2026, payDate: new Date('2026-05-31T10:00:00Z') },
      { name: 'May', year: 2026, payDate: new Date('2026-06-02T10:00:00Z') }
    ];

    for(const m of targetMonths){
      const billingPeriod = `${m.name} ${m.year}`;
      let bill = await prisma.bill.findFirst({ where: { userId, billingPeriod } });

      if(!bill){
        // create a sample bill for that month
        const monthIndex = new Date(`${m.name} 1, ${m.year}`).getMonth();
        const billingDate = new Date(m.year, monthIndex, 1);
        const dueDate = new Date(m.year, monthIndex + 1, 20);
        const totalAmount = (m.name === 'May') ? 1062500 : (m.name === 'April' ? 100857 : 50000);

        bill = await prisma.bill.create({ data: {
          userId,
          customer_number: (await prisma.user.findUnique({ where: { id: userId } })).customer_number,
          billNumber: `INV-${Date.now()}-${monthIndex}`,
          billingPeriod,
          billingDate,
          dueDate,
          waterUsage: Math.round((totalAmount / 5000) * 10) / 10,
          unitPrice: 5000,
          totalAmount,
          status: 'UNPAID'
        }});

        console.log('Created bill', bill.billNumber, billingPeriod);
      }

      // mark as paid and add payment record
      await prisma.$transaction([
        prisma.bill.update({ where: { id: bill.id }, data: { status: 'PAID', updatedAt: m.payDate, paymentUrl: null } }),
        prisma.payment.upsert({
          where: { referenceNumber: `SIM-PAID-${bill.billNumber}` },
          create: {
            referenceNumber: `SIM-PAID-${bill.billNumber}`,
            billId: bill.id,
            amount: Number(bill.totalAmount) || 0,
            paymentMethod: 'XENDIT (MANUAL)',
            status: 'paid',
            createdAt: m.payDate,
            updatedAt: m.payDate
          },
          update: { status: 'paid', amount: Number(bill.totalAmount) || 0, updatedAt: m.payDate }
        })
      ]);

      console.log(`Marked ${billingPeriod} as PAID (paid at ${m.payDate.toISOString()})`);
    }

    const res = await prisma.bill.findMany({ where: { userId }, orderBy: { billingDate: 'asc' }, include: { payments: true } });
    console.log(JSON.stringify(res.map(r=>({billNumber:r.billNumber,status:r.status,updatedAt:r.updatedAt,payments:r.payments})),null,2));

  }catch(err){
    console.error(err);
  }finally{
    await prisma.$disconnect();
  }
}

main();
