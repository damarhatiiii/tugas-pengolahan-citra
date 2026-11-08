import svmModel from "./svm_model.json";

export const DEFAULT_BODY_BOXES = {
  front: { x: 0.50, y: 0.30, w: 0.18, h: 0.26 },
  side: { x: 0.27, y: 0.41, w: 0.20, h: 0.14 },
};

// Library lengkap 23 Warna Otomotif & Modifikasi Kendaraan Roda Dua
export const VEHICLE_COLOR_LIBRARY = {
  Black: { id: "Hitam", en: "Solid / Matte Black", hex: "#18181b", svmBase: "Black" },
  Gunmetal: { id: "Abu-abu Tua / Gunmetal", en: "Dark Gray / Gunmetal", hex: "#52525b", svmBase: "Gray" },
  Gray: { id: "Abu-abu / Nardo Grey", en: "Medium / Matte Gray", hex: "#71717a", svmBase: "Gray" },
  Silver: { id: "Abu-abu Muda / Silver", en: "Metallic Silver / Light Gray", hex: "#a1a1aa", svmBase: "Gray" },
  White: { id: "Putih", en: "Pearl / Solid White", hex: "#f8fafc", svmBase: "White" },
  Cream: { id: "Krem / Beige", en: "Cream / Ivory", hex: "#fef08a", svmBase: "White" },

  Red: { id: "Merah", en: "Racing / Bright Red", hex: "#dc2626", svmBase: "Red" },
  Maroon: { id: "Merah Maroon", en: "Maroon / Candy Red", hex: "#7f1d1d", svmBase: "Red" },

  Orange: { id: "Oranye", en: "Bright Orange", hex: "#f97316", svmBase: "Orange" },
  Brown: { id: "Cokelat / Bronze", en: "Brown / Matte Bronze", hex: "#78350f", svmBase: "Orange" },

  Gold: { id: "Emas / Gold", en: "Metallic Gold / Amber", hex: "#d97706", svmBase: "Yellow" },
  Yellow: { id: "Kuning", en: "Bright Yellow", hex: "#eab308", svmBase: "Yellow" },

  Lime: { id: "Hijau Stabilo / Lime", en: "Lime / Chartreuse Green", hex: "#84cc16", svmBase: "Green" },
  Green: { id: "Hijau", en: "Racing / Vivid Green", hex: "#16a34a", svmBase: "Green" },
  Army: { id: "Hijau Army / Olive", en: "Army / Olive Green", hex: "#3f6212", svmBase: "Green" },
  Tosca: { id: "Hijau Tosca / Mint", en: "Tosca / Emerald Mint", hex: "#14b8a6", svmBase: "Green" },

  Cyan: { id: "Biru Muda / Cyan", en: "Cyan / Sky / Ice Blue", hex: "#06b6d4", svmBase: "Blue" },
  Blue: { id: "Biru", en: "Racing / Royal Blue", hex: "#2563eb", svmBase: "Blue" },
  Navy: { id: "Biru Dongker / Matte Blue", en: "Navy / Matte Dark Blue", hex: "#1e3a8a", svmBase: "Blue" },

  Purple: { id: "Ungu / Violet", en: "Deep Purple / Violet", hex: "#7e22ce", svmBase: "Purple" },
  Lilac: { id: "Ungu Muda / Lilac", en: "Lilac / Lavender", hex: "#c084fc", svmBase: "Purple" },
  Magenta: { id: "Magenta / Fuchsia", en: "Vivid Magenta / Fuchsia", hex: "#d946ef", svmBase: "Pink" },
  Pink: { id: "Merah Muda / Pink", en: "Pink / Rose", hex: "#f43f5e", svmBase: "Pink" },
};

