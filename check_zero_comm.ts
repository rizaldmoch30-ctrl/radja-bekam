import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./src/lib/db";
import { services } from "./src/lib/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const svcs = await db.select().from(services).where(eq(services.globalCommission, 0));
  console.log("Services with 0 commission:", svcs.map(s => ({ name: s.name, id: s.id })));
}

run().then(() => process.exit(0));
