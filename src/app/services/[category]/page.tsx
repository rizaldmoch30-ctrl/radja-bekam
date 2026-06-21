import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, ShieldAlert } from "lucide-react";

export default async function CategoryServicePage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  
  const categoryData: Record<string, { title: string, description: string, image: string, services: any[] }> = {
    bekam: {
      title: "Layanan Terapi Bekam",
      description: "Terapi pengeluaran darah kotor (toksin) dari dalam tubuh melalui permukaan kulit dengan peralatan steril. Mengembalikan kebugaran dan menyembuhkan berbagai penyakit secara alami.",
      image: "/bekam_banner.png",
      services: [
        { name: "Bekam Sunnah", price: "Rp 60.000", detail: "15 Titik", image: "/images/services/service_bekam.png", benefits: ["Sesuai tuntunan sunnah", "Melancarkan peredaran darah", "Detoksifikasi"] },
        { name: "Bekam Holistik", price: "Rp 99.000", detail: "25 Titik", image: "/images/services/bekam-holistik.png", benefits: ["Menyeluruh seluruh tubuh", "Titik maksimal", "Perbaikan imun ekstra"] },
        { name: "Bekam Tradisional", price: "Rp 55.000", detail: "15 Titik", image: "/images/services/bekam-sunnah.png", benefits: ["Teknik tradisional", "Meredakan masuk angin", "Menghilangkan pegal"] },
        { name: "Bekam Estetika", price: "Rp 50.000", detail: "8 Titik", image: "/images/services/service_bekam_estetika.png", benefits: ["Titik khusus estetika", "Mengencangkan kulit", "Mencerahkan wajah"] },
        { name: "Bekam Kepala (Tanpa Cukur)", price: "Rp 50.000", detail: "3 Titik", image: "/images/services/service_bekam_kepala.png", benefits: ["Tanpa perlu cukur rambut", "Meringankan migrain", "Meredakan stres"] },
      ]
    },
    refleksi: {
      title: "Pijat Refleksi & Relaksasi",
      description: "Terapi pijat yang berfokus pada titik-titik saraf tubuh untuk mengembalikan energi dan menghilangkan stres.",
      image: "/refleksi_banner.png",
      services: [
        { name: "Refleksi Full Body (Reguler)", price: "Rp 75.000", detail: "50 Menit", image: "/images/services/service_refleksi.png", benefits: ["Pijat seluruh tubuh", "Mengendurkan otot kaku", "Relaksasi pikiran"] },
        { name: "Refleksi Full Body (Double)", price: "Rp 149.000", detail: "100 Menit", image: "/images/services/pijat-refleksi.png", benefits: ["Durasi ekstra panjang", "Free Bekam Kerok / Totok Wajah", "Relaksasi maksimal"] },
      ]
    },
    mcu: {
      title: "Medical Check Up",
      description: "Pemeriksaan kesehatan dasar untuk mendeteksi kondisi tubuh secara dini sebelum terlambat.",
      image: "/mcu_banner.png",
      services: [
        { name: "Cek Asam Urat", price: "Rp 15.000", detail: "Cek Cepat", image: "/images/services/service_mcu.png", benefits: ["Hasil akurat", "Hanya butuh 1 tetes darah"] },
        { name: "Cek Gula Darah", price: "Rp 15.000", detail: "Cek Cepat", image: "/images/services/service_mcu.png", benefits: ["Hasil akurat", "Penting untuk penderita diabetes"] },
        { name: "Cek Kolesterol", price: "Rp 30.000", detail: "Cek Cepat", image: "/images/services/service_mcu.png", benefits: ["Pantau kesehatan jantung", "Cegah kolesterol tinggi"] },
        { name: "Paket Lengkap MCU", price: "Rp 55.000", detail: "Semua Cek", image: "/images/services/paket-bundling.png", benefits: ["Asam Urat, Gula Darah, Kolesterol", "Lebih hemat", "Deteksi menyeluruh"] },
      ]
    },
    "adds-on": {
      title: "Adds On Treatment",
      description: "Layanan tambahan ringan yang bisa disisipkan untuk melengkapi terapi utama Anda.",
      image: "/adds_on_banner.png",
      services: [
        { name: "Totok Wajah", price: "Rp 30.000", detail: "15 Menit", image: "/images/services/service_bekam_estetika.png", benefits: ["Mencerahkan wajah", "Mengurangi ketegangan mata", "Meremajakan kulit"] },
        { name: "Tambahan Infra red", price: "Rp 20.000", detail: "20 Menit", image: "/images/services/bekam-holistik.png", benefits: ["Terapi pemanasan", "Memperlancar aliran darah", "Membantu penetrasi obat/minyak"] },
      ]
    }
  };

  const data = categoryData[category];
  
  if (!data) {
    return notFound();
  }

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Header */}
      <section className="relative text-primary-foreground py-24 md:py-32 text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={data.image}
            alt={data.title}
            fill
            className="object-cover object-center"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/65 z-10"></div>
        </div>
        <div className="container mx-auto px-4 relative z-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#86c7c2] drop-shadow-md">{data.title}</h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto drop-shadow-lg">
            {data.description}
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {data.services.map((service, index) => {
              const imgSrc = service.image || data.image;

              return (
                <div key={index} className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group">
                  
                  {/* Column 1: Image */}
                  <div className="w-full md:w-1/3 h-56 md:h-auto relative overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-border">
                     <Image 
                       src={imgSrc} 
                       alt={service.name} 
                       fill 
                       className="object-cover group-hover:scale-110 transition-transform duration-700" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                     <div className="absolute bottom-4 left-5 right-5">
                       <span className="text-white font-bold text-xl drop-shadow-md leading-tight block">{service.name}</span>
                     </div>
                  </div>

                  {/* Column 2: Price & Booking */}
                  <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col justify-center bg-primary/5 border-b md:border-b-0 md:border-r border-border relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/50 rounded-bl-full -z-0"></div>
                    <h3 className="text-xl font-bold text-foreground mb-1 hidden md:block relative z-10">{service.name}</h3>
                    <div className="text-3xl font-black text-primary mb-2 relative z-10">{service.price}</div>
                    <div className="text-sm font-medium text-foreground/70 mb-6 bg-white inline-block px-3 py-1 rounded-md w-max shadow-sm border border-border relative z-10">
                      {service.detail}
                    </div>
                    <Link
                      href={`/booking?service=${service.name}`}
                      className="w-full text-center bg-gradient-to-r from-[#86c7c2] to-[#60a8a3] hover:from-[#72b1ab] hover:to-[#509691] text-white py-3 rounded-xl font-bold transition-all duration-300 mt-auto shadow-md hover:shadow-lg hover:-translate-y-0.5 relative z-10"
                    >
                      Booking Sekarang
                    </Link>
                  </div>

                  {/* Column 3: Benefits */}
                  <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col justify-center bg-white relative">
                    <h4 className="font-bold text-foreground mb-4 text-base border-b border-gray-100 pb-2">Yang Anda Dapatkan:</h4>
                    <ul className="space-y-3 relative z-10">
                      {service.benefits?.map((benefit: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-foreground/80 group/item">
                          <div className="mt-0.5 bg-green-50 rounded-full p-1 group-hover/item:bg-green-100 transition-colors border border-green-100">
                             <Check className="h-3 w-3 text-green-600" strokeWidth={3} />
                          </div>
                          <span className="text-[14px] leading-relaxed">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SOP Sterilisasi */}
      <section className="py-16 bg-secondary/30 mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-background p-8 md:p-12 rounded-3xl border border-primary/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <ShieldAlert className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-3">SOP Keamanan & Sterilisasi Alat</h2>
                <p className="text-foreground/70 mb-4">
                  Keamanan Anda adalah prioritas utama kami. Kami menerapkan standar medis yang ketat untuk mencegah penularan penyakit.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                    <span className="text-foreground/80"><strong>Jarum Sekali Pakai (Single Use):</strong> Jarum bekam selalu baru untuk setiap pasien dan langsung dibuang ke kotak limbah medis khusus.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                    <span className="text-foreground/80"><strong>Sterilisasi Cup Bekam:</strong> Cup yang digunakan dicuci dengan disinfektan medis tingkat tinggi dan disterilkan menggunakan mesin sterilisator UV & Ozon.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                    <span className="text-foreground/80"><strong>APD Terapis:</strong> Terapis diwajibkan menggunakan sarung tangan medis (handscoon) dan masker selama prosedur tindakan.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
