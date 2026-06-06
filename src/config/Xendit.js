import { Xendit } from "xendit-node";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.XENDIT_SECRET_KEY;
let xenditClient = null;
let invoiceClient = null;

if (secretKey) {
  xenditClient = new Xendit({
    secretKey,
  });

  const { Invoice } = xenditClient;
  invoiceClient = Invoice;
} else {
  console.warn(
    "⚠️ XENDIT_SECRET_KEY is not configured. Xendit invoice features will be disabled."
  );
}

export { invoiceClient };
export default xenditClient;