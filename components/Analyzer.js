"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  UploadCloud,
  Loader2,
  Sparkles,
  RotateCcw,
  ImageIcon,
  Palette,
  Scan,
  Move,
} from "lucide-react";
import { analyzeImage, DEFAULT_BODY_BOXES } from "../lib/colorAnalysis";

export default function Analyzer() {
  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showBodyMask, setShowBodyMask] = useState(true);

  // State posisi & ukuran kotak Bodi Depan dan Bodi Samping (dalam rasio 0..1)
  const [boxes, setBoxes] = useState(DEFAULT_BODY_BOXES);
  const [dragAction, setDragAction] = useState(null); // { key: 'front'|'side', mode: 'move'|'resize', startX, startY, origBox }

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WEBP).");
      return;
    }
    setError("");
    setResult(null);
    setFileName(file.name);
    setBoxes(DEFAULT_BODY_BOXES);
    setPreview(URL.createObjectURL(file));
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const onAnalyze = async () => {
    if (!preview) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      setResult(await analyzeImage(preview, boxes));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setFileName("");
    setResult(null);
    setError("");
    setBoxes(DEFAULT_BODY_BOXES);
    if (inputRef.current) inputRef.current.value = "";
  };

  const resetBoxes = () => {
    setBoxes(DEFAULT_BODY_BOXES);
  };

  // Handler Drag & Resize Kotak Deteksi Bodi
  const startBoxInteraction = (e, key, mode) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragAction({
      key,
      mode,
      startX: clientX,
      startY: clientY,
      origBox: { ...boxes[key] },
    });
  };

  useEffect(() => {
    if (!dragAction) return;

    const handleMove = (e) => {
      if (!overlayRef.current) return;
      const rect = overlayRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = (clientX - dragAction.startX) / rect.width;
      const dy = (clientY - dragAction.startY) / rect.height;

      setBoxes((prev) => {
        const b = { ...dragAction.origBox };
        if (dragAction.mode === "move") {
          b.x = Math.min(Math.max(0.02, b.x + dx), 0.98 - b.w);
          b.y = Math.min(Math.max(0.02, b.y + dy), 0.98 - b.h);
        } else if (dragAction.mode === "resize") {
          b.w = Math.min(Math.max(0.08, b.w + dx), 0.98 - b.x);
          b.h = Math.min(Math.max(0.08, b.h + dy), 0.98 - b.y);
        }
        return { ...prev, [dragAction.key]: b };
      });
    };

    const handleUp = () => {
      setDragAction(null);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [dragAction]);

  const getSwatchStyle = (res) => {
    const palette = res?.hexPalette || [res?.hex || "#18181b"];
    if (palette.length === 1) {
      return { backgroundColor: palette[0] };
    }
    if (palette.length === 2) {
      return {
        background: `linear-gradient(135deg, ${palette[0]} 0%, ${palette[0]} 50%, ${palette[1]} 50%, ${palette[1]} 100%)`,
      };
    }
    return {
      background: `linear-gradient(135deg, ${palette[0]} 0%, ${palette[0]} 34%, ${palette[1]} 34%, ${palette[1]} 67%, ${palette[2]} 67%, ${palette[2]} 100%)`,
    };
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Upload & Preview */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <ImageIcon className="h-5 w-5 text-indigo-400" /> Upload Gambar Motor
          </h3>
          {preview && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetBoxes}
                className="rounded-lg border border-slate-700 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-slate-700"
                title="Kembalikan posisi kotak ke standar"
              >
                Reset Kotak
              </button>
              <button
                type="button"
                onClick={() => setShowBodyMask((v) => !v)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                  showBodyMask
                    ? "border-indigo-500/60 bg-indigo-500/20 text-indigo-300"
                    : "border-slate-700 bg-slate-800/60 text-slate-400"
                }`}
              >
                <Scan className="h-3.5 w-3.5" />
                {showBodyMask ? "Kotak Bodi: Aktif" : "Tampilkan Kotak"}
              </button>
            </div>
          )}
        </div>

        {!preview ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex h-72 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition ${
              dragging ? "border-indigo-400 bg-indigo-500/10" : "border-slate-700 hover:border-indigo-500"
            }`}
          >
            <UploadCloud className="mb-3 h-12 w-12 text-indigo-400" />
            <p className="font-medium">Seret &amp; lepas foto motor di sini</p>
            <p className="mt-1 text-sm text-slate-400">atau klik untuk memilih file</p>
            <span className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium">Pilih File</span>
          </div>
        ) : (
          <div>
            <div className="relative flex h-80 select-none items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-black">
              <div ref={overlayRef} className="relative inline-block h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview motor"
                  draggable={false}
                  className="h-full w-auto max-w-full select-none object-contain"
                />
                {showBodyMask && (
                  <div className="absolute inset-0">
                    {/* Kotak 1: Bodi Depan / Fairing (Bisa Di-drag & Resize) */}
                    <div
                      onMouseDown={(e) => startBoxInteraction(e, "front", "move")}
                      onTouchStart={(e) => startBoxInteraction(e, "front", "move")}
                      style={{
                        left: `${boxes.front.x * 100}%`,
                        top: `${boxes.front.y * 100}%`,
                        width: `${boxes.front.w * 100}%`,
                        height: `${boxes.front.h * 100}%`,
                      }}
                      className="group absolute cursor-move rounded-md border-2 border-dashed border-emerald-400 bg-emerald-500/15 transition-colors hover:bg-emerald-500/25"
                    >
                      <span className="pointer-events-none absolute -top-5 left-0 flex items-center gap-1 whitespace-nowrap rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-slate-950 shadow">
                        <Move className="h-2.5 w-2.5" /> Bodi Depan / Fairing
                      </span>
                      {/* Resize Handle Pojok Kanan Bawah */}
                      <div
                        onMouseDown={(e) => startBoxInteraction(e, "front", "resize")}
                        onTouchStart={(e) => startBoxInteraction(e, "front", "resize")}
                        className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border border-slate-950 bg-emerald-400 shadow"
                        title="Tarik untuk ubah ukuran kotak"
                      />
                    </div>

                    {/* Kotak 2: Bodi Samping / Belakang (Bisa Di-drag & Resize) */}
                    <div
                      onMouseDown={(e) => startBoxInteraction(e, "side", "move")}
                      onTouchStart={(e) => startBoxInteraction(e, "side", "move")}
                      style={{
                        left: `${boxes.side.x * 100}%`,
                        top: `${boxes.side.y * 100}%`,
                        width: `${boxes.side.w * 100}%`,
                        height: `${boxes.side.h * 100}%`,
                      }}
                      className="group absolute cursor-move rounded-md border-2 border-dashed border-indigo-400 bg-indigo-500/15 transition-colors hover:bg-indigo-500/25"
                    >
                      <span className="pointer-events-none absolute -top-5 left-0 flex items-center gap-1 whitespace-nowrap rounded bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                        <Move className="h-2.5 w-2.5" /> Bodi Samping
                      </span>
                      {/* Resize Handle Pojok Kanan Bawah */}
                      <div
                        onMouseDown={(e) => startBoxInteraction(e, "side", "resize")}
                        onTouchStart={(e) => startBoxInteraction(e, "side", "resize")}
                        className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border border-slate-950 bg-indigo-400 shadow"
                        title="Tarik untuk ubah ukuran kotak"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs text-slate-400">
              <span className="truncate">{fileName}</span>
              <span className="shrink-0 font-medium text-emerald-400">
                💡 Geser kotak atau tarik pojok kanan bawahnya untuk sesuaikan posisi bodi
              </span>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onAnalyze}
            disabled={!preview || loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Menganalisis Area Kotak...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" /> Analisis Warna Bodi / Prediksi
              </>
            )}
          </button>
          {preview && !loading && (
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 hover:bg-slate-800"
              aria-label="Reset"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Result Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Palette className="h-5 w-5 text-indigo-400" /> Hasil Prediksi Warna Bodi
        </h3>

        {loading && (
          <div className="flex h-72 flex-col items-center justify-center text-slate-400">
            <Loader2 className="mb-3 h-10 w-10 animate-spin text-indigo-400" />
            Memindai piksel di dalam kotak Bodi Depan &amp; Bodi Samping...
          </div>
        )}

        {!loading && !result && (
          <div className="flex h-72 items-center justify-center text-center text-slate-500">
            Atur posisi kotak pada bodi motor, lalu tekan tombol analisis.
          </div>
        )}

        {!loading && result && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-slate-800/70 p-4">
              <div
                className="h-16 w-16 shrink-0 rounded-xl border border-slate-600 shadow-inner"
                style={getSwatchStyle(result)}
              />
              <div className="min-w-0">
                <span className="inline-block rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
                  {result.combinationType || "Warna Bodi Terdeteksi"}
                </span>
                <p className="mt-1 break-words text-2xl font-bold leading-snug">{result.label}</p>
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-slate-400">Tingkat Keyakinan Model SVM (Custom Body ROI)</span>
                <span className="font-semibold text-emerald-400">{result.accuracy}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${result.accuracy}%` }} />
              </div>
            </div>

            {result.top3 && (
              <div className="rounded-xl bg-slate-800/50 p-3 text-xs">
                <p className="mb-2 font-medium text-slate-400">Komposisi Warna di Dalam Kotak Bodi (HSV + SVM):</p>
                <div className="space-y-2">
                  {result.top3.map((item) => (
                    <div key={item.class} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 font-medium text-slate-200">
                          <span
                            className="h-3 w-3 rounded-full border border-slate-500"
                            style={{ backgroundColor: item.hex }}
                          />
                          {item.class}
                        </span>
                        <span className="font-mono text-slate-300">
                          {item.hsv && <span className="mr-2 text-slate-500">{item.hsv}</span>}
                          {item.prob}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-900">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${item.prob}%`, backgroundColor: item.hex }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                ["Hue Bodi (H)", `${result.hsv.h}°`],
                ["Saturation (S)", `${result.hsv.s}%`],
                ["Value (V)", `${result.hsv.v}%`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-slate-800/70 p-3">
                  <p className="text-xs text-slate-400">{k}</p>
                  <p className="mt-1 text-xl font-semibold">{v}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              *Ekstraksi HSV &amp; klasifikasi SVM dihitung presisi dari area kotak Bodi Depan dan Bodi Samping yang Anda sesuaikan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