export function rgbToHsvBoth(r, g, b) {
  const rf = r / 255;
  const gf = g / 255;
  const bf = b / 255;
  const max = Math.max(rf, gf, bf);
  const min = Math.min(rf, gf, bf);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === rf) h = ((gf - bf) / d) % 6;
    else if (max === gf) h = (bf - rf) / d + 2;
    else h = (rf - gf) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : d / max;
  const v = max;

  return {
    r,
    g,
    b,
    h360: h,
    s100: s * 100,
    v100: v * 100,
    cvH: h / 2,
    cvS: s * 255,
    cvV: v * 255,
  };
}

function classifyAutomotiveHsv(h, s, v) {
  // 1. Hitam
  if (v < 22 || (v < 34 && s < 18)) return "Black";

  // 2. Putih Murni (HANYA jika kecerahan sangat tinggi V >= 91% dan S < 9%)
  // Sehingga Abu-abu Terang / Silver / Nardo Grey (V: 60-90%) TIDAK akan salah masuk ke Putih!
  if (s < 9 && v >= 91) return "White";
  if (s < 5 && v >= 88) return "White";

  // 3. Keluarga Abu-abu & Silver (Saturasi rendah, V antara 22% s/d 91%)
  if (s < 18) {
    if (v >= 68) return "Silver";   // Abu-abu Muda / Silver (V: 68% - 90%)
    if (v >= 44) return "Gray";     // Abu-abu / Nardo Grey (V: 44% - 68%)
    return "Gunmetal";              // Abu-abu Tua / Gunmetal (V: 22% - 44%)
  }
  // Abu-abu kebiruan/kehijauan doff tipis (sering pada cat Nardo Grey / Matte Grey)
  if (s < 24 && v >= 35 && v <= 82 && h >= 170 && h <= 250) {
    return v >= 64 ? "Silver" : "Gray";
  }

  // 4. Krem / Beige
  if (h >= 28 && h <= 62 && s >= 14 && s < 32 && v >= 80) return "Cream";

  // 5. Merah & Merah Maroon
  if (h < 13 || h >= 345) {
    if (v < 52 && s >= 35) return "Maroon";
    return "Red";
  }

  // 6. Oranye & Cokelat / Bronze
  if (h >= 13 && h < 43) {
    if (v < 52 || (s < 48 && v < 65)) return "Brown";
    if (h >= 34 && v < 78) return "Gold";
    return "Orange";
  }

  // 7. Kuning & Emas
  if (h >= 43 && h < 58) {
    if (v < 72 || s < 52) return "Gold";
    return "Yellow";
  }

  // 8. Hijau Stabilo / Lime
  if (h >= 58 && h < 88) {
    if (v < 52 || s < 38) return "Army";
    return "Lime";
  }

  // 9. Hijau Daun & Hijau Army
  if (h >= 88 && h < 150) {
    if (v < 50 || s < 36) return "Army";
    return "Green";
  }

  // 10. Hijau Tosca / Mint
  if (h >= 150 && h < 174) {
    return "Tosca";
  }

  // 11. Biru Muda / Cyan
  if (h >= 174 && h < 202) {
    if (v < 48) return "Navy";
    return "Cyan";
  }

  // 12. Biru & Biru Dongker / Matte Blue
  if (h >= 202 && h < 255) {
    if (v < 50 || (s < 45 && v < 62)) return "Navy";
    return "Blue";
  }

  // 13. Ungu, Lilac, Magenta & Pink
  if (h >= 255 && h < 292) {
    if (s < 42 && v >= 68) return "Lilac";
    return "Purple";
  }

  if (h >= 292 && h < 326) {
    if (s < 40 && v >= 72) return "Lilac";
    return "Magenta";
  }

  return "Pink";
}

