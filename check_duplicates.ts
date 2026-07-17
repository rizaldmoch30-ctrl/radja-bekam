import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./src/lib/db";
import { services } from "./src/lib/db/schema";

async function run() {
  const allSvcs = await db.select().from(services);
  
  const zeroSvcs = allSvcs.filter(s => s.globalCommission === 0);
  
  console.log("Checking duplicates for 0 commission services...");
  for (const zs of zeroSvcs) {
    const baseName = zs.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
    
    const duplicates = allSvcs.filter(s => 
      s.id !== zs.id && 
      s.name.replace(/[^a-zA-Z]/g, '').toLowerCase() === baseName
    );
    
    if (duplicates.length > 0) {
      console.log(`\nFound duplicates for "${zs.name}" (ID: ${zs.id}, GC: ${zs.globalCommission}):`);
      for (const d of duplicates) {
        console.log(`  - "${d.name}" (ID: ${d.id}, GC: ${d.globalCommission})`);
      }
    }
  }
}

run().then(() => process.exit(0));
