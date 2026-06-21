const fs = require('fs');
const path = 'c:/Users/Dell/Documents/radja bekam/src/app/receipt/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add autoWa
const searchParamLine = `  const autoPrint = searchParams?.get("print") === "1";`;
const autoWaLine = `  const autoPrint = searchParams?.get("print") === "1";\n  const autoWa = searchParams?.get("wa") === "1";`;
content = content.replace(searchParamLine, autoWaLine);

// 2. Add useEffect for autoWa
const autoPrintEffect = `  useEffect(() => {
    if (autoPrint && invoice && !loading) {
      setTimeout(() => window.print(), 500);
    }
  }, [autoPrint, invoice, loading]);`;

const autoWaEffect = `  useEffect(() => {
    if (autoPrint && invoice && !loading) {
      setTimeout(() => window.print(), 500);
    }
  }, [autoPrint, invoice, loading]);

  useEffect(() => {
    if (autoWa && invoice && !loading && receiptRef.current) {
      import("html2canvas").then(({ default: html2canvas }) => {
        setTimeout(() => {
          html2canvas(receiptRef.current, { scale: 2, useCORS: true }).then(canvas => {
            canvas.toBlob(blob => {
              if (blob) {
                // Download
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = \`struk-\${invoice.patientName.replace(/\\s+/g, "-")}.png\`;
                a.click();
                URL.revokeObjectURL(url);
                
                // WA Text
                const landingPageUrl = "https://radjabekam.com";
                const dateFormatted = new Date(invoice.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
                let itemsText = "";
                invoice.items.forEach(item => {
                  itemsText += \`- \${item.name} (\${item.qty}x)\\n\`;
                });
                
                const msg = \`Assalamualaikum \${invoice.patientName},\\nTerima kasih telah mempercayakan ikhtiar sehatnya di *Radja Bekam cabang \${invoice.branchName}* 🙏\\n\\nBerikut adalah detail layanan yang Anda terima:\\n\${itemsText}\\nTotal Pembayaran: *\${formatRupiah(invoice.grandTotal)}*\\nTanggal: \${dateFormatted}\\n\\nUntuk informasi lebih lanjut, kunjungi website kami:\\n\${landingPageUrl}\\n\\n_Semoga lekas sehat dan senantiasa diberi keberkahan. Kami tunggu kunjungan berikutnya!_\\n\\n— Tim Radja Bekam\`;
                
                const cleanPhone = invoice.patientPhone.replace(/^0/, "62").replace(/\\D/g, "");
                
                try {
                  navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]).then(() => {
                    alert("Gambar struk telah disalin ke Clipboard dan diunduh.\\n\\nSilakan buka chat WA pasien, lalu tekan Paste (Ctrl+V) untuk mengirim gambar struk.");
                    window.location.replace(\`https://wa.me/\${cleanPhone}?text=\${encodeURIComponent(msg)}\`);
                  }).catch(() => {
                    alert("Gambar struk telah diunduh.\\n\\nSilakan lampirkan (attach) gambar tersebut di chat WA pasien.");
                    window.location.replace(\`https://wa.me/\${cleanPhone}?text=\${encodeURIComponent(msg)}\`);
                  });
                } catch (e) {
                  alert("Gambar struk telah diunduh.\\n\\nSilakan lampirkan (attach) gambar tersebut di chat WA pasien.");
                  window.location.replace(\`https://wa.me/\${cleanPhone}?text=\${encodeURIComponent(msg)}\`);
                }
              }
            });
          });
        }, 800); // give time for font rendering
      });
    }
  }, [autoWa, invoice, loading]);`;

content = content.replace(autoPrintEffect, autoWaEffect);

fs.writeFileSync(path, content);
console.log("Successfully updated receipt page.tsx with WA Image support!");
