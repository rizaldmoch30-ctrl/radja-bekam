import Image from "next/image";
import { Award, HeartPulse, ShieldCheck, Users, CheckCircle2, ChevronRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full pb-0 bg-[#f8fafc]">
      {/* Hero Header */}
      <section className="relative bg-[#0a192f] text-white pt-32 pb-40 overflow-hidden">
        {/* Background Image & Effects */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero-bekam.png" 
            alt="Radja Bekam Hero" 
            fill 
            className="object-cover opacity-20 mix-blend-luminosity scale-105 animate-[kenburns_20s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-transparent to-transparent z-10 h-full w-full" style={{ bottom: '-2px' }}></div>
          <div className="absolute top-[20%] left-[10%] w-[40%] h-[60%] rounded-full bg-[#d4af37]/20 blur-[150px]"></div>
          <div className="absolute top-[10%] right-[10%] w-[30%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <span className="h-2 w-2 rounded-full bg-[#d4af37] animate-pulse"></span>
            <span className="text-[#d4af37] font-bold text-xs tracking-widest uppercase">Mengenal Kami</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            Tentang <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-amber-300">Radja Bekam</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
            Menelusuri rekam jejak, visi besar, dan dedikasi kami dalam menghadirkan solusi kesehatan sunnah terbaik untuk Anda.
          </p>
        </div>

        {/* Custom Animation Keyframes inline */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes kenburns {
            0% { transform: scale(1); }
            100% { transform: scale(1.08); }
          }
        `}} />
      </section>

      {/* Story Section */}
      <section className="relative -mt-20 z-30 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="bg-white rounded-[3rem] shadow-[0_20px_60px_rgb(0,0,0,0.05)] border border-gray-100 p-8 md:p-16 overflow-hidden relative">
            
            {/* Subtle background element inside card */}
            <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[80%] rounded-full bg-blue-50/50 blur-3xl pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
              
              {/* Left Image Side */}
              <div className="lg:w-1/2 relative w-full">
                <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                  <Image 
                    src="/hero-bekam.png"
                    alt="Klinik Radja Bekam"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -bottom-8 -right-8 md:-right-12 bg-gradient-to-br from-[#d4af37] to-amber-600 p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(212,175,55,0.3)] border border-white/20 backdrop-blur-xl hidden sm:block transform hover:-translate-y-2 transition-transform duration-500">
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-5xl font-black text-white mb-1 drop-shadow-md">5+</span>
                    <span className="text-amber-50 font-bold text-sm tracking-wider uppercase">Tahun Pengalaman</span>
                  </div>
                </div>
              </div>

              {/* Right Content Side */}
              <div className="lg:w-1/2 space-y-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-800 leading-[1.2] mb-6">
                    Solusi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-amber-500">Teman Sehatku</span>
                  </h2>
                  <div className="h-1.5 w-24 bg-gradient-to-r from-[#d4af37] to-amber-500 rounded-full"></div>
                </div>
                
                <p className="text-slate-600 leading-relaxed text-lg font-medium">
                  Radja Bekam didirikan dengan satu tujuan mulia: <strong>mempopulerkan pengobatan sunnah</strong> dengan mengawinkannya bersama standar medis modern dan profesionalisme tinggi. Kami percaya bahwa kesehatan sejati adalah harmoni antara raga, jiwa, dan spiritual.
                </p>
                <p className="text-slate-600 leading-relaxed text-lg font-medium">
                  Sejak cabang pertama kami melayani, kami terus meracik inovasi dalam terapi bekam dan pijat refleksi. Setiap sentuhan tidak hanya ditujukan untuk mengobati keluhan, namun juga mengembalikan kesegaran dan memberikan pengalaman relaksasi level premium untuk Anda.
                </p>

                <div className="pt-4 grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-amber-600" />
                    </div>
                    <span className="font-bold text-slate-700">Terapis Ahli</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-amber-600" />
                    </div>
                    <span className="font-bold text-slate-700">Alat Steril 100%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-amber-600" />
                    </div>
                    <span className="font-bold text-slate-700">Tempat Nyaman</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-amber-600" />
                    </div>
                    <span className="font-bold text-slate-700">Privasi Terjaga</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4">Visi & Misi Kami</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Fondasi kokoh yang menggerakkan setiap langkah kami dalam memberikan layanan kesehatan.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Visi Card */}
            <div className="group bg-white p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-blue-200 hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)] transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-full -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-[1.5rem] flex items-center justify-center mb-8 shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform duration-500">
                  <Award className="h-10 w-10" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-6 group-hover:text-blue-700 transition-colors">Visi</h3>
                <p className="text-slate-600 leading-relaxed text-lg font-medium">
                  "Menjadi jaringan klinik terapi bekam dan refleksi paling terpercaya di Indonesia yang mengedepankan kualitas pelayanan premium, higienitas mutlak, dan mengakar pada nilai-nilai pengobatan Islami yang dikemas secara modern."
                </p>
              </div>
            </div>

            {/* Misi Card */}
            <div className="group bg-white p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-amber-200 hover:shadow-[0_20px_50px_rgba(212,175,55,0.1)] transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-bl-full -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="h-20 w-20 bg-gradient-to-br from-[#d4af37] to-amber-600 text-white rounded-[1.5rem] flex items-center justify-center mb-8 shadow-lg shadow-amber-200 group-hover:-rotate-6 transition-transform duration-500">
                  <HeartPulse className="h-10 w-10" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-6 group-hover:text-amber-700 transition-colors">Misi</h3>
                <ul className="space-y-5 text-slate-600 leading-relaxed text-lg font-medium">
                  <li className="flex items-start gap-4">
                    <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mt-0.5 shrink-0">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                    <span>Memberikan pelayanan terapi level atas oleh barisan terapis bersertifikat profesional.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mt-0.5 shrink-0">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                    <span>Menjamin sterilisasi 100% tanpa kompromi pada setiap peralatan yang digunakan.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mt-0.5 shrink-0">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                    <span>Berperan aktif mengedukasi masyarakat tentang pentingnya menjaga gaya hidup sehat dan preventif.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Epic Stats Section */}
      <section className="py-24 bg-[#0a192f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a192f] via-[#0b1a30] to-[#0a192f] z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-[#d4af37]/10 blur-[150px] z-0 rounded-full"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            
            {/* Stat 1 */}
            <div className="flex flex-col items-center justify-center text-center group">
              <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#d4af37]/20 transition-all duration-500">
                <Users className="h-10 w-10 text-[#d4af37]" />
              </div>
              <p className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#d4af37] transition-all">10k+</p>
              <p className="text-gray-400 font-bold uppercase tracking-wider text-sm">Pasien Terbantu</p>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center justify-center text-center group">
              <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#d4af37]/20 transition-all duration-500">
                <ShieldCheck className="h-10 w-10 text-[#d4af37]" />
              </div>
              <p className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#d4af37] transition-all">100%</p>
              <p className="text-gray-400 font-bold uppercase tracking-wider text-sm">Higienis & Steril</p>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center justify-center text-center group">
              <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#d4af37]/20 transition-all duration-500">
                <Award className="h-10 w-10 text-[#d4af37]" />
              </div>
              <p className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#d4af37] transition-all">20+</p>
              <p className="text-gray-400 font-bold uppercase tracking-wider text-sm">Terapis Ahli</p>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col items-center justify-center text-center group">
              <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#d4af37]/20 transition-all duration-500">
                <HeartPulse className="h-10 w-10 text-[#d4af37]" />
              </div>
              <p className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#d4af37] transition-all">4</p>
              <p className="text-gray-400 font-bold uppercase tracking-wider text-sm">Cabang Premium</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
