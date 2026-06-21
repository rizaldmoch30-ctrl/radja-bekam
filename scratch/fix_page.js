const fs = require('fs');
const path = 'c:/Users/Dell/Documents/radja bekam/src/app/admin/visits/page.tsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const replacement = `                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Kunjungan Batal</p>
                          <h4 className="text-2xl font-black text-gray-900 mt-1">{recapData.summary.totalCancelled || 0}</h4>
                        </div>
                      </div>
                    </div>

                    {/* Simple Recap Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6 animate-in fade-in duration-300">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Terapis</th>
                              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total Kunjungan</th>
                              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pendapatan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {recapData.therapistStats && recapData.therapistStats.map((stat: any) => (
                              <tr key={stat.therapistId} className="hover:bg-indigo-50/30 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="font-bold text-gray-900">{getTherapistName(stat.therapistId)}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-700">{stat.visitCount}</td>
                                <td className="px-6 py-4 font-bold text-emerald-600">{formatRupiah(stat.revenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-500">Fitur Tampilan Bulanan sedang dalam pemeliharaan.</p>
              </div>
            )}
          </div>
        )}

        {/* ===== TAB: BUAT STRUK ===== */}
        {activeTab === "pos" && (
          <div className="bg-white rounded-2xl shadow-sm">
            {renderPOSFormContent()}
          </div>
        )}`;

// replace lines 1264 to 1591 (inclusive)
// line 1264 is index 1263
const startIdx = 1263;
const endIdx = 1590;

const newLines = [
  ...lines.slice(0, startIdx),
  replacement,
  ...lines.slice(endIdx + 1)
];

fs.writeFileSync(path, newLines.join('\n'));
console.log("Successfully replaced the corrupted section.");
