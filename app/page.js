import { Bike, Users, Cpu, Layers } from "lucide-react";
import Analyzer from "../components/Analyzer";

const members = [
  { name: "Muhamad Damar Hati", nim: "15240045" },
  { name: "Ananta Bagas Sasena", nim: "15240078" },
  { name: "Mohammad Ardhian Syarifudin", nim: "15240360" },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-10 rounded-3xl border border-slate-800 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
          <Bike className="h-4 w-4" /> Tugas Kuliah Pengolahan Citra
        </div>
        <h1 className="text-3xl font-bold leading-tight md:text-4xl">
          Identifikasi Warna Kendaraan Bermotor Roda Dua Menggunakan Ruang Warna HSV dan Support Vector Machine (SVM)
        </h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Aplikasi ini mendemonstrasikan alur identifikasi warna motor: gambar dikonversi dari RGB ke ruang warna
          HSV, fitur Hue–Saturation–Value diekstraksi, lalu diklasifikasikan oleh SVM menjadi label warna.
          Versi web ini menggunakan simulasi di sisi frontend.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3 rounded-xl bg-slate-900/60 p-4 md:col-span-1">
            <Layers className="mt-0.5 h-5 w-5 text-indigo-400" />
            <div className="text-sm"><p className="font-semibold">Ruang Warna HSV</p><p className="text-slate-400">Pemisahan warna dari pencahayaan.</p></div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-slate-900/60 p-4">
            <Cpu className="mt-0.5 h-5 w-5 text-indigo-400" />
            <div className="text-sm"><p className="font-semibold">Klasifikasi SVM</p><p className="text-slate-400">Pemisah kelas warna optimal.</p></div>
          </div>
          <div className="rounded-xl bg-slate-900/60 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Users className="h-5 w-5 text-indigo-400" /> Kelompok 19</p>
            <ul className="space-y-1 text-sm text-slate-300">
              {members.map((m) => (
                <li key={m.nim}>{m.name} <span className="text-slate-500">/ {m.nim}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <Analyzer />

      <footer className="mt-10 text-center text-sm text-slate-500">
        © 2026 Kelompok Pengolahan Citra — HSV &amp; SVM
      </footer>
    </main>
  );
}

