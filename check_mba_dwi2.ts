import { config } from "dotenv";
config({ path: ".env.local" }); 

async function run() {
  const { db } = await import("./src/lib/db");
  const { financeTransactions } = await import("./src/lib/db/schema");
  const { eq, like } = await import("drizzle-orm");

  const invId = "f947dbbb-ef35-4221-872e-d8e7883447de"; // MBA DWI
  const finTxs = await db.select().from(financeTransactions).where(like(financeTransactions.description, `%${invId}%`));
  console.log("Finance transactions matching description:");
  console.log(finTxs);
}

run().then(() => process.exit(0)).catch(console.error);
