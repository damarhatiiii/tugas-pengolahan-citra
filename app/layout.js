import "./globals.css";

export const metadata = {
  title: "Identifikasi Warna Motor | HSV & SVM",
  description:
    "Identifikasi warna kendaraan bermotor roda dua menggunakan ruang warna HSV dan Support Vector Machine (SVM).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

