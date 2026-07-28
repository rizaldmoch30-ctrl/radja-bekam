const postgres = require('postgres');
const sql = postgres('postgresql://postgres.sjsrhuvcigxxhgjebatr:radjabekam2024@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1');

async function run() {
  const res = await sql`SELECT * FROM invoices WHERE patient_name ILIKE '%MARNAH%'`;
  console.log('INVOICES:', res);

  const res2 = await sql`SELECT * FROM patient_visits WHERE patient_id IN (SELECT patient_id FROM invoices WHERE patient_name ILIKE '%MARNAH%')`;
  console.log('VISITS:', res2);

  const res3 = await sql`SELECT * FROM therapist_commissions WHERE visit_id IN (SELECT id FROM patient_visits WHERE patient_id IN (SELECT patient_id FROM invoices WHERE patient_name ILIKE '%MARNAH%'))`;
  console.log('COMMISSIONS:', res3);

  process.exit(0);
}
run();