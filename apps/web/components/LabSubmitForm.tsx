import React, { useState } from 'react';
import { Lab, StudentProfile } from '../types';
import { ArrowLeft, AlertCircle, Monitor, Cpu, Info, ShieldCheck } from 'lucide-react';

interface LabSubmitFormProps {
  lab: Lab;
  student: StudentProfile;
  onBack: () => void;
  onSubmitSuccess: (notes: string) => void;
}

// Generate some occupied seats deterministically
const OCCUPIED_SEATS = ['A-2', 'A-4', 'B-1', 'B-5', 'C-3', 'C-4', 'D-2', 'D-6'];

// Meja PC specifications based on location for realism
const getPcSpec = (seatId: string) => {
  const row = seatId.charAt(0);
  switch (row) {
    case 'A':
      return {
        cpu: 'Intel Core i7-12700 @ 3.61GHz',
        ram: '16 GB DDR4 Dual-Channel',
        gpu: 'Nvidia Geforce RTX 3060 6GB',
        storage: 'SSD NVMe 512GB',
        peripherals: 'Monitor LG 24" IPS, Keyboard Mechanical, Mouse Gaming',
        statusText: 'Kondisi Prima & Siap Pakai'
      };
    case 'B':
      return {
        cpu: 'AMD Ryzen 7 5700X @ 3.4GHz',
        ram: '16 GB DDR4 3200MHz',
        gpu: 'Nvidia Geforce RTX 3060 Ti 8GB',
        storage: 'SSD NVMe 512GB + HDD 1TB',
        peripherals: 'Monitor Samsung Odyssey 24" Curved, Keyboard RGB, Mouse Logitech',
        statusText: 'Kondisi Prima & Siap Pakai'
      };
    case 'C':
      return {
        cpu: 'Intel Core i5-13400F @ 2.5GHz',
        ram: '16 GB DDR5 4800MHz',
        gpu: 'Nvidia Geforce GTX 1660 Super 6GB',
        storage: 'SSD NVMe 512GB',
        peripherals: 'Monitor Asus VS248H 24", Standard Dell Desktop Pack',
        statusText: 'Kondisi Prima & Siap Pakai'
      };
    case 'D':
    default:
      return {
        cpu: 'Intel Core i5-12400 @ 2.50GHz',
        ram: '16 GB DDR4 Single-Channel',
        gpu: 'Nvidia Geforce GTX 1650 4GB',
        storage: 'SSD SATA 480GB',
        peripherals: 'Monitor Lenovo 22" Full HD, Keyboard Standard, Mouse Standard',
        statusText: 'Kondisi Prima & Siap Pakai'
      };
  }
};

