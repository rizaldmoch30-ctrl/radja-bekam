const fs = require('fs');
const path = 'c:/Users/Dell/Documents/radja bekam/src/app/admin/visits/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update getWhatsAppLink and handleSendWA definitions
// We can actually just delete getWhatsAppLink since it's not used anymore!
// Wait, let's just replace handleSendWA entirely and remove getWhatsAppLink.

const oldFuncBlock = `  const getWhatsAppLink = (invoiceId: string, name: string, branchName: string, total: number, date: string) => {
    const receiptUrl = \`\${window.location.origin}/receipt/\${invoiceId}\`;
    const dateFormatted = new Date(date).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
    const msg = \`Assalamualaikum \${name},\\nTerima kasih telah mempercayakan ikhtiar sehatnya di *Radja Bekam cabang \${branchName}* 🙏\\n\\nBerikut struk digital Anda:\\n🧾 \${receiptUrl}\\n\\nTotal: *\${formatRupiah(total)}*\\nTanggal: \${dateFormatted}\\n\\n_Semoga lekas sehat dan senantiasa diberi keberkahan. Kami tunggu kunjungan berikutnya!_\\n\\n— Tim Radja Bekam\`;
    return msg;
  };

  const handleSendWA = (phone: string, invoiceId: string, name: string, branchName: string, total: number, date: string) => {
    const msg = getWhatsAppLink(invoiceId, name, branchName, total, date);
    const cleanPhone = phone.replace(/^0/, "62").replace(/\\D/g, "");
    window.open(\`https://wa.me/\${cleanPhone}?text=\${encodeURIComponent(msg)}\`, "_blank");
  };`;

const newFuncBlock = `  const handleSendWA = (invoiceId: string) => {
    window.open(\`/receipt/\${invoiceId}?wa=1\`, "_blank");
  };`;

content = content.replace(oldFuncBlock, newFuncBlock);

// 2. Replace call in POS Modal
const oldCall1 = `handleSendWA(posPhone, posCreatedInvoice.id, posPatientName, branch?.name || "", posCreatedInvoice.grandTotal, new Date().toISOString());`;
const newCall1 = `handleSendWA(posCreatedInvoice.id);`;
content = content.replace(oldCall1, newCall1);

// 3. Replace call in Riwayat Struk
const oldCall2 = `onClick={() => handleSendWA(inv.patientPhone, inv.id, inv.patientName, inv.branchName, inv.grandTotal, inv.createdAt)}`;
const newCall2 = `onClick={() => handleSendWA(inv.id)}`;
content = content.replace(oldCall2, newCall2);

fs.writeFileSync(path, content);
console.log("Successfully updated page.tsx to use simplified handleSendWA");