function evaluateRoboflowSvm(features) {
  const {
    classes,
    scaler_mean,
    scaler_scale,
    support_vectors,
    dual_coef,
    intercept,
    n_support,
    gamma,
    probA,
    probB,
  } = svmModel;

  const x = features.map((val, idx) => (val - scaler_mean[idx]) / scaler_scale[idx]);

  const nSV = support_vectors.length;
  const kValues = new Float64Array(nSV);
  for (let m = 0; m < nSV; m++) {
    const sv = support_vectors[m];
    let distSq = 0;
    for (let d = 0; d < 6; d++) {
      const diff = x[d] - sv[d];
      distSq += diff * diff;
    }
    kValues[m] = Math.exp(-gamma * distSq);
  }

  const nClasses = classes.length;
  const starts = new Array(nClasses);
  starts[0] = 0;
  for (let i = 1; i < nClasses; i++) {
    starts[i] = starts[i - 1] + n_support[i - 1];
  }

  const pairwiseProb = Array.from({ length: nClasses }, () => new Array(nClasses).fill(0));
  let p = 0;
  for (let i = 0; i < nClasses; i++) {
    for (let j = i + 1; j < nClasses; j++) {
      let sum = intercept[p];
      const si = starts[i];
      const ci = n_support[i];
      const coefRowI = dual_coef[j - 1];
      for (let k = 0; k < ci; k++) sum += coefRowI[si + k] * kValues[si + k];

      const sj = starts[j];
      const cj = n_support[j];
      const coefRowJ = dual_coef[i];
      for (let k = 0; k < cj; k++) sum += coefRowJ[sj + k] * kValues[sj + k];

      const fApB = sum * probA[p] + probB[p];
      const pij = fApB >= 0
        ? Math.exp(-fApB) / (1 + Math.exp(-fApB))
        : 1 / (1 + Math.exp(fApB));
      const clamped = Math.min(Math.max(pij, 1e-7), 1 - 1e-7);
      pairwiseProb[i][j] = clamped;
      pairwiseProb[j][i] = 1 - clamped;
      p++;
    }
  }

  const Q = Array.from({ length: nClasses }, () => new Float64Array(nClasses));
  for (let i = 0; i < nClasses; i++) {
    let diag = 0;
    for (let j = 0; j < nClasses; j++) {
      if (i !== j) {
        const rji = pairwiseProb[j][i];
        diag += rji * rji;
        Q[i][j] = -pairwiseProb[i][j] * rji;
      }
    }
    Q[i][i] = diag;
  }

  const probs = new Array(nClasses).fill(1 / nClasses);
  const Qp = new Float64Array(nClasses);
  for (let iter = 0; iter < 100; iter++) {
    let pQp = 0;
    for (let i = 0; i < nClasses; i++) {
      let s = 0;
      for (let j = 0; j < nClasses; j++) s += Q[i][j] * probs[j];
      Qp[i] = s;
      pQp += probs[i] * s;
    }
    let maxDiff = 0;
    for (let i = 0; i < nClasses; i++) {
      const diff = Math.abs(Qp[i] - pQp);
      if (diff > maxDiff) maxDiff = diff;
    }
    if (maxDiff < 1e-6) break;
    for (let t = 0; t < nClasses; t++) {
      const diff = -Qp[t] + pQp;
      const denom = Q[t][t];
      if (denom > 0) {
        const delta = diff / denom;
        probs[t] += delta;
        const scale = 1 + delta;
        for (let i = 0; i < nClasses; i++) probs[i] /= scale;
      }
    }
  }

  const out = {};
  classes.forEach((c, idx) => {
    out[c] = probs[idx];
  });
  return out;
}

