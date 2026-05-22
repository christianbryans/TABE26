INSERT INTO bills (
  id,
  "customerId",
  "billNumber",
  "billingPeriod",
  "billingDate",
  "dueDate",
  "waterUsage",
  "unitPrice",
  "totalAmount",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  '656357db-9da9-4b73-ad40-2815aa1ad9c9',
  'BILL-001',
  'May 2026',
  NOW(),
  '2026-06-01',
  100,
  500,
  50000,
  'UNPAID',
  NOW(),
  NOW()
);