export const LabSubmitForm: React.FC<LabSubmitFormProps> = ({
  lab,
  student,
  onBack,
  onSubmitSuccess,
}) => {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rows = ['A', 'B', 'C', 'D'];
  const cols = [1, 2, 3, 4, 5, 6];

  const handleSeatClick = (seatCode: string) => {
    if (OCCUPIED_SEATS.includes(seatCode)) return;
    setSelectedSeat(seatCode);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat) {
      setErrorMsg('Harap pilih salah satu meja / tempat duduk yang tersedia di peta laboratorium!');
      return;
    }
    if (!agreed) {
      setErrorMsg('Anda harus menyetujui aturan tata tertib penggunaan laboratorium!');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    // Simulate network delay
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess(`Terdaftar dan menempati Meja: ${selectedSeat}`);
    }, 1200);
  };

  const spec = selectedSeat ? getPcSpec(selectedSeat) : null;

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden animate-fade-in" id="lab-seat-registration-container">
      {/* Form Header */}
      <div className="bg-blue-600 text-white p-6 relative">
        <button
          onClick={onBack}
          type="button"
          className="absolute left-6 top-6 flex items-center gap-1.5 text-xs text-blue-100 hover:text-white transition bg-blue-700/50 hover:bg-blue-800/65 px-3 py-1.5 rounded-lg"
          id="btn-back-to-lab-list"
        >
          <ArrowLeft size={14} /> Kembali
        </button>
        <div className="text-center mt-6">
          <span className="text-xs bg-blue-500 text-blue-50 font-bold tracking-widest px-3 py-1 rounded-full uppercase border border-blue-400">
            Pemilihan Meja Praktikum
          </span>
          <h1 className="text-2xl font-bold mt-2" id="title-register-lab">
            Registrasi {lab.title}
          </h1>
          <p className="text-xs text-blue-100 mt-1">Dosen Pengampu: {lab.dosen}</p>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive Seat Floor Map (8 Cols of 12) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Monitor size={18} className="text-blue-600" />
                Denah Ruangan Meja Laboratorium
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                <span>Semester {student.semester}</span>
              </div>
            </div>


            {/* Interactive Screen Label (Depan Kelas) */}
            <div className="space-y-4">
              <div className="w-full bg-slate-700 text-white py-1.5 rounded-md text-center text-[10px] font-bold uppercase tracking-widest select-none">
                Layar LCD Proyektor / Meja Dosen & Instruktur
              </div>

              {/* Lab Floor Grid Layout */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 relative">
                <div className="grid grid-cols-6 gap-3">
                  {rows.map((row) =>
                    cols.map((col) => {
                      const seatId = `${row}-${col}`;
                      const isOccupied = OCCUPIED_SEATS.includes(seatId);
                      const isSelected = selectedSeat === seatId;

                      return (
                        <button
                          key={seatId}
                          type="button"
                          onClick={() => handleSeatClick(seatId)}
                          disabled={isOccupied}
                          className={`aspect-square sm:p-2 p-1 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center relative shadow-xs ${
                            isOccupied
                              ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                              : isSelected
                              ? 'bg-blue-600 border-blue-700 text-white font-black scale-105 ring-4 ring-blue-100'
                              : 'bg-white border-slate-200 hover:border-blue-500 text-slate-700 hover:bg-blue-50/50 hover:scale-[1.02]'
                          }`}
                          title={isOccupied ? `Meja ${seatId} (Sudah Terisi)` : `Pilih Meja ${seatId}`}
                        >
                          <span className="text-xs font-black">{seatId}</span>
                          <span className={`text-[8px] font-bold mt-1 uppercase tracking-wider ${
                            isOccupied ? 'text-slate-400' : isSelected ? 'text-blue-100' : 'text-slate-400'
                          }`}>
                            {isOccupied ? 'Terisi' : isSelected ? 'Dipilih' : 'Meja'}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Grid Legend inside map */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-200 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <div className="w-4 h-4 bg-white border border-slate-200 rounded-md"></div>
                    <span>Tersedia</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <div className="w-4 h-4 bg-slate-200 border border-slate-300 rounded-md"></div>
                    <span>Sudah Terisi</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <div className="w-4 h-4 bg-blue-600 border border-blue-700 rounded-md"></div>
                    <span>Pilihan Anda</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: PC Spec and Registration Action Formulation (5 Cols of 12) */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <Cpu size={18} className="text-blue-600" />
              Spesifikasi Meja Terpilih
            </h3>

            {errorMsg && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs animate-shake">
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <p className="font-semibold">{errorMsg}</p>
              </div>
            )}

            {/* Spec Details Card */}
            {selectedSeat ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      Pilihan Aktif
                    </span>
                    <h4 className="font-black text-slate-805 text-lg mt-1">Meja {selectedSeat}</h4>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                    ✓ {spec?.statusText}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Processor (CPU)</span>
                    <p className="font-bold text-slate-800 mt-0.5">{spec?.cpu}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Memori (RAM)</span>
                    <p className="font-bold text-slate-800 mt-0.5">{spec?.ram}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Kartu Grafis (GPU)</span>
                    <p className="font-bold text-slate-800 mt-0.5">{spec?.gpu}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Penyimpanan (Storage)</span>
                    <p className="font-bold text-slate-800 mt-0.5">{spec?.storage}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Periferal & Aksesoris</span>
                    <p className="font-bold text-slate-800 mt-0.5">{spec?.peripherals}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-xs text-blue-800">
                  <Info size={16} className="shrink-0 mt-0.5 text-blue-600" />
                  <p className="leading-relaxed font-semibold">
                    Setiap komputer meja (workstation) sudah terpasang IDE pendukung: Visual Studio Code, Git terminal, Node.js runtime, JDK 17, Docker Engine, dan DBMS Workbench.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-400">
                <Monitor className="mx-auto text-slate-300 mb-3" size={32} />
                <p className="text-xs font-bold">Silakan Klik / Pilih Meja pada Denah Ruangan untuk melihat rincian spesifikasi PC.</p>
              </div>
            )}

            {/* Terms Consent and Submit */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-650 leading-relaxed font-semibold">
                    Saya berkomitmen menjaga ketertiban, kebersihan meja asisten, mengembalikan periferal ke posisi rapi, dan tidak mengunduh atau memasang program bajakan yang melanggar aturan laboratorium.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition active:scale-98 disabled:opacity-50"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedSeat}
                  className={`flex-1 py-3 px-4 font-bold text-sm rounded-xl transition active:scale-98 flex items-center justify-center gap-2 ${
                    selectedSeat
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin"></div>
                      Menyimpan Pilihan...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Konfirmasi Meja
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