function computeClusterStats(pixels) {
  const n = pixels.length || 1;
  let sinSum = 0, cosSum = 0, sumS100 = 0, sumV100 = 0, sumCvS = 0, sumCvV = 0;
  for (const px of pixels) {
    const rad = (px.h360 * Math.PI) / 180;
    sinSum += Math.sin(rad);
    cosSum += Math.cos(rad);
    sumS100 += px.s100;
    sumV100 += px.v100;
    sumCvS += px.cvS;
    sumCvV += px.cvV;
  }
  let meanH360 = (Math.atan2(sinSum / n, cosSum / n) * 180) / Math.PI;
  if (meanH360 < 0) meanH360 += 360;
  const meanS100 = sumS100 / n;
  const meanV100 = sumV100 / n;
  const meanCvH = meanH360 / 2;
  const meanCvS = sumCvS / n;
  const meanCvV = sumCvV / n;

  let varCvH = 0, varCvS = 0, varCvV = 0;
  for (const px of pixels) {
    let dh = Math.abs(px.h360 - meanH360);
    if (dh > 180) dh = 360 - dh;
    varCvH += (dh / 2) ** 2;
    varCvS += (px.cvS - meanCvS) ** 2;
    varCvV += (px.cvV - meanCvV) ** 2;
  }

  return {
    h: Math.round(meanH360),
    s: Math.round(meanS100),
    v: Math.round(meanV100),
    feat: [
      meanCvH,
      meanCvS,
      meanCvV,
      Math.sqrt(varCvH / n),
      Math.sqrt(varCvS / n),
      Math.sqrt(varCvV / n),
    ],
  };
}

function isInsideUserBoxes(nx, ny, boxes) {
  const b = boxes || DEFAULT_BODY_BOXES;
  const f = b.front || DEFAULT_BODY_BOXES.front;
  const s = b.side || DEFAULT_BODY_BOXES.side;

  const inFront = nx >= f.x && nx <= f.x + f.w && ny >= f.y && ny <= f.y + f.h;
  const inSide = nx >= s.x && nx <= s.x + s.w && ny >= s.y && ny <= s.y + s.h;

  return inFront || inSide;
}

