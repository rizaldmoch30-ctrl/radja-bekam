"use client";

import { useState, useEffect, useMemo } from "react";
import { Download, FileText, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type FinanceTransaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  date: string;
};

export default function AdminLabaRugiPage() {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [investorPercentage, setInvestorPercentage] = useState<number>(0);
  const [managementPercentage, setManagementPercentage] = useState<number>(0);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/finance?startDate=${selectedYear}-01-01&endDate=${selectedYear}-12-31`);
      if (res.ok) setTransactions(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedYear]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const filteredTransactions = useMemo(() => {
    if (selectedMonth === "ALL") return transactions;
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === parseInt(selectedMonth);
    });
  }, [transactions, selectedMonth]);

  const reportData = useMemo(() => {
    let incomeCategories: Record<string, number> = {};
    let expenseCategories: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpense = 0;

    filteredTransactions.forEach(t => {
      if (t.type === "INCOME") {
        totalIncome += t.amount;
        incomeCategories[t.category] = (incomeCategories[t.category] || 0) + t.amount;
      } else {
        totalExpense += t.amount;
        expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
      }
    });

    const hppCategories = ["Komisi Terapis", "Bahan Baku", "Gaji Terapis"];
    let hppTotal = 0;
    let operasionalTotal = 0;
    let otherExpensesTotal = 0;

    const hppItems: {name: string, amount: number}[] = [];
    const operasionalItems: {name: string, amount: number}[] = [];

    Object.entries(expenseCategories).forEach(([cat, amount]) => {
      if (hppCategories.includes(cat) || cat.toLowerCase().includes("terapis") || cat.toLowerCase().includes("bahan")) {
        hppTotal += amount;
        hppItems.push({name: cat, amount});
      } else {
        operasionalTotal += amount;
        operasionalItems.push({name: cat, amount});
      }
    });

    const labaKotor = totalIncome - hppTotal;
    const labaBersih = labaKotor - operasionalTotal;
    
    const investorShare = labaBersih > 0 ? labaBersih * (investorPercentage / 100) : 0;
    const managementShare = labaBersih > 0 ? labaBersih * (managementPercentage / 100) : 0;
    const labaDitahan = labaBersih - investorShare - managementShare;

    return {
      incomeItems: Object.entries(incomeCategories).map(([name, amount]) => ({name, amount})),
      totalIncome,
      hppItems,
      hppTotal,
      labaKotor,
      operasionalItems,
      operasionalTotal,
      labaBersih,
      investorShare,
      managementShare,
      labaDitahan,
      investorPercentage,
      managementPercentage
    };
  }, [filteredTransactions, investorPercentage, managementPercentage]);

  const monthlyChartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const data = months.map(m => ({ name: m, Pemasukan: 0, Pengeluaran: 0, LabaBersih: 0 }));

    transactions.forEach(t => {
      const mIdx = new Date(t.date).getMonth();
      if (t.type === "INCOME") {
        data[mIdx].Pemasukan += t.amount;
      } else {
        data[mIdx].Pengeluaran += t.amount;
      }
    });

    data.forEach(d => {
      d.LabaBersih = d.Pemasukan - d.Pengeluaran;
    });

    return data;
  }, [transactions]);

  const handleExportCSV = () => {
    const csvRows = [
      ["Laporan Laba Rugi"],
      [`Tahun: ${selectedYear}`, `Bulan: ${selectedMonth === "ALL" ? "Semua Bulan" : selectedMonth}`],
      [""],
      ["Keterangan", "Nominal"],
      ["PENDAPATAN"],
      ...reportData.incomeItems.map(i => [`  ${i.name}`, i.amount]),
      ["TOTAL PENDAPATAN", reportData.totalIncome],
      [""],
      ["HARGA POKOK PENJUALAN (HPP) / BIAYA LANGSUNG"],
      ...reportData.hppItems.map(i => [`  ${i.name}`, i.amount]),
      ["TOTAL HPP", reportData.hppTotal],
      [""],
      ["LABA KOTOR", reportData.labaKotor],
      [""],
      ["BIAYA OPERASIONAL"],
      ...reportData.operasionalItems.map(i => [`  ${i.name}`, i.amount]),
      ["TOTAL BIAYA OPERASIONAL", reportData.operasionalTotal],
      [""],
      ["LABA BERSIH SEBELUM BAGI HASIL", reportData.labaBersih],
      [`BAGI HASIL INVESTOR (${reportData.investorPercentage}%)`, reportData.investorShare],
      [`BAGI HASIL MANAJEMEN (${reportData.managementPercentage}%)`, reportData.managementShare],
      [""],
      ["LABA BERSIH AKHIR (LABA DITAHAN)", reportData.labaDitahan]
    ];

    const csvData = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laba_Rugi_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader 
          title="Laporan Laba Rugi"
          description="Laporan akuntansi standar untuk menganalisis keuntungan klinik."
          icon={FileText}
          rightContent={
            <div className="flex gap-3 items-center">
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 text-sm appearance-none transition-all cursor-pointer [&>option]:text-gray-900"
              >
                {[...Array(5)].map((_, i) => {
                  const y = new Date().getFullYear() - i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 text-sm appearance-none transition-all cursor-pointer [&>option]:text-gray-900"
              >
                <option value="ALL">Semua Bulan</option>
                <option value="1">Januari</option>
                <option value="2">Februari</option>
                <option value="3">Maret</option>
                <option value="4">April</option>
                <option value="5">Mei</option>
                <option value="6">Juni</option>
                <option value="7">Juli</option>
                <option value="8">Agustus</option>
                <option value="9">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 ">
                <span className="text-white text-sm font-medium">Bagi Hasil Investor:</span>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={investorPercentage} 
                  onChange={(e) => setInvestorPercentage(Number(e.target.value))}
                  className="w-12 bg-transparent border-b border-white/30 focus:border-white focus:outline-none text-white text-center text-sm font-bold"
                />
                <span className="text-white text-sm">%</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 ">
                <span className="text-white text-sm font-medium">Bagi Hasil Manajemen:</span>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={managementPercentage} 
                  onChange={(e) => setManagementPercentage(Number(e.target.value))}
                  className="w-12 bg-transparent border-b border-white/30 focus:border-white focus:outline-none text-white text-center text-sm font-bold"
                />
                <span className="text-white text-sm">%</span>
              </div>
              <button
                onClick={handleExportCSV}
                className="bg-white text-indigo-900 hover:bg-gray-50 px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/10"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          }
        />

        {loading ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl mt-8">Memuat laporan...</div>
        ) : (
          <div className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Pendapatan</p>
                  <p className="text-2xl font-black text-gray-900">{formatRupiah(reportData.totalIncome)}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0">
                  <DollarSign className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Laba Kotor</p>
                  <p className="text-2xl font-black text-gray-900">{formatRupiah(reportData.labaKotor)}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Laba Bersih</p>
                  <p className="text-2xl font-black text-gray-900">{formatRupiah(reportData.labaBersih)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Laporan Laba Rugi Table */}
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-lg text-gray-800">Laporan Laba Rugi</h3>
                </div>
                <div className="p-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {/* PENDAPATAN */}
                      <tr>
                        <td colSpan={2} className="font-bold text-gray-900 pb-2 text-base">PENDAPATAN</td>
                      </tr>
                      {reportData.incomeItems.map(item => (
                        <tr key={item.name}>
                          <td className="py-2 pl-4 text-gray-600">{item.name}</td>
                          <td className="py-2 text-right font-medium">{formatRupiah(item.amount)}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-gray-200">
                        <td className="py-3 font-bold text-gray-800">TOTAL PENDAPATAN</td>
                        <td className="py-3 text-right font-bold text-blue-600">{formatRupiah(reportData.totalIncome)}</td>
                      </tr>

                      {/* HPP */}
                      <tr>
                        <td colSpan={2} className="font-bold text-gray-900 pt-6 pb-2 text-base">HARGA POKOK PENJUALAN (HPP)</td>
                      </tr>
                      {reportData.hppItems.map(item => (
                        <tr key={item.name}>
                          <td className="py-2 pl-4 text-gray-600">{item.name}</td>
                          <td className="py-2 text-right font-medium">{formatRupiah(item.amount)}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-gray-200">
                        <td className="py-3 font-bold text-gray-800">TOTAL HPP</td>
                        <td className="py-3 text-right font-bold text-red-500">({formatRupiah(reportData.hppTotal)})</td>
                      </tr>

                      {/* LABA KOTOR */}
                      <tr className="bg-amber-50">
                        <td className="py-3 px-4 font-bold text-gray-900 rounded-l-lg">LABA KOTOR</td>
                        <td className="py-3 px-4 text-right font-bold text-amber-700 rounded-r-lg">{formatRupiah(reportData.labaKotor)}</td>
                      </tr>

                      {/* OPERASIONAL */}
                      <tr>
                        <td colSpan={2} className="font-bold text-gray-900 pt-6 pb-2 text-base">BIAYA OPERASIONAL</td>
                      </tr>
                      {reportData.operasionalItems.map(item => (
                        <tr key={item.name}>
                          <td className="py-2 pl-4 text-gray-600">{item.name}</td>
                          <td className="py-2 text-right font-medium">{formatRupiah(item.amount)}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-gray-200">
                        <td className="py-3 font-bold text-gray-800">TOTAL BIAYA OPERASIONAL</td>
                        <td className="py-3 text-right font-bold text-red-500">({formatRupiah(reportData.operasionalTotal)})</td>
                      </tr>

                      {/* LABA BERSIH SEBELUM BAGI HASIL */}
                      <tr className="bg-emerald-50">
                        <td className="py-4 px-4 font-bold text-gray-900 text-base rounded-l-lg">LABA BERSIH SEBELUM BAGI HASIL</td>
                        <td className="py-4 px-4 text-right font-bold text-emerald-700 text-base rounded-r-lg">{formatRupiah(reportData.labaBersih)}</td>
                      </tr>

                      {/* BAGI HASIL INVESTOR */}
                      {reportData.investorPercentage > 0 && (
                        <tr className="border-t border-gray-200">
                          <td className="py-3 px-4 font-bold text-gray-800">
                            DIKURANGI: BAGI HASIL INVESTOR ({reportData.investorPercentage}%)
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-red-500">
                            ({formatRupiah(reportData.investorShare)})
                          </td>
                        </tr>
                      )}

                      {/* BAGI HASIL MANAJEMEN */}
                      {reportData.managementPercentage > 0 && (
                        <tr className="border-t border-gray-200">
                          <td className="py-3 px-4 font-bold text-gray-800">
                            DIKURANGI: BAGI HASIL MANAJEMEN ({reportData.managementPercentage}%)
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-red-500">
                            ({formatRupiah(reportData.managementShare)})
                          </td>
                        </tr>
                      )}

                      {/* LABA BERSIH AKHIR (LABA DITAHAN) */}
                      <tr className="bg-indigo-50 border-t-2 border-indigo-100">
                        <td className="py-4 px-4 font-black text-gray-900 text-lg rounded-l-lg">
                          LABA BERSIH AKHIR <span className="text-sm font-normal text-gray-600 block sm:inline sm:ml-2">(Laba Ditahan Klinik)</span>
                        </td>
                        <td className="py-4 px-4 text-right font-black text-indigo-700 text-lg rounded-r-lg">
                          {formatRupiah(reportData.labaDitahan)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Grafik Analitik Bulanan */}
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-lg text-gray-800">Analitik Laba Rugi {selectedYear}</h3>
                </div>
                <div className="p-6 flex-1 min-h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(val) => `Rp${(val/1000000).toFixed(0)}M`} axisLine={false} tickLine={false} />
                      <Tooltip 
                        formatter={(value: any) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(value))}
                        cursor={{fill: '#f8fafc'}}
                      />
                      <Legend />
                      <Bar dataKey="Pemasukan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="LabaBersih" name="Laba Bersih" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
