const fs = require('fs');
const path = 'c:/Users/Dell/Documents/radja bekam/src/app/admin/visits/page.tsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Add posModalOpen state
content = content.replace(
  'const [posVisitId, setPosVisitId] = useState<string | null>(null);',
  'const [posVisitId, setPosVisitId] = useState<string | null>(null);\n  const [posModalOpen, setPosModalOpen] = useState(false);'
);

// 2. Change setActiveTab("pos") to setPosModalOpen(true) in handleOpenPOSForVisit
content = content.replace(
  '    setPosVisitId(visitId);\n    setActiveTab("pos");',
  '    setPosVisitId(visitId);\n    setPosModalOpen(true);'
);

// 3. resetPOSForm should also reset posModalOpen (optional but good)
content = content.replace(
  '    setPosVisitId(null);\n  };',
  '    setPosVisitId(null);\n    setPosModalOpen(false);\n  };'
);

// 4. Extract POS form content into a function
// Let's locate the POS tab rendering
const posStartMarker = '{/* ===== TAB: BUAT STRUK ===== */}';
const posEndMarker = '{/* ===== TAB: RIWAYAT STRUK ===== */}';

const startIndex = content.indexOf(posStartMarker);
const endIndex = content.indexOf(posEndMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find POS block");
  process.exit(1);
}

const posBlock = content.substring(startIndex, endIndex);

// posBlock contains:
// {/* ===== TAB: BUAT STRUK ===== */}
// {activeTab === "pos" && !posCreatedInvoice && (
//   <form ...> ... </form>
// )}
// {/* ===== POST-PAYMENT SUCCESS ===== */}
// {activeTab === "pos" && posCreatedInvoice && (
//   <div ...> ... </div>
// )}

// Let's replace `activeTab === "pos" && ` with empty in the extracted logic
let extractedJSX = posBlock
  .replace('{activeTab === "pos" && !posCreatedInvoice && (', '{!posCreatedInvoice ? (')
  .replace('</form>\n        )}', '</form>\n        ) : (')
  .replace('{/* ===== POST-PAYMENT SUCCESS ===== */}', '')
  .replace('{activeTab === "pos" && posCreatedInvoice && (', '')
  .replace('          </div>\n        )}', '          </div>\n        )}'); // wait, better to just use Regex to precisely grab the form and success div

// Since exact replacement is tricky, let's just do:
const formStart = posBlock.indexOf('<form onSubmit={handlePOSSubmit}>');
const formEnd = posBlock.indexOf('</form>') + '</form>'.length;
const formCode = posBlock.substring(formStart, formEnd);

const successStart = posBlock.indexOf('<div className="max-w-lg mx-auto animate-in fade-in duration-300">');
const successEnd = posBlock.lastIndexOf('</div>\n        )}') + '</div>'.length; // approximate
const successCode = posBlock.substring(successStart, posBlock.lastIndexOf('</div>\n        )') + 6); // Just grab to the last div before )}

const renderFunction = `  const renderPOSFormContent = () => (
    <>
      {!posCreatedInvoice ? (
${formCode}
      ) : (
${successCode}
      )}
    </>
  );
`;

// Insert render function before return (
const returnIndex = content.indexOf('  return (\n    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/50 min-h-screen">');
content = content.substring(0, returnIndex) + renderFunction + '\n' + content.substring(returnIndex);

// Replace the original POS block with a call to the render function
const newPosBlock = `${posStartMarker}\n        {activeTab === "pos" && renderPOSFormContent()}\n\n        `;
content = content.substring(0, startIndex) + newPosBlock + content.substring(endIndex);

// Append Modal at the bottom before final </div>
const modalCode = `
      {posModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">Kasir POS</h3>
              <button 
                onClick={() => { setPosModalOpen(false); resetPOSForm(); fetchData(); }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-gray-50/50 custom-scrollbar">
               {renderPOSFormContent()}
            </div>
          </div>
        </div>
      )}
`;

const finalDivIndex = content.lastIndexOf('</div>\n  );\n}');
content = content.substring(0, finalDivIndex) + modalCode + content.substring(finalDivIndex);

fs.writeFileSync(path, content, 'utf8');
console.log("Refactoring complete");