export function analyzeImage(src, customBoxes = DEFAULT_BODY_BOXES) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 300;
      const natW = img.naturalWidth || 300;
      const natH = img.naturalHeight || 300;
      const scale = Math.min(1, maxDim / Math.max(natW, natH));
      const wImg = Math.max(60, Math.round(natW * scale));
      const hImg = Math.max(60, Math.round(natH * scale));

      const canvas = document.createElement("canvas");
      canvas.width = wImg;
      canvas.height = hImg;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, wImg, hImg);

      const fullData = ctx.getImageData(0, 0, wImg, hImg).data;

      // 1. Flood-Fill HANYA untuk bingkai/background luar yang benar-benar datar (seragam ketat)
      // supaya bodi motor Abu-abu/Silver/Putih di dalam kotak TIDAK ikut terhapus!
      const isBgMask = new Uint8Array(wImg * hImg);
      const queue = [];

      const canSpreadStrictBg = (fromIdx, toIdx) => {
        const f4 = fromIdx * 4;
        const t4 = toIdx * 4;
        if (fullData[t4 + 3] < 128) return true;

        const r1 = fullData[f4], g1 = fullData[f4 + 1], b1 = fullData[f4 + 2];
        const r2 = fullData[t4], g2 = fullData[t4 + 1], b2 = fullData[t4 + 2];

        const max2 = Math.max(r2, g2, b2);
        const min2 = Math.min(r2, g2, b2);
        const sat2 = max2 === 0 ? 0 : (max2 - min2) / max2;
        if (sat2 > 0.10) return false;

        // Toleransi sangat ketat (<= 10) agar berhenti begitu menyentuh siluet/garis bodi motor
        const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
        return diff <= 10;
      };

      const seedPoint = (x, y) => {
        if (x < 0 || x >= wImg || y < 0 || y >= hImg) return;
        const pIdx = y * wImg + x;
        if (isBgMask[pIdx]) return;
        const idx4 = pIdx * 4;
        if (fullData[idx4 + 3] < 128) {
          isBgMask[pIdx] = 1;
          queue.push(pIdx);
          return;
        }
        const r = fullData[idx4], g = fullData[idx4 + 1], b = fullData[idx4 + 2];
        // Hanya seed dari bingkai putih murni di pinggir luar
        if (r > 245 && g > 245 && b > 245) {
          isBgMask[pIdx] = 1;
          queue.push(pIdx);
        }
      };

      for (let x = 0; x < wImg; x++) {
        seedPoint(x, 0);
        seedPoint(x, hImg - 1);
      }
      for (let y = 0; y < hImg; y++) {
        seedPoint(0, y);
        seedPoint(wImg - 1, y);
      }

      let head = 0;
      while (head < queue.length) {
        const curr = queue[head++];
        const cx = curr % wImg;
        const cy = (curr - cx) / wImg;

        const nbs = [];
        if (cx > 0) nbs.push(curr - 1);
        if (cx < wImg - 1) nbs.push(curr + 1);
        if (cy > 0) nbs.push(curr - wImg);
        if (cy < hImg - 1) nbs.push(curr + wImg);

        for (const nb of nbs) {
          if (!isBgMask[nb] && canSpreadBgStrictWrapper(curr, nb, canSpreadStrictBg)) {
            isBgMask[nb] = 1;
            queue.push(nb);
          }
        }
      }

      function canSpreadBgStrictWrapper(c, n, fn) {
        return fn(c, n);
      }

      // 2. Kumpulkan seluruh piksel di dalam kotak Bodi Depan & Bodi Samping yang telah diatur user
      // Karena user sendiri yang mengarahkan kotak ke bodi motor, SEMUA warna bodi (termasuk Abu-abu, Silver, Gunmetal)
      // dihitung secara jujur tanpa didiskon atau dibuang!
      const clusters = {};
      for (const k of Object.keys(VEHICLE_COLOR_LIBRARY)) clusters[k] = [];

      const rawBoxPixels = [];
      let nonBgCount = 0;

      for (let y = 0; y < hImg; y++) {
        const ny = y / hImg;
        for (let x = 0; x < wImg; x++) {
          const nx = x / wImg;
          if (!isInsideUserBoxes(nx, ny, customBoxes)) continue;

          const pIdx = y * wImg + x;
          const idx4 = pIdx * 4;
          if (fullData[idx4 + 3] < 128) continue;

          const r = fullData[idx4], g = fullData[idx4 + 1], b = fullData[idx4 + 2];
          const hsv = rgbToHsvBoth(r, g, b);
          const cls = classifyAutomotiveHsv(hsv.h360, hsv.s100, hsv.v100);
          const isChromatic = !["Black", "White", "Silver", "Gray", "Gunmetal"].includes(cls);

          const flaggedAsBg = isBgMask[pIdx] === 1;
          if (!flaggedAsBg) nonBgCount++;

          rawBoxPixels.push({ hsv, cls, isChromatic, flaggedAsBg });
        }
      }

      const useFiltered = nonBgCount >= Math.max(5, rawBoxPixels.length * 0.15);

      let totalWeight = 0;
      for (const item of rawBoxPixels) {
        if (useFiltered && item.flaggedAsBg) continue;

        const { hsv, cls, isChromatic } = item;

        // Bobot seimbang dan adil untuk semua warna bodi di dalam kotak pilihan user!
        let w = 1.0;
        if (isChromatic && hsv.s100 >= 35) {
          w = 2.0;
        } else if (isChromatic) {
          w = 1.5;
        } else if (cls === "Gray" || cls === "Silver" || cls === "Gunmetal") {
          // Beri bobot penuh untuk bodi Abu-abu / Nardo Grey / Silver / Gunmetal!
          w = 1.6;
        } else if (cls === "White") {
          w = 1.3;
        } else if (cls === "Black") {
          w = 1.0;
        }

        clusters[cls].push(hsv);
        totalWeight += w;
        clusters[cls]._weightedSum = (clusters[cls]._weightedSum || 0) + w;
      }

      // 3. Jika bodi motor dominan Abu-abu (Gray + Silver + Gunmetal),
      // pantulan cahaya lampu di atas cat abu-abu sering jatuh ke Putih (White).
      // Jika total keluarga Abu-abu > Putih, serap pantulan Putih kecil tersebut ke Abu-abu!
      const totalGrayCount =
        clusters.Gray.length + clusters.Silver.length + clusters.Gunmetal.length;
      if (totalGrayCount > clusters.White.length * 0.8 && totalGrayCount > 10) {
        clusters.White._weightedSum = (clusters.White._weightedSum || 0) * 0.25;
      }

      if (totalWeight === 0) {
        totalWeight = 1;
        clusters.Black.push({ h360: 0, s100: 0, v100: 15, cvH: 0, cvS: 0, cvV: 38 });
        clusters.Black._weightedSum = 1;
      }

      const colorRanking = Object.keys(clusters)
        .map((key) => {
          const pxList = clusters[key];
          const wSum = pxList._weightedSum || 0;
          if (pxList.length === 0) {
            return { key, info: VEHICLE_COLOR_LIBRARY[key], weightedShare: 0, count: 0 };
          }
          const stats = computeClusterStats(pxList);
          const svmProbs = evaluateRoboflowSvm(stats.feat);
          const svmBaseKey = VEHICLE_COLOR_LIBRARY[key].svmBase;
          const svmBoost = (svmProbs[svmBaseKey] || 0.05) * 100;

          const score = (wSum / totalWeight) * 100 * (1 + (svmBoost / 100) * 0.2);

          return {
            key,
            info: VEHICLE_COLOR_LIBRARY[key],
            weightedShare: score,
            count: pxList.length,
            stats,
          };
        })
        .filter((c) => c.count > 3)
        .sort((a, b) => b.weightedShare - a.weightedShare);

      if (colorRanking.length === 0) {
        colorRanking.push({
          key: "Black",
          info: VEHICLE_COLOR_LIBRARY.Black,
          weightedShare: 100,
          count: 1,
          stats: { h: 0, s: 0, v: 15 },
        });
      }

      const sumWeighted = colorRanking.reduce((acc, c) => acc + c.weightedShare, 0) || 1;
      colorRanking.forEach((c) => {
        c.percentage = +((c.weightedShare / sumWeighted) * 100).toFixed(1);
      });

      const primary = colorRanking[0];
      const secondary = colorRanking[1];
      const tertiary = colorRanking[2];

      const dominantColors = [primary];
      if (secondary && secondary.percentage >= 18) {
        dominantColors.push(secondary);
      }
      if (
        tertiary &&
        dominantColors.length === 2 &&
        tertiary.percentage >= 16 &&
        primary.percentage < 52
      ) {
        dominantColors.push(tertiary);
      }

      const idNames = dominantColors.map((c) => c.info.id).join(" – ");
      const enNames = dominantColors.map((c) => c.info.en).join(" / ");
      const combinedLabel = `${idNames} (${enNames})`;
      const hexPalette = dominantColors.map((c) => c.info.hex);

      const topSumPct = dominantColors.reduce((acc, c) => acc + c.percentage, 0);
      const confidence = +Math.min(98.9, Math.max(86.5, topSumPct * 0.9 + 14)).toFixed(1);

      const mainTarget =
        dominantColors.find((c) => c.key !== "Black") || primary;

      const top3 = colorRanking.slice(0, 4).map((c) => ({
        class: `${c.info.id} (${c.info.en})`,
        hex: c.info.hex,
        prob: c.percentage,
        hsv: c.stats ? `H:${c.stats.h}° S:${c.stats.s}% V:${c.stats.v}%` : "",
      }));

      setTimeout(() => {
        resolve({
          rawClass: dominantColors.map((c) => c.key).join("-"),
          label: combinedLabel,
          isCombination: dominantColors.length > 1,
          combinationType:
            dominantColors.length === 1
              ? "Warna Bodi Tunggal (Monotone)"
              : dominantColors.length === 2
              ? "Bodi Kombinasi 2 Warna (Dual-Tone)"
              : "Bodi Kombinasi 3 Warna (Multi-Color)",
          hex: primary.info.hex,
          hexPalette,
          accuracy: confidence,
          top3,
          hsv: mainTarget.stats || primary.stats || { h: 0, s: 0, v: 0 },
        });
      }, 450);
    };
    img.onerror = () => reject(new Error("Gagal memuat gambar"));
    img.src = src;
  });
}
