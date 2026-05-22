import { Xendit } from "xendit-node";
import dotenv from "dotenv";

dotenv.config();

// Initialize Xendit Client
const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY,
});

// Export Invoice API
export const Invoice = xenditClient.Invoice;

// Optional: export full client if needed
export default xenditClient;