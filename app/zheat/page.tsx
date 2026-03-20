"use client";
import React, { useState, useEffect, useRef, useCallback, ReactElement } from "react";
import dynamic from 'next/dynamic'

// ─── Types ──────────────────────────────────────────────────────────────────
type FinType =
  | "longitudinal"
  | "pin-inline"
  | "pin-staggered"
  | "conical-inline"
  | "conical-staggered"
  | "polygon-inline"
  | "polygon-staggered";

type StagType = "half" | "third";

interface State {
  fin: FinType;
  poly: number;
  stag: StagType;
  res: ResultData | null;
}

interface ResultData {
  eta: number; eta0: number; eps: number; mL: number; m: number;
  Tbase: number; Ttip: number; Ta: number; Q: number; h: number; k: number;
  Nfins: number; R: number; R_eff: number;
  Atot: number; Afintot: number; Abase_exp: number;
  Vtot: number; flux: number;
  radEnabled: boolean; emis: number; Tr_C: number;
  hr: number; Qrad: number; heff: number;
  L_mm: number; W_mm: number; TH_mm: number; BH_mm: number;
  FH_mm: number; FT_mm: number; PD_mm: number; taper: number;
  type: FinType; poly: number; matTxt: string;
}

// ─── Fin SVG Icons ───────────────────────────────────────────────────────────
const FinIcons: Record<string, ReactElement> = {
  longitudinal: (
    <svg width="50" height="32" viewBox="0 0 50 32">
      <rect x="0" y="27" width="50" height="5" rx="1" fill="#164e63" />
      <rect x="3" y="3" width="5" height="24" rx="1" fill="#06b6d4" opacity=".85" />
      <rect x="11" y="3" width="5" height="24" rx="1" fill="#06b6d4" opacity=".85" />
      <rect x="19" y="3" width="5" height="24" rx="1" fill="#06b6d4" opacity=".85" />
      <rect x="27" y="3" width="5" height="24" rx="1" fill="#06b6d4" opacity=".85" />
      <rect x="35" y="3" width="5" height="24" rx="1" fill="#06b6d4" opacity=".85" />
    </svg>
  ),
  "pin-inline": (
    <svg width="50" height="32" viewBox="0 0 50 32">
      <rect x="0" y="27" width="50" height="5" rx="1" fill="#164e63" />
      <circle cx="8" cy="10" r="4" fill="#06b6d4" opacity=".85" />
      <circle cx="20" cy="10" r="4" fill="#06b6d4" opacity=".85" />
      <circle cx="32" cy="10" r="4" fill="#06b6d4" opacity=".85" />
      <circle cx="44" cy="10" r="4" fill="#06b6d4" opacity=".85" />
      <circle cx="8" cy="22" r="4" fill="#06b6d4" opacity=".5" />
      <circle cx="20" cy="22" r="4" fill="#06b6d4" opacity=".5" />
      <circle cx="32" cy="22" r="4" fill="#06b6d4" opacity=".5" />
      <circle cx="44" cy="22" r="4" fill="#06b6d4" opacity=".5" />
    </svg>
  ),
  "pin-staggered": (
    <svg width="50" height="32" viewBox="0 0 50 32">
      <rect x="0" y="27" width="50" height="5" rx="1" fill="#164e63" />
      <circle cx="8" cy="9" r="4" fill="#f97316" opacity=".9" />
      <circle cx="20" cy="9" r="4" fill="#f97316" opacity=".9" />
      <circle cx="32" cy="9" r="4" fill="#f97316" opacity=".9" />
      <circle cx="44" cy="9" r="4" fill="#f97316" opacity=".9" />
      <circle cx="14" cy="21" r="4" fill="#f97316" opacity=".65" />
      <circle cx="26" cy="21" r="4" fill="#f97316" opacity=".65" />
      <circle cx="38" cy="21" r="4" fill="#f97316" opacity=".65" />
    </svg>
  ),
  "conical-inline": (
    <svg width="50" height="32" viewBox="0 0 50 32">
      <rect x="0" y="27" width="50" height="5" rx="1" fill="#164e63" />
      <polygon points="5,4 9,4 11,25 3,25" fill="#22c55e" opacity=".85" />
      <polygon points="16,4 20,4 22,25 14,25" fill="#22c55e" opacity=".85" />
      <polygon points="27,4 31,4 33,25 25,25" fill="#22c55e" opacity=".85" />
      <polygon points="38,4 42,4 44,25 36,25" fill="#22c55e" opacity=".85" />
    </svg>
  ),
  "conical-staggered": (
    <svg width="50" height="32" viewBox="0 0 50 32">
      <rect x="0" y="27" width="50" height="5" rx="1" fill="#164e63" />
      <polygon points="4,4 8,4 10,20 2,20" fill="#22c55e" opacity=".85" />
      <polygon points="18,4 22,4 24,20 16,20" fill="#22c55e" opacity=".85" />
      <polygon points="32,4 36,4 38,20 30,20" fill="#22c55e" opacity=".85" />
      <polygon points="11,15 15,15 17,27 9,27" fill="#22c55e" opacity=".5" />
      <polygon points="25,15 29,15 31,27 23,27" fill="#22c55e" opacity=".5" />
    </svg>
  ),
  "polygon-inline": (
    <svg width="50" height="32" viewBox="0 0 50 32">
      <rect x="0" y="27" width="50" height="5" rx="1" fill="#164e63" />
      <polygon points="8,3 12,7 12,21 8,25 4,21 4,7" fill="#38bdf8" opacity=".85" />
      <polygon points="22,3 26,7 26,21 22,25 18,21 18,7" fill="#38bdf8" opacity=".85" />
      <polygon points="36,3 40,7 40,21 36,25 32,21 32,7" fill="#38bdf8" opacity=".85" />
    </svg>
  ),
  "polygon-staggered": (
    <svg width="50" height="32" viewBox="0 0 50 32">
      <rect x="0" y="27" width="50" height="5" rx="1" fill="#164e63" />
      <polygon points="8,3 12,7 12,19 8,23 4,19 4,7" fill="#38bdf8" opacity=".85" />
      <polygon points="22,3 26,7 26,19 22,23 18,19 18,7" fill="#38bdf8" opacity=".85" />
      <polygon points="36,3 40,7 40,19 36,23 32,19 32,7" fill="#38bdf8" opacity=".85" />
      <polygon points="15,12 19,16 19,25 15,29 11,25 11,16" fill="#38bdf8" opacity=".6" />
      <polygon points="29,12 33,16 33,25 29,29 25,25 25,16" fill="#38bdf8" opacity=".6" />
    </svg>
  ),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function adjCol(hex: string, d: number): string {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v + Math.round(d * 255)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ZHeat() {
  const [S, setS] = useState<State>({ fin: "longitudinal", poly: 3, stag: "half", res: null });
  const [showLoader, setShowLoader] = useState(false);
  const [loaderText, setLoaderText] = useState("PROCESSING...");
  const [errMsg, setErrMsg] = useState("");
  const [radEnabled, setRadEnabled] = useState(false);
  const [pitchNote, setPitchNote] = useState("auto");
  const [taperVal, setTaperVal] = useState("1.00");
  const [kNote, setKNote] = useState("k = 205 W/m.K");
  const [showCustomK, setShowCustomK] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ name: "", email: "", company: "", phone: "", qty: "1", material: "", finish: "As machined", notes: "" });
  const [quoteSent, setQuoteSent] = useState(false);
  const [showTempProfile, setShowTempProfile] = useState(false);
  const cvTempRef = useRef<HTMLCanvasElement>(null);

  // Input refs
  const bLRef = useRef<HTMLInputElement>(null);
  const bWRef = useRef<HTMLInputElement>(null);
  const tHRef = useRef<HTMLInputElement>(null);
  const bHRef = useRef<HTMLInputElement>(null);
  const matRef = useRef<HTMLSelectElement>(null);
  const ckRef = useRef<HTMLInputElement>(null);
  const fHRef = useRef<HTMLInputElement>(null);
  const fTRef = useRef<HTMLInputElement>(null);
  const pDRef = useRef<HTMLInputElement>(null);
  const taperRef = useRef<HTMLInputElement>(null);
  const nLRef = useRef<HTMLInputElement>(null);
  const nWRef = useRef<HTMLInputElement>(null);
  const pitchRef = useRef<HTMLInputElement>(null);
  const QRef = useRef<HTMLInputElement>(null);
  const TaRef = useRef<HTMLInputElement>(null);
  const hvRef = useRef<HTMLInputElement>(null);
  const emisRef = useRef<HTMLInputElement>(null);
  const TrRef = useRef<HTMLInputElement>(null);
  const cvTRef = useRef<HTMLCanvasElement>(null);
  const cvFRef = useRef<HTMLCanvasElement>(null);
  const cvIRef = useRef<HTMLCanvasElement>(null);

  const v = (ref: React.RefObject<HTMLInputElement | null>) => parseFloat(ref.current?.value || "0") || 0;
  const iv = (ref: React.RefObject<HTMLInputElement | null>) => parseInt(ref.current?.value || "0") || 0;

  const getK = useCallback(() => {
    if (!matRef.current) return 205;
    return matRef.current.value === "custom" ? v(ckRef) : parseFloat(matRef.current.value);
  }, []);

  const finColor = useCallback((fin: FinType) => {
    if (fin.startsWith("conical")) return "#22c55e";
    if (fin.startsWith("polygon")) return "#38bdf8";
    if (fin.includes("staggered")) return "#f97316";
    return "#06b6d4";
  }, []);

  // ─── Canvas Drawing ─────────────────────────────────────────────────────
  const clrCv = (cv: HTMLCanvasElement) => {
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#080c14";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = "rgba(6,182,212,0.06)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < cv.width; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cv.height); ctx.stroke(); }
    for (let y = 0; y < cv.height; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cv.width, y); ctx.stroke(); }
    return ctx;
  };

  const polyPin = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, sides: number) => {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = (Math.PI * 2 * i) / sides - Math.PI / 2;
      if (i === 0) ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      else ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  };

  const drawTop = useCallback(() => {
    const cv = cvTRef.current; if (!cv) return;
    const L = Math.max(1, v(bLRef)), W = Math.max(1, v(bWRef));
    const FH = Math.max(1, v(fHRef)), FT = Math.max(0.1, v(fTRef));
    const PD = Math.max(0.5, v(pDRef)), NL = Math.max(1, iv(nLRef)), NW = Math.max(1, iv(nWRef));
    const tp = parseFloat(taperRef.current?.value || "1") || 1;
    const ctx = clrCv(cv); const pad = 24;
    const sc = Math.min((cv.width - pad * 2) / L, (cv.height - pad * 2) / W);
    const ox = (cv.width - L * sc) / 2, oy = (cv.height - W * sc) / 2;
    ctx.fillStyle = "rgba(6,182,212,0.15)"; ctx.strokeStyle = "rgba(6,182,212,0.5)"; ctx.lineWidth = 1.5;
    ctx.fillRect(ox, oy, L * sc, W * sc); ctx.strokeRect(ox, oy, L * sc, W * sc);
    const fc = finColor(S.fin); ctx.fillStyle = fc + "cc"; ctx.strokeStyle = fc; ctx.lineWidth = 0.8;
    if (S.fin === "longitudinal") {
      const ph = W / (NL + 1);
      for (let i = 0; i < NL; i++) {
        const y = oy + (i + 1) * ph * sc - FT * sc / 2;
        ctx.fillRect(ox + 2, y, L * sc - 4, FT * sc); ctx.strokeRect(ox + 2, y, L * sc - 4, FT * sc);
      }
    } else if (S.fin.startsWith("pin") || S.fin.startsWith("polygon")) {
      const pL = L / (NL + 1), pW = W / (NW + 1), r = PD / 2 * sc;
      for (let i = 0; i < NL; i++) for (let j = 0; j < NW; j++) {
        let x = ox + (i + 1) * pL * sc;
        if ((S.fin === "pin-staggered" || S.fin === "polygon-staggered") && j % 2 === 1) x += pL * sc / 2;
        const y = oy + (j + 1) * pW * sc;
        if (S.fin.startsWith("polygon")) polyPin(ctx, x, y, r, S.poly);
        else { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      }
    } else {
      const pL = L / (NL + 1), pW = W / (NW + 1), r = PD / 2 * sc;
      for (let i = 0; i < NL; i++) for (let j = 0; j < NW; j++) {
        let x = ox + (i + 1) * pL * sc;
        if (S.fin === "conical-staggered" && j % 2 === 1) x += pL * sc / 2;
        const y = oy + (j + 1) * pW * sc;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = fc + "44"; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.arc(x, y, r * tp, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = fc; ctx.lineWidth = 0.8;
      }
    }
    ctx.fillStyle = "rgba(6,182,212,0.5)"; ctx.font = "9px monospace";
    ctx.fillText(`L=${L}mm`, ox + 2, oy - 5);
    ctx.save(); ctx.translate(ox - 14, oy + W * sc / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText(`W=${W}mm`, -20, 0); ctx.restore();
  }, [S.fin, S.poly, finColor]);

  const drawFront = useCallback(() => {
    const cv = cvFRef.current; if (!cv) return;
    const L = Math.max(1, v(bLRef)), W = Math.max(1, v(bWRef));
    const TH = Math.max(1, v(tHRef)), BH = Math.max(1, v(bHRef));
    const FH = Math.max(1, v(fHRef)), FT = Math.max(0.1, v(fTRef));
    const PD = Math.max(0.5, v(pDRef)), NL = Math.max(1, iv(nLRef));
    const tp = parseFloat(taperRef.current?.value || "1") || 1;
    const ctx = clrCv(cv); const pad = 24;
    const sc = Math.min((cv.width - pad * 2) / L, (cv.height - pad * 2) / TH);
    const ox = (cv.width - L * sc) / 2, oy = (cv.height - TH * sc) / 2;
    ctx.fillStyle = "rgba(6,182,212,0.15)"; ctx.strokeStyle = "rgba(6,182,212,0.5)"; ctx.lineWidth = 1.5;
    ctx.fillRect(ox, oy + FH * sc, L * sc, BH * sc); ctx.strokeRect(ox, oy + FH * sc, L * sc, BH * sc);
    const fc = finColor(S.fin); ctx.fillStyle = fc + "aa"; ctx.strokeStyle = fc; ctx.lineWidth = 0.8;
    const ph = L / (NL + 1);
    for (let i = 0; i < NL; i++) {
      const x = ox + (i + 1) * ph * sc;
      const bT = (S.fin === "longitudinal" ? FT : PD) * sc, tT = bT * tp;
      ctx.beginPath();
      ctx.moveTo(x - bT / 2, oy + FH * sc); ctx.lineTo(x + bT / 2, oy + FH * sc);
      ctx.lineTo(x + tT / 2, oy); ctx.lineTo(x - tT / 2, oy);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = "rgba(6,182,212,0.5)"; ctx.font = "9px monospace";
    ctx.save(); ctx.translate(ox - 16, oy + FH * sc / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText(`FH=${FH}mm`, -22, 0); ctx.restore();
    ctx.fillText(`L=${L}mm`, ox + 2, oy + TH * sc + 14);
  }, [S.fin, finColor]);

  const drawIso = useCallback(() => {
    const cv = cvIRef.current; if (!cv) return;
    const L = Math.max(1, v(bLRef)), W = Math.max(1, v(bWRef));
    const TH = Math.max(1, v(tHRef)), BH = Math.max(1, v(bHRef));
    const FH = Math.max(1, v(fHRef)), FT = Math.max(0.1, v(fTRef));
    const PD = Math.max(0.5, v(pDRef)), NL = Math.max(1, iv(nLRef)), NW = Math.max(1, iv(nWRef));

    const ctx = clrCv(cv);
    const cx = cv.width / 2, cy = cv.height / 2;

    // Determine the max dimensions to scale down properly
    const maxZ = BH + FH;
    const sc = Math.min(cv.width, cv.height) / Math.max(L, W, maxZ) * 0.45;

    // Model center offsets to center the bounding volume at (cx, cy)
    const mcx = L / 2;
    const mcy = W / 2;
    const mcz = maxZ / 2;

    const iso = (x: number, y: number, z: number) => ({
      px: cx + ((x - mcx) - (y - mcy)) * Math.cos(Math.PI / 6) * sc,
      py: cy - (z - mcz) * sc + ((x - mcx) + (y - mcy)) * Math.sin(Math.PI / 6) * sc
    });

    const isoBox = (x: number, y: number, z: number, w: number, d: number, h: number, fill: string, strk: string) => {
      ctx.strokeStyle = strk; ctx.lineWidth = 0.6;
      const A = iso(x, y, z + h), B = iso(x + w, y, z + h), C = iso(x + w, y + d, z + h), D = iso(x, y + d, z + h);
      const E = iso(x, y, z), F = iso(x + w, y, z), G = iso(x + w, y + d, z);
      ctx.beginPath(); ctx.moveTo(A.px, A.py); ctx.lineTo(B.px, B.py); ctx.lineTo(C.px, C.py); ctx.lineTo(D.px, D.py); ctx.closePath();
      ctx.fillStyle = adjCol(fill, 0.18); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(A.px, A.py); ctx.lineTo(B.px, B.py); ctx.lineTo(F.px, F.py); ctx.lineTo(E.px, E.py); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(B.px, B.py); ctx.lineTo(C.px, C.py); ctx.lineTo(G.px, G.py); ctx.lineTo(F.px, F.py); ctx.closePath();
      ctx.fillStyle = adjCol(fill, -0.14); ctx.fill(); ctx.stroke();
    };

    isoBox(0, 0, 0, L, W, BH, "#0e7490", "#06b6d4");
    const fc = finColor(S.fin);
    const tp = parseFloat(taperRef.current?.value || "1") || 1;

    if (S.fin === "longitudinal") {
      const ph = W / (NL + 1);
      for (let i = 0; i < NL; i++) isoBox(0, (i + 1) * ph - FT / 2, BH, L, FT, FH, fc, adjCol(fc, -0.1));
    } else {
      const pL = L / (NL + 1), pW = W / (NW + 1), r = PD / 2;
      for (let i = 0; i < NL; i++) for (let j = 0; j < NW; j++) {
        let px = (i + 1) * pL;
        if ((S.fin === "pin-staggered" || S.fin === "conical-staggered" || S.fin === "polygon-staggered") && j % 2 === 1) px += pL / 2;
        isoBox(px - r, (j + 1) * pW - r, BH, PD, PD, FH, fc, adjCol(fc, -0.1));
      }
    }
  }, [S.fin, S.poly, finColor]);

  const lp = useCallback(() => {
    drawTop(); drawFront(); drawIso();
  }, [drawTop, drawFront, drawIso]);

  useEffect(() => { lp(); }, [lp]);

  // ─── Geometry Engine ──────────────────────────────────────────────────────
  const geomBox = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): any[] => {
    const t: any[] = [];
    const quad = (n: number[], a: number[], b: number[], c: number[], d: number[]) => { t.push([n, a, b, c]); t.push([n, a, c, d]); };
    quad([0, 0, -1], [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]);
    quad([0, 0, 1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1], [x1, y0, z1]);
    quad([0, -1, 0], [x0, y0, z0], [x0, y0, z1], [x1, y0, z1], [x1, y0, z0]);
    quad([0, 1, 0], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]);
    quad([-1, 0, 0], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]);
    quad([1, 0, 0], [x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]);
    return t;
  };

  const geomFrustum = (cx: number, cy: number, z0: number, rb: number, rt: number, h: number, N = 32): any[] => {
    const t: any[] = []; const angs: number[] = []; const bot: number[][] = []; const top: number[][] = [];
    for (let i = 0; i < N; i++) angs.push(2 * Math.PI * i / N);
    for (let i = 0; i < N; i++) {
      bot.push([cx + rb * Math.cos(angs[i]), cy + rb * Math.sin(angs[i]), z0]);
      top.push([cx + rt * Math.cos(angs[i]), cy + rt * Math.sin(angs[i]), z0 + h]);
    }
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      t.push([[0, 0, -1], [cx, cy, z0], bot[j], bot[i]]);
      t.push([[0, 0, 1], [cx, cy, z0 + h], top[i], top[j]]);
      const ma = (angs[i] + angs[j]) / 2;
      t.push([[Math.cos(ma), Math.sin(ma), 0], bot[i], bot[j], top[j]]);
      t.push([[Math.cos(ma), Math.sin(ma), 0], bot[i], top[j], top[i]]);
    }
    return t;
  };

  const geomPolyPin = (cx: number, cy: number, z0: number, rb: number, rt: number, h: number, sides: number): any[] => {
    const t: any[] = []; const angs: number[] = []; const bot: number[][] = []; const top: number[][] = [];
    for (let i = 0; i < sides; i++) angs.push(2 * Math.PI * i / sides - Math.PI / 2);
    for (let i = 0; i < sides; i++) {
      bot.push([cx + rb * Math.cos(angs[i]), cy + rb * Math.sin(angs[i]), z0]);
      top.push([cx + rt * Math.cos(angs[i]), cy + rt * Math.sin(angs[i]), z0 + h]);
    }
    for (let i = 0; i < sides; i++) {
      const j = (i + 1) % sides;
      t.push([[0, 0, -1], [cx, cy, z0], bot[j], bot[i]]);
      t.push([[0, 0, 1], [cx, cy, z0 + h], top[i], top[j]]);
      const ma = (angs[i] + angs[j]) / 2;
      t.push([[Math.cos(ma), Math.sin(ma), 0], bot[i], bot[j], top[j]]);
      t.push([[Math.cos(ma), Math.sin(ma), 0], bot[i], top[j], top[i]]);
    }
    return t;
  };

  const geomBlade = (xL: number, yc: number, z0: number, wb: number, wt: number, height: number): any[] => {
    const hb = wb / 2, ht = wt / 2;
    const A = [0, yc - hb, z0], B = [xL, yc - hb, z0], C = [xL, yc + hb, z0], D = [0, yc + hb, z0];
    const E = [0, yc - ht, z0 + height], F = [xL, yc - ht, z0 + height], G = [xL, yc + ht, z0 + height], H = [0, yc + ht, z0 + height];
    const t: any[] = [];
    const quad = (n: number[], a: number[], b: number[], c: number[], d: number[]) => { t.push([n, a, b, c]); t.push([n, a, c, d]); };
    quad([0, 0, -1], A, B, C, D); quad([0, 0, 1], E, H, G, F);
    quad([0, -1, 0], A, E, F, B); quad([0, 1, 0], D, C, G, H);
    quad([-1, 0, 0], A, D, H, E); quad([1, 0, 0], B, F, G, C);
    return t;
  };

  const buildAllTris = (): any[] => {
    const L = v(bLRef), W = v(bWRef), BH = v(bHRef), FH = v(fHRef), FT = v(fTRef), PD = v(pDRef);
    const NL = iv(nLRef), NW = iv(nWRef);
    const tp = parseFloat(taperRef.current?.value || "1") || 1;
    const stag = S.fin.includes("staggered");
    let tris = geomBox(0, 0, 0, L, W, BH);
    if (S.fin === "longitudinal") {
      const ph = W / (NL + 1);
      for (let i = 0; i < NL; i++) tris = tris.concat(geomBlade(L, (i + 1) * ph, BH, FT, FT * tp, FH));
    } else if (S.fin.startsWith("polygon")) {
      const pL = L / (NL + 1), pW = W / (NW + 1), rb = PD / 2, rt = rb * tp;
      for (let i = 0; i < NL; i++) for (let j = 0; j < NW; j++) {
        const px = (i + 1) * pL + (stag && j % 2 === 1 ? pL / 2 : 0);
        tris = tris.concat(geomPolyPin(px, (j + 1) * pW, BH, rb, rt, FH, S.poly));
      }
    } else {
      const pL = L / (NL + 1), pW = W / (NW + 1), rb = PD / 2, rt = rb * tp;
      for (let i = 0; i < NL; i++) for (let j = 0; j < NW; j++) {
        const px = (i + 1) * pL + (stag && j % 2 === 1 ? pL / 2 : 0);
        tris = tris.concat(geomFrustum(px, (j + 1) * pW, BH, rb, rt, FH));
      }
    }
    return tris;
  };

  // ─── Compute ──────────────────────────────────────────────────────────────
  const compute = () => {
    setErrMsg("");
    const L = v(bLRef) * 1e-3, W = v(bWRef) * 1e-3, TH = v(tHRef) * 1e-3, BH = v(bHRef) * 1e-3;
    const FH = v(fHRef) * 1e-3, FT = v(fTRef) * 1e-3, PD = v(pDRef) * 1e-3;
    const NL = Math.max(1, iv(nLRef)), NW = Math.max(1, iv(nWRef));
    const tp = parseFloat(taperRef.current?.value || "1") || 1;
    const Q = v(QRef), Ta = v(TaRef), h = v(hvRef), k = getK();

    if (FH > TH - BH + 1e-4) { setErrMsg(`Fin height exceeds available space (${((TH - BH) * 1000).toFixed(1)} mm). Adjust dimensions.`); return; }
    if (h <= 0 || k <= 0 || Q <= 0) { setErrMsg("h, k, and Q must all be positive."); return; }

    let Nfins = 0, Afin1 = 0, Afintot = 0, Abase_exp = 0, Atot = 0;
    let Vfins = 0, m = 0, mL = 0, eta = 0, eps = 0;
    const Vbase = L * W * BH;

    if (S.fin === "longitudinal") {
      Nfins = NL;
      const tW = FT * tp, avgT = (FT + tW) / 2, Lc = FH + avgT / 2;
      Afin1 = 2 * FH * W + tW * W; Afintot = Nfins * Afin1;
      Abase_exp = L * W - Nfins * FT * W; Vfins = Nfins * FH * W * (FT + tW) / 2;
      const Pcs = 2 * (W + avgT), Acs = W * avgT;
      m = Math.sqrt(h * Pcs / (k * Acs)); mL = m * Lc;
      eta = mL > 1e-6 ? Math.tanh(mL) / mL : 1;
      eps = Math.sqrt(k * Pcs / (h * Acs)) * eta;
    } else if (S.fin.startsWith("pin") || S.fin.startsWith("polygon")) {
      Nfins = NL * NW;
      const rb = PD / 2, rt = rb * tp;
      if (S.fin.startsWith("polygon")) {
        const sd = S.poly, sL2 = 2 * rb * Math.sin(Math.PI / sd);
        const Ab = (sd * sL2 * rb * Math.cos(Math.PI / sd)) / 2, At = Ab * tp * tp;
        const Pcs = sd * sL2;
        Afin1 = Pcs * FH + At; Vfins = (Ab + At + Math.sqrt(Ab * At)) / 3 * FH * Nfins;
        m = Math.sqrt(h * Pcs / (k * Ab));
        Afintot = Nfins * Afin1; Abase_exp = L * W - Nfins * Ab;
        mL = m * FH; eta = mL > 1e-6 ? Math.tanh(mL) / mL : 1; eps = eta * Afin1 / Ab;
      } else {
        const sl = Math.sqrt(FH * FH + Math.pow(rb - rt, 2));
        Afin1 = Math.PI * (rb + rt) * sl + Math.PI * rt * rt;
        Vfins = (Math.PI * FH / 3) * (rb * rb + rb * rt + rt * rt) * Nfins;
        const Pcs = Math.PI * (rb + rt), Acs = Math.PI * Math.pow((rb + rt) / 2, 2);
        m = Math.sqrt(h * Pcs / (k * Acs));
        Afintot = Nfins * Afin1; Abase_exp = L * W - Nfins * Math.PI * rb * rb;
        mL = m * FH; eta = mL > 1e-6 ? Math.tanh(mL) / mL : 1;
        eps = eta * Afin1 / (Math.PI * rb * rb);
      }
    } else {
      Nfins = NL * NW;
      const rb = PD / 2, rt = rb * tp;
      const sl = Math.sqrt(FH * FH + Math.pow(rb - rt, 2));
      Afin1 = Math.PI * (rb + rt) * sl + Math.PI * rt * rt;
      Afintot = Nfins * Afin1; Abase_exp = L * W - Nfins * Math.PI * rb * rb;
      Vfins = (Math.PI * FH / 3) * (rb * rb + rb * rt + rt * rt) * Nfins;
      const Pcs = Math.PI * (rb + rt), Acs = Math.PI * Math.pow((rb + rt) / 2, 2);
      m = Math.sqrt(h * Pcs / (k * Acs)); mL = m * FH;
      eta = mL > 1e-6 ? Math.tanh(mL) / mL : 1;
      eps = eta * Afin1 / (Math.PI * rb * rb);
    }

    eta = Math.min(1, Math.max(0, eta));
    Atot = Afintot + Abase_exp;
    const eta0 = 1 - (Afintot / Atot) * (1 - eta);
    const Vtot = Vbase + (Vfins || 0);
    const flux = Q / (L * W * 1e4);
    const SIGMA = 5.670374419e-8;
    const emis_v = radEnabled ? (parseFloat(emisRef.current?.value || "0.85") || 0.85) : 0;
    const Tr_C = radEnabled ? (parseFloat(TrRef.current?.value || "25") || 25) : v(TaRef);
    const Tr_K = Tr_C + 273.15;

    let Tbase = 0, Ttip = 0, hr = 0, Qrad = 0, heff = h;

    if (!radEnabled || emis_v <= 0) {
      const R = 1 / (h * eta0 * Atot); Tbase = Ta + Q * R;
      Ttip = Ta + (Tbase - Ta) / Math.cosh(mL);
    } else {
      const Ta_K = Ta + 273.15, A_eff = eta0 * Atot;
      let Tb = Ta + Q / (h * A_eff);
      for (let iter = 0; iter < 50; iter++) {
        const Tb_K = Tb + 273.15;
        const Qconv = h * A_eff * (Tb - Ta);
        const Qr = emis_v * SIGMA * A_eff * (Tb_K ** 4 - Tr_K ** 4);
        const f = Qconv + Qr - Q;
        const dfdT = h * A_eff + emis_v * SIGMA * A_eff * 4 * Tb_K ** 3;
        const dTb = -f / dfdT; Tb += dTb;
        if (Math.abs(dTb) < 1e-4) break;
      }
      Tbase = Tb;
      const Tb_K2 = Tbase + 273.15;
      Qrad = emis_v * SIGMA * eta0 * Atot * (Tb_K2 ** 4 - Tr_K ** 4);
      hr = (Tbase - Ta) > 1e-6 ? emis_v * SIGMA * (Tb_K2 ** 2 + Tr_K ** 2) * (Tb_K2 + Tr_K) : 0;
      heff = h + hr;
      const m_eff = m * Math.sqrt(heff / h), mL_eff = mL * Math.sqrt(heff / h);
      Ttip = Ta + (Tbase - Ta) / Math.cosh(mL_eff > 0 ? mL_eff : mL);
    }

    const R_conv = 1 / (h * eta0 * Atot);
    const R_eff = (Tbase - Ta) > 1e-6 ? (Tbase - Ta) / Q : R_conv;

    const result: ResultData = {
      eta: eta * 100, eta0: eta0 * 100, eps, mL, m,
      Tbase, Ttip, Ta, Q, h, k, Nfins, R: R_conv, R_eff,
      Atot: Atot * 1e4, Afintot: Afintot * 1e4, Abase_exp: Abase_exp * 1e4,
      Vtot: Vtot * 1e6, flux,
      radEnabled, emis: emis_v, Tr_C,
      hr, Qrad, heff,
      L_mm: v(bLRef), W_mm: v(bWRef), TH_mm: v(tHRef), BH_mm: v(bHRef),
      FH_mm: v(fHRef), FT_mm: v(fTRef), PD_mm: v(pDRef), taper: tp,
      type: S.fin, poly: S.poly,
      matTxt: matRef.current?.options[matRef.current.selectedIndex].text || ""
    };
    setS(prev => ({ ...prev, res: result }));
    lp();
  };

  // ─── Temperature Profile Chart ────────────────────────────────────────────
  const drawTempProfile = useCallback(() => {
    const cv = cvTempRef.current;
    if (!cv || !S.res) return;
    const r = S.res;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height;
    const pad = { top: 32, right: 24, bottom: 44, left: 64 };
    const cw = W - pad.left - pad.right, ch = H - pad.top - pad.bottom;

    // Background
    ctx.fillStyle = "#080c14"; ctx.fillRect(0, 0, W, H);
    // Grid
    ctx.strokeStyle = "rgba(6,182,212,0.06)"; ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + (i / 5) * ch;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cw, y); ctx.stroke();
    }
    for (let i = 0; i <= 10; i++) {
      const x = pad.left + (i / 10) * cw;
      ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + ch); ctx.stroke();
    }

    const N = 80;
    const mL = r.mL;
    const Tbase = r.Tbase, Ta = r.Ta;
    const points: { x: number; T: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const xi = i / N; // 0 = base, 1 = tip
      const T = Ta + (Tbase - Ta) * Math.cosh(mL * (1 - xi)) / Math.cosh(mL);
      points.push({ x: xi, T });
    }

    const Tmin = Math.min(...points.map(p => p.T));
    const Tmax = Math.max(...points.map(p => p.T));
    const Trange = Tmax - Tmin || 1;

    // Shaded area under curve
    ctx.beginPath();
    points.forEach((p, i) => {
      const px = pad.left + p.x * cw;
      const py = pad.top + ch - ((p.T - Tmin) / Trange) * ch;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.lineTo(pad.left + cw, pad.top + ch);
    ctx.lineTo(pad.left, pad.top + ch);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
    grad.addColorStop(0, "rgba(6,182,212,0.3)");
    grad.addColorStop(1, "rgba(6,182,212,0.02)");
    ctx.fillStyle = grad; ctx.fill();

    // Curve line
    ctx.beginPath();
    ctx.strokeStyle = "#06b6d4"; ctx.lineWidth = 2.5;
    points.forEach((p, i) => {
      const px = pad.left + p.x * cw;
      const py = pad.top + ch - ((p.T - Tmin) / Trange) * ch;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Axes
    ctx.strokeStyle = "rgba(100,116,139,0.5)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, pad.top); ctx.lineTo(pad.left, pad.top + ch); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad.left, pad.top + ch); ctx.lineTo(pad.left + cw, pad.top + ch); ctx.stroke();

    // Axis labels Y
    ctx.fillStyle = "rgba(100,116,139,0.8)"; ctx.font = "10px monospace"; ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      const T = Tmin + (1 - i / 5) * Trange;
      ctx.fillText(T.toFixed(1), pad.left - 6, pad.top + (i / 5) * ch + 3.5);
    }
    // Axis labels X
    ctx.textAlign = "center"; ctx.fillStyle = "rgba(100,116,139,0.8)";
    ["Base", "25%", "50%", "75%", "Tip"].forEach((lbl, i) => {
      ctx.fillText(lbl, pad.left + (i / 4) * cw, pad.top + ch + 14);
    });

    // Axis titles
    ctx.save(); ctx.translate(14, pad.top + ch / 2); ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center"; ctx.fillStyle = "rgba(6,182,212,0.7)"; ctx.font = "10px monospace";
    ctx.fillText("Temperature (°C)", 0, 0); ctx.restore();
    ctx.textAlign = "center"; ctx.fillStyle = "rgba(6,182,212,0.7)"; ctx.font = "10px monospace";
    ctx.fillText("Position along Fin", pad.left + cw / 2, H - 6);

    // Markers: base & tip
    const drawMarker = (xi: number, T: number, lbl: string) => {
      const px = pad.left + xi * cw;
      const py = pad.top + ch - ((T - Tmin) / Trange) * ch;
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#06b6d4"; ctx.fill();
      ctx.strokeStyle = "#0d1520"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "rgba(6,182,212,0.9)"; ctx.font = "bold 10px monospace";
      ctx.textAlign = xi < 0.5 ? "left" : "right";
      ctx.fillText(`${lbl}: ${T.toFixed(1)}°C`, px + (xi < 0.5 ? 8 : -8), py - 8);
    };
    drawMarker(0, Tbase, "T_base");
    drawMarker(1, points[N].T, "T_tip");
  }, [S.res]);

  // // ─── CSV Export ───────────────────────────────────────────────────────────
  // const doCSV = () => {
  //   if (!S.res) { alert("Please run Compute Analysis first."); return; }
  //   const r = S.res;
  //   const rows = [
  //     ["Parameter", "Value", "Unit"],
  //     ["Fin Type", r.type, ""],
  //     ["Base Length", r.L_mm, "mm"],
  //     ["Base Width", r.W_mm, "mm"],
  //     ["Total Height", r.TH_mm, "mm"],
  //     ["Base Plate Thickness", r.BH_mm, "mm"],
  //     ["Fin/Pin Height", r.FH_mm, "mm"],
  //     ["Fin Thickness / Pin Dia", r.FT_mm, "mm"],
  //     ["Taper Ratio", r.taper.toFixed(2), "--"],
  //     ["Number of Fins/Pins", r.Nfins, "--"],
  //     ["Material", r.matTxt, ""],
  //     ["Thermal Conductivity k", r.k, "W/m·K"],
  //     ["Heat Input Q", r.Q, "W"],
  //     ["Ambient Temperature", r.Ta, "°C"],
  //     ["Conv. Coefficient h", r.h, "W/m²·K"],
  //     ["Fin Efficiency eta", r.eta.toFixed(3), "%"],
  //     ["Overall Surface Efficiency eta0", r.eta0.toFixed(3), "%"],
  //     ["Fin Effectiveness eps", r.eps.toFixed(4), "--"],
  //     ["mL parameter", r.mL.toFixed(5), "--"],
  //     ["m (fin parameter)", r.m.toExponential(3), "1/m"],
  //     ["Base Temperature Tbase", r.Tbase.toFixed(2), "°C"],
  //     ["Fin Tip Temperature Ttip", r.Ttip.toFixed(2), "°C"],
  //     ["Total Conv. Surface Atot", r.Atot.toFixed(3), "cm²"],
  //     ["Fin Surface Area Afin", r.Afintot.toFixed(3), "cm²"],
  //     ["Exposed Base Area", r.Abase_exp.toFixed(3), "cm²"],
  //     ["Total Volume", r.Vtot.toFixed(4), "cm³"],
  //     ["Convective Resistance Rth", r.R.toFixed(5), "°C/W"],
  //     ["Base Heat Flux", r.flux.toFixed(4), "W/cm²"],
  //     ...(r.radEnabled ? [
  //       ["Emissivity", r.emis.toFixed(3), "--"],
  //       ["Radiation Sink Temp", r.Tr_C.toFixed(1), "°C"],
  //       ["Radiation Heat Loss Qrad", r.Qrad.toFixed(3), "W"],
  //       ["Linearised Rad. Coeff hr", r.hr.toFixed(3), "W/m²·K"],
  //       ["Effective h_eff", r.heff.toFixed(3), "W/m²·K"],
  //       ["Effective Resistance Reff", r.R_eff.toFixed(5), "°C/W"],
  //     ] : []),
  //   ];
  //   const csv = rows.map(row => row.map(c => `"${c}"`).join(",")).join("\n");
  //   dlFile(csv, "text/csv", `ZHeat_Results_${r.type}_${r.L_mm}x${r.W_mm}.csv`);
  // };

  // ─── Optimization Tips ────────────────────────────────────────────────────
  const getOptimizationTips = (r: ResultData): { level: "good" | "warn" | "bad"; text: string }[] => {
    const tips: { level: "good" | "warn" | "bad"; text: string }[] = [];

    if (r.eta < 70) tips.push({ level: "bad", text: `Fin efficiency is low (${r.eta.toFixed(1)}%). Reduce fin height or increase fin thickness/diameter to lower the mL parameter.` });
    else if (r.eta < 85) tips.push({ level: "warn", text: `Fin efficiency is moderate (${r.eta.toFixed(1)}%). Consider slightly reducing fin height for better material utilisation.` });
    else tips.push({ level: "good", text: `Fin efficiency is excellent (${r.eta.toFixed(1)}%). Fins are well proportioned for maximum heat transfer per unit mass.` });

    if (r.eps < 2) tips.push({ level: "bad", text: `Fin effectiveness (${r.eps.toFixed(2)}) is below 2. Fins are not adding meaningful enhancement — consider increasing k, or reducing h by switching to forced convection.` });
    else if (r.eps < 5) tips.push({ level: "warn", text: `Fin effectiveness (${r.eps.toFixed(2)}) is acceptable but modest. Increasing fin height or using a higher-conductivity material could improve this.` });
    else tips.push({ level: "good", text: `Fin effectiveness (${r.eps.toFixed(2)}) is strong. The fins are significantly augmenting heat transfer over the bare base.` });

    if (r.Tbase > 85) tips.push({ level: "bad", text: `Base temperature (${r.Tbase.toFixed(1)} °C) exceeds typical safe limits. Increase surface area (more fins/pins or longer fins) or increase h.` });
    else if (r.Tbase > 70) tips.push({ level: "warn", text: `Base temperature (${r.Tbase.toFixed(1)} °C) is elevated. Consider adding more fins or using forced convection to bring it below 70 °C.` });
    else tips.push({ level: "good", text: `Base temperature (${r.Tbase.toFixed(1)} °C) is within a safe operating range.` });

    if (r.R > 0.5) tips.push({ level: "warn", text: `Thermal resistance Rθ = ${r.R.toFixed(3)} °C/W is relatively high. Increasing total surface area or convective coefficient will reduce it.` });
    else tips.push({ level: "good", text: `Thermal resistance Rθ = ${r.R.toFixed(3)} °C/W is good. System is effectively managing heat dissipation.` });

    const finFrac = r.Afintot / r.Atot;
    if (finFrac > 0.97) tips.push({ level: "warn", text: `Fin packing is very dense (${(finFrac * 100).toFixed(0)}% of area is fin). Ensure adequate flow channels for the coolant fluid between fins.` });

    if (r.mL > 3) tips.push({ level: "warn", text: `mL = ${r.mL.toFixed(2)} > 3, indicating diminishing returns on fin length. The added fin length beyond mL ≈ 3 contributes little to heat transfer.` });

    return tips;
  };

  // ─── STL Export ───────────────────────────────────────────────────────────
  const doSTL = () => {
    setLoaderText("BUILDING STL..."); setShowLoader(true);
    setTimeout(() => {
      try {
        const L = v(bLRef), W = v(bWRef);
        const tris = buildAllTris();
        const buf = new ArrayBuffer(84 + tris.length * 50);
        const dv = new DataView(buf);
        const hdr = `ZHeat ${S.fin} ${L}x${W} - Zhivam Pvt Ltd`;
        for (let i = 0; i < 80; i++) dv.setUint8(i, i < hdr.length ? hdr.charCodeAt(i) : 0);
        dv.setUint32(80, tris.length, true);
        let off = 84;
        for (const tri of tris) {
          const [n, v0, v1, v2] = tri;
          dv.setFloat32(off, n[0], true); dv.setFloat32(off + 4, n[1], true); dv.setFloat32(off + 8, n[2], true); off += 12;
          for (const vt of [v0, v1, v2]) { dv.setFloat32(off, vt[0], true); dv.setFloat32(off + 4, vt[1], true); dv.setFloat32(off + 8, vt[2], true); off += 12; }
          dv.setUint16(off, 0, true); off += 2;
        }
        dlBlob(new Blob([buf], { type: "model/stl" }), `ZHeat_${S.fin}_${L}x${W}.stl`);
        alert(`STL exported (${tris.length} triangles).\nOpens in SOLIDWORKS, Creo, COMSOL, FreeCAD, Fusion 360.`);
      } catch (e: any) { alert("STL error: " + e.message); }
      setShowLoader(false);
    }, 60);
  };

  const doOBJ = () => {
    setLoaderText("BUILDING OBJ..."); setShowLoader(true);
    setTimeout(() => {
      try {
        const L = v(bLRef), W = v(bWRef);
        const tris = buildAllTris();
        const verts: number[][] = [], norms: number[][] = [], faces: number[][] = [];
        const vm: Record<string, number> = {}, nm: Record<string, number> = {};
        const gv = (p: number[]) => { const k = p.map(x => x.toFixed(4)).join(","); if (!vm[k]) { vm[k] = verts.length + 1; verts.push(p); } return vm[k]; };
        const gn = (n: number[]) => { const k = n.map(x => x.toFixed(3)).join(","); if (!nm[k]) { nm[k] = norms.length + 1; norms.push(n); } return nm[k]; };
        for (const tri of tris) { const ni = gn(tri[0]); faces.push([gv(tri[1]), gv(tri[2]), gv(tri[3]), ni]); }
        const lines = [`# ZHeat - ${S.fin} ${L}x${W}`, "# Zhivam Private Limited", "# Units: millimetres", "", `o ZHeat_${S.fin}`, ""];
        verts.forEach(p => lines.push("v " + p.map(x => x.toFixed(4)).join(" ")));
        lines.push(""); norms.forEach(n => lines.push("vn " + n.map(x => x.toFixed(4)).join(" ")));
        lines.push(""); lines.push("g heatsink");
        faces.forEach(f => lines.push(`f ${f[0]}//${f[3]} ${f[1]}//${f[3]} ${f[2]}//${f[3]}`));
        dlFile(lines.join("\n"), "model/obj", `ZHeat_${S.fin}_${L}x${W}.obj`);
        alert("OBJ exported.\nOpens in SOLIDWORKS, Creo, COMSOL, FreeCAD, Fusion 360, Blender.");
      } catch (e: any) { alert("OBJ error: " + e.message); }
      setShowLoader(false);
    }, 60);
  };

  const dlFile = (content: string, mime: string, fname: string) => dlBlob(new Blob([content], { type: mime }), fname);
  const dlBlob = (blob: Blob, fname: string) => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = fname; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  };

  const doPDF = async () => {
    if (!S.res) { alert("Please run Compute Analysis first."); return; }
    const r = S.res;

    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const { jsPDF: _Ctor } = await import("jspdf");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc: any = new (_Ctor as any)({ orientation: "portrait", unit: "mm", format: "a4" });
    const PW = 210, PH = 297;
    const ML = 14, MR = 14, CT = PW - ML - MR; // content width

    // ── Colour palette ──────────────────────────────────────────────────────
    const C = {
      headerBg: [30, 41, 59] as [number, number, number],   // slate-800
      accentBlue: [30, 80, 140] as [number, number, number],   // Zhivam blue
      rowDark: [30, 41, 59] as [number, number, number],   // table header row
      rowLight: [241, 245, 249] as [number, number, number],   // table alt row
      border: [203, 213, 225] as [number, number, number],   // slate-300
      text: [30, 41, 59] as [number, number, number],
      textLight: [100, 116, 139] as [number, number, number],
      white: [255, 255, 255] as [number, number, number],
      cyan: [6, 182, 212] as [number, number, number],
      green: [34, 197, 94] as [number, number, number],
    };

    // ── Helpers ─────────────────────────────────────────────────────────────
    let y = 0;
    const setFont = (style: "normal" | "bold", size: number, color = C.text) => {
      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      doc.setTextColor(...color);
    };
    const txt = (s: string, x: number, yy: number, opts?: any) => doc.text(s, x, yy, opts);
    const ln = (x1: number, y1: number, x2: number, y2: number, clr = C.border) => {
      doc.setDrawColor(...clr); doc.line(x1, y1, x2, y2);
    };
    const rect = (x: number, yy: number, w: number, h: number, clr: number[]) => {
      doc.setFillColor(...clr as [number, number, number]); doc.rect(x, yy, w, h, "F");
    };
    const checkPage = (need: number) => {
      if (y + need > PH - 18) { addFooter(); doc.addPage(); y = addHeader(false); }
    };

    // ── Header bar (reused on each page) ────────────────────────────────────
    // Header bar
    const addHeader = (firstPage: boolean): number => {
      void firstPage;
      const HH = 30;
      const R = 4;

      // Single rounded background
      doc.setFillColor(...C.headerBg as [number, number, number]);
      doc.roundedRect(0, 0, PW, HH, R, R, "F");
      // Fill bottom half flush (square corners at bottom)
      doc.setFillColor(...C.headerBg as [number, number, number]);
      doc.rect(0, HH / 2, PW, HH / 2, "F");

      // LEFT: Zhivam-white logo (black bg removed)
      const logoH = 10;
      const logoAR = 2160 / 579;
      const logoW = logoH * logoAR;
      if ((addHeader as any)._logoB64) {
        try { doc.addImage((addHeader as any)._logoB64, "PNG", ML, (HH - logoH) / 2 - 2, logoW, logoH); } catch { /* skip */ }
      }
      setFont("normal", 6.5, [148, 163, 184]);
      txt("www.zhivam.com  |  info@zhivam.com  |  +91-8333 85 0202", ML, (HH - logoH) / 2 + logoH + 2.5);

      // RIGHT: ZHeat title aligned to right edge
      const now = new Date();
      const ds = now.toLocaleDateString("en-IN") + ", " + now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setFont("bold", 13, C.white);
      txt("ZHeat", PW - MR, 11, { align: "right" });
      setFont("normal", 7, [196, 220, 255]);
      txt("Heatsink Analyser v1.0", PW - MR, 18, { align: "right" });
      setFont("normal", 6.5, [148, 163, 184]);
      txt(ds, PW - MR, 24, { align: "right" });

      return HH + 6;
    };

    // ── Footer bar ──────────────────────────────────────────────────────────
    const addFooter = () => {
      const fy = PH - 8;
      ln(ML, fy - 2, PW - MR, fy - 2);
      setFont("normal", 6, C.textLight);
      txt("www.zhivam.com  |  info@zhivam.com  |  +91-8333 85 0202", ML, fy);
      txt(`Page ${doc.getCurrentPageInfo().pageNumber}`, PW - MR, fy, { align: "right" });
    };

    // ── Section heading ──────────────────────────────────────────────────────
    const sectionHead = (label: string) => {
      checkPage(14);
      rect(ML, y, CT, 7, C.rowDark);
      setFont("bold", 8, C.white);
      txt(label, ML + 3, y + 5);
      y += 9;
    };

    // ── Two-column table row ─────────────────────────────────────────────────
    let rowIdx = 0;
    const trow = (label: string, val: string, unit: string, startFresh?: boolean) => {
      if (startFresh !== undefined) rowIdx = startFresh ? 0 : rowIdx;
      checkPage(7);
      const isEven = rowIdx % 2 === 0;
      if (!isEven) rect(ML, y, CT, 6.5, C.rowLight);
      setFont("normal", 8, C.textLight);
      txt(label, ML + 3, y + 4.5);
      setFont("bold", 8, C.text);
      txt(val, PW - MR - 22, y + 4.5, { align: "right" });
      setFont("normal", 7.5, C.textLight);
      txt(unit, PW - MR - 1, y + 4.5, { align: "right" });
      y += 6.5; rowIdx++;
    };

    // ── Code block ──────────────────────────────────────────────────────────
    const codeBlock = (title: string, code: string, desc: string) => {
      checkPage(24);
      rect(ML, y, CT, 22, [248, 250, 252]);
      doc.setDrawColor(...C.border); doc.rect(ML, y, CT, 22, "S");
      // left accent bar
      rect(ML, y, 3, 22, C.accentBlue);
      setFont("bold", 7.5, C.accentBlue);
      txt(title, ML + 5, y + 5);
      doc.setFont("courier", "bold"); doc.setFontSize(7.5); doc.setTextColor(...C.text);
      txt(code, ML + 5, y + 10);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...C.textLight);
      // wrap desc
      const lines = doc.splitTextToSize(desc, CT - 8);
      doc.text(lines, ML + 5, y + 15.5);
      y += 24;
    };

    // ── Pre-load zhivam-white.png, remove black bg -> transparent ────────────
    await new Promise<void>(resolve => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        const octx = c.getContext("2d")!;
        octx.drawImage(img, 0, 0);
        // Remove near-black pixels (background) -> transparent
        const id = octx.getImageData(0, 0, c.width, c.height);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i] < 40 && d[i + 1] < 40 && d[i + 2] < 40) d[i + 3] = 0;
        }
        octx.putImageData(id, 0, 0);
        try { (addHeader as any)._logoB64 = c.toDataURL("image/png"); } catch { }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = "/images/zhivam-white.png";
    });

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 1
    // ════════════════════════════════════════════════════════════════════════
    y = addHeader(true);

    // ── Report title banner ──────────────────────────────────────────────────
    rect(ML, y, CT, 11, [241, 245, 249]);
    doc.setDrawColor(...C.border); doc.rect(ML, y, CT, 11, "S");
    rect(ML, y, 4, 11, C.accentBlue);
    setFont("bold", 10, C.text);
    txt("HEATSINK THERMAL & GEOMETRIC ANALYSIS REPORT", ML + 8, y + 7);
    y += 15;

    // ── Section 1 -- Design Input ─────────────────────────────────────────────
    rowIdx = 0;
    sectionHead("1. Design Input Parameters");
    const finLabel: Record<string, string> = {
      "longitudinal": "longitudinal", "pin-inline": "pin inline", "pin-staggered": "pin staggered",
      "conical-inline": "conical inline", "conical-staggered": "conical staggered",
      "polygon-inline": "polygon inline", "polygon-staggered": "polygon staggered"
    };
    trow("Fin Type", finLabel[r.type] || r.type, "", true);
    trow("Base Length x Width x Total Height", `${r.L_mm} x ${r.W_mm} x ${r.TH_mm}`, "mm");
    trow("Base Plate Thickness", String(r.BH_mm), "mm");
    trow("Fin / Pin Height", String(r.FH_mm), "mm");
    if (r.type === "longitudinal" || r.type.startsWith("polygon")) {
      trow("Fin Thickness", String(r.FT_mm), "mm");
    } else {
      trow("Pin Diameter", String(r.PD_mm), "mm");
    }
    trow("Taper Ratio (tip / base)", r.taper.toFixed(2), "--");
    trow("Number of Fins / Pins", String(r.Nfins), "--");
    trow("Material", r.matTxt, "");
    trow("Thermal Conductivity k", String(r.k), "W/m K");
    y += 4;

    // ── Section 2 -- Thermal Boundary ────────────────────────────────────────
    rowIdx = 0;
    sectionHead("2. Thermal Boundary Conditions");
    trow("Heat Input Q", String(r.Q), "W", true);
    trow("Ambient Temperature T-inf", String(r.Ta), "°C");
    trow("Convective Heat Transfer Coefficient h", String(r.h), "W/m²·K");
    if (r.radEnabled) {
      trow("Radiation Emissivity eps", r.emis.toFixed(2), "--");
      trow("Radiation Reference Temperature", r.Tr_C.toFixed(1), "°C");
    }
    y += 4;

    // ── Section 3 -- Canvas views ─────────────────────────────────────────────
    sectionHead("3. Design Preview (Canvas Views)");
    const canvasRefs = [cvTRef, cvFRef, cvIRef];
    const canvasLabels = ["Top View (X-Y)", "Front View (X-Z)", "3D Isometric"];
    const cw = (CT - 6) / 3;
    const ch = cw * 0.7;
    checkPage(ch + 18);

    canvasRefs.forEach((ref, i) => {
      const cx = ML + i * (cw + 3);
      rect(cx, y, cw, ch, [255, 255, 255]);
      doc.setDrawColor(...C.border); doc.rect(cx, y, cw, ch, "S");
      if (ref.current) {
        try {
          // Composite onto white background for light-theme PDF
          const offscreen = document.createElement("canvas");
          offscreen.width = ref.current.width;
          offscreen.height = ref.current.height;
          const octx = offscreen.getContext("2d")!;
          octx.fillStyle = "#ffffff";
          octx.fillRect(0, 0, offscreen.width, offscreen.height);
          octx.drawImage(ref.current, 0, 0);
          const dataUrl = offscreen.toDataURL("image/png");
          doc.addImage(dataUrl, "PNG", cx + 1, y + 1, cw - 2, ch - 2);
        } catch { /* canvas tainted or unavailable */ }
      }
      setFont("normal", 6.5, C.textLight);
      txt(canvasLabels[i], cx + cw / 2, y + ch + 4.5, { align: "center" });
    });
    y += ch + 8;

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 2  (Governing Equations)
    // ════════════════════════════════════════════════════════════════════════
    addFooter(); doc.addPage(); y = addHeader(false);

    // ── Section 4 -- Governing Equations ─────────────────────────────────────
    sectionHead("4. Governing Equations");
    y += 1;

    codeBlock(
      "4.1 Fin Parameter  m  [1/m]",
      "m = sqrt( h x P / k x Ac )",
      "P = fin perimeter [m], Ac = cross-sectional area [m²], k = thermal conductivity [W/m·K], h = convective coefficient [W/m²·K]"
    );
    y += 2;
    codeBlock(
      "4.2 Corrected Fin Length  Lc  [m]  (adiabatic tip)",
      "Lc = L + Ac / P",
      "Extends fin length fictitiously to account for tip convection without imposing a separate tip boundary condition."
    );
    y += 2;
    codeBlock(
      "4.3 Fin Efficiency  eta  [-]",
      "eta = tanh(m x Lc) / (m x Lc)",
      "Ratio of actual fin heat transfer to maximum possible transfer if entire fin were at base temperature Tb."
    );
    y += 2;
    codeBlock(
      "4.4 Fin Effectiveness  eps  [-]",
      "eps = sqrt(k x P / h x Ac) x tanh(m x L)",
      "Ratio of fin heat transfer to heat transfer from same base area without the fin.  eps > 2 is required to justify fin use."
    );
    y += 2;
    codeBlock(
      "4.5 Overall Surface Efficiency  eta0  [-]",
      "eta0 = 1 - (N x Afin / Atotal) x (1 - eta)",
      "N = number of fins, Afin = one fin surface area, Atotal = NxAfin + exposed base area. Used in overall Q calculation."
    );
    y += 2;
    codeBlock(
      "4.6 Temperature Distribution Along Fin",
      "T(x) - Tinf = (Tb - Tinf) x cosh[m(L-x)] / cosh(mL)",
      "Tip temperature: Ttip = Tinf + (Tb - Tinf) / cosh(mL). Insulated tip assumption; Lc correction applied in practice."
    );
    y += 2;
    codeBlock(
      "4.7 Overall Convective Thermal Resistance  Rth  [°C/W]",
      "Rth = 1 / ( h x eta0 x Atotal )",
      "Base temperature: Tb = Tinf + Q x Rth.  Minimising Rth is the primary objective of heatsink design optimisation."
    );
    y += 2;
    codeBlock(
      "4.8 Volume -- Longitudinal / Prismatoid Fin",
      "V = L x W x (t_base + t_tip) / 2 x Nfins  +  Lbase x Wbase x t_base",
      "Tapered fin volume uses prismatoid formula (average of base and tip cross-sections x height)."
    );
    y += 2;
    codeBlock(
      "4.9 Volume -- Conical / Frustum Pin  [m3]",
      "V = (pi x h / 3) x (R2 + R x r + r2)  per pin",
      "R = base radius, r = tip radius = R x taper.  Applies to circular pin fins and conical fin arrays."
    );

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3  -- Results + Assessment
    // ════════════════════════════════════════════════════════════════════════
    addFooter(); doc.addPage(); y = addHeader(false);

    // ── Section 5 -- Results ──────────────────────────────────────────────────
    rowIdx = 0;
    sectionHead("5. Computed Results");
    trow("Fin Efficiency eta (%)", r.eta.toFixed(2) + "%", "--", true);
    trow("Overall Surface Efficiency eta0 (%)", r.eta0.toFixed(2) + "%", "--");
    trow("Fin Effectiveness eps", r.eps.toFixed(3), "--");
    trow("mL parameter", r.mL.toFixed(4), "--");
    trow("m (fin parameter)", r.m.toExponential(3), "1/m");
    trow("Base Temperature Tb", r.Tbase.toFixed(2), "°C");
    trow("Fin Tip Temperature Ttip", r.Ttip.toFixed(2), "°C");
    trow("DeltaT Base minus Ambient", (r.Tbase - r.Ta).toFixed(2), "°C");
    trow("DeltaT Tip minus Ambient", (r.Ttip - r.Ta).toFixed(2), "°C");
    trow("Total Convection Surface Atotal", r.Atot.toFixed(3), "cm²");
    trow("Fin Surface Area Afin", r.Afintot.toFixed(3), "cm²");
    trow("Exposed Base Area", r.Abase_exp.toFixed(3), "cm²");
    trow("Total Heatsink Volume", r.Vtot.toFixed(4), "cm³");
    trow("Convective Resistance Rth", r.R.toFixed(5), "°C/W");
    trow("Base Heat Flux", r.flux.toFixed(4), "W/cm²");
    if (r.radEnabled) {
      trow("Radiation Heat Transfer Coefficient hr", r.hr.toFixed(3), "W/m²·K");
      trow("Radiation Heat Dissipated Qrad", r.Qrad.toFixed(3), "W");
      trow("Effective h (conv + rad)", r.heff.toFixed(3), "W/m²·K");
      trow("Effective Thermal Resistance Rth", r.R_eff.toFixed(5), "°C/W");
    }
    y += 6;

    // ── Section 6 -- Assessment ───────────────────────────────────────────────
    sectionHead("6. Design Assessment (Convection Only)");
    y += 3;
    const assessLines = [
      `Fin Efficiency (eta = ${r.eta.toFixed(1)}%): ${r.eta >= 85 ? "SATISFACTORY - fins are effectively utilising the material." : "REVIEW - consider reducing fin height or increasing conductivity."}`,
      `Fin Effectiveness (eps = ${r.eps.toFixed(2)}): ${r.eps >= 2 ? "JUSTIFIED - fin addition provides meaningful enhancement over the bare base." : "MARGINAL - effectiveness below 2; fins may not be worthwhile."}`,
      `Overall Surface Efficiency (eta0 = ${r.eta0.toFixed(1)}%): ${r.eta0 >= 80 ? "HIGH - fin-base assembly is performing efficiently." : "MODERATE - consider design adjustments."}`,
      `Temperatures: Tb = ${r.Tbase.toFixed(1)} °C, Ttip = ${r.Ttip.toFixed(1)} °C, DeltaT across fin = ${(r.Tbase - r.Ttip).toFixed(1)} °C.`,
      `Surface: ${r.Atot.toFixed(1)} cm² total with ${r.Nfins} fin(s)/pin(s). Fin fraction = ${Math.round(r.Afintot / r.Atot * 100)}%. Volume = ${r.Vtot.toFixed(2)} cm³.`,
    ];
    assessLines.forEach(line => {
      checkPage(8);
      setFont("normal", 7.5, C.text);
      const wrapped = doc.splitTextToSize(line, CT - 4);
      doc.text(wrapped, ML + 3, y);
      y += wrapped.length * 5 + 2;
    });

    y += 8;
    // ── Developer credit box ─────────────────────────────────────────────────
    checkPage(22);
    rect(ML, y, CT, 22, [241, 245, 249]);
    doc.setDrawColor(...C.border); doc.rect(ML, y, CT, 22, "S");
    rect(ML, y, 4, 22, C.accentBlue);
    setFont("bold", 8, C.text);
    txt("DEVELOPED BY", ML + 8, y + 6);
    setFont("bold", 8, C.text);
    txt("Dr. S. Manikandan & Dr. K. Anusuya", ML + 8, y + 13);
    setFont("bold", 7, C.textLight);
    const deptLines = doc.splitTextToSize("Zhivam Pvt. Ltd.", CT - 12);
    doc.text(deptLines, ML + 8, y + 19.5);
    // txt("Kattakulathur, Chengalpattu, Tamil Nadu, India", ML + 8, y + 25);
    y += 32;

    // ── Final footer ─────────────────────────────────────────────────────────
    addFooter();

    // ── Save ─────────────────────────────────────────────────────────────────
    const fname = `ZHeat_Report_${r.type}_${r.L_mm}x${r.W_mm}.pdf`;
    doc.save(fname);
  };

  // ─── Input field style helpers ───────────────────────────────────────────
  const inputCls = "w-full bg-slate-900/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-3 py-2 rounded-lg outline-none focus:border-cyan-500/60 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.08)] transition-all placeholder-slate-600";
  const selectCls = "w-full bg-slate-900/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-3 py-2 rounded-lg outline-none focus:border-cyan-500/60 transition-all cursor-pointer";
  const labelCls = "block text-xs font-medium text-slate-400 mb-1.5";

  const r = S.res;

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans" style={{ backgroundImage: "linear-gradient(rgba(6,182,212,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.03) 1px,transparent 1px)", backgroundSize: "48px 48px" }}>

      {/* ── Custom Theme Scrollbar CSS ── */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6,182,212,0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6,182,212,0.4); }
        
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #080c14; border-left: 1px solid rgba(100,116,139,0.1); }
        ::-webkit-scrollbar-thumb { background: rgba(6,182,212,0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(6,182,212,0.4); }
      `}} />

      {/* LOADER */}
      {showLoader && (
        <div className="fixed inset-0 bg-[#080c14]/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center gap-4">
          <div className="w-11 h-11 rounded-full border-[3px] border-slate-700 border-t-cyan-400 animate-spin" />
          <span className="font-mono text-xs text-cyan-400 tracking-[2px]">{loaderText}</span>
        </div>
      )}

      {/* ── Quote Request Modal ─────────────────────────────────────────── */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-[#0d1520] border border-slate-700/60 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/40">
              <div>
                <h2 className="text-base font-bold text-white">Request Manufacturing Quote</h2>
                <p className="text-xs text-slate-400 mt-0.5">Fin geometry auto-filled from your analysis</p>
              </div>
              <button onClick={() => setShowQuoteModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {quoteSent ? (
              <div className="flex flex-col items-center justify-center gap-4 py-14 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
                <h3 className="text-lg font-bold text-white">Quote Request Submitted!</h3>
                <p className="text-sm text-slate-400 max-w-xs">Thank you! Our team at Zhivam will review your fin geometry and get back to you within 1–2 business days.</p>
                <button onClick={() => setShowQuoteModal(false)} className="mt-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm rounded-xl transition-all">
                  Close
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {/* Fin geometry summary */}
                {S.res && (
                  <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-3 text-xs space-y-1">
                    <div className="text-cyan-400 font-semibold text-[10px] uppercase tracking-wider mb-2">Fin Geometry Summary</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-slate-300">
                      <span className="text-slate-500">Type:</span><span>{S.res.type.replace(/-/g, " ")}</span>
                      <span className="text-slate-500">Base:</span><span>{S.res.L_mm} × {S.res.W_mm} mm</span>
                      <span className="text-slate-500">Fin Height:</span><span>{S.res.FH_mm} mm</span>
                      <span className="text-slate-500">No. of Fins:</span><span>{S.res.Nfins}</span>
                      <span className="text-slate-500">Taper:</span><span>{S.res.taper.toFixed(2)}</span>
                      <span className="text-slate-500">Material:</span><span>{S.res.matTxt.split(" --")[0]}</span>
                    </div>
                  </div>
                )}

                {/* Contact fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                    <input type="text" value={quoteForm.name} onChange={e => setQuoteForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Dr. John Smith" className="w-full bg-slate-900/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-3 py-2 rounded-lg outline-none focus:border-cyan-500/60 transition-all placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Email <span className="text-red-400">*</span></label>
                    <input type="email" value={quoteForm.email} onChange={e => setQuoteForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="you@company.com" className="w-full bg-slate-900/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-3 py-2 rounded-lg outline-none focus:border-cyan-500/60 transition-all placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Company / Institution <span className="text-red-400">*</span></label>
                    <input type="text" value={quoteForm.company} onChange={e => setQuoteForm(p => ({ ...p, company: e.target.value }))}
                      placeholder="ACME Corp" className="w-full bg-slate-900/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-3 py-2 rounded-lg outline-none focus:border-cyan-500/60 transition-all placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone <span className="text-red-400">*</span></label>
                    <input type="tel" value={quoteForm.phone} onChange={e => setQuoteForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 98765 43210" className="w-full bg-slate-900/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-3 py-2 rounded-lg outline-none focus:border-cyan-500/60 transition-all placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Quantity Required <span className="text-red-400">*</span></label>
                    <input type="number" value={quoteForm.qty} min="1" onChange={e => setQuoteForm(p => ({ ...p, qty: e.target.value }))}
                      className="w-full bg-slate-900/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-3 py-2 rounded-lg outline-none focus:border-cyan-500/60 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Surface Finish <span className="text-red-400">*</span></label>
                    <select value={quoteForm.finish} onChange={e => setQuoteForm(p => ({ ...p, finish: e.target.value }))}
                      className="w-full bg-slate-900/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-3 py-2 rounded-lg outline-none focus:border-cyan-500/60 transition-all cursor-pointer">
                      <option>As machined</option>
                      <option>Anodised (Type II)</option>
                      <option>Hard anodised (Type III)</option>
                      <option>Black anodised</option>
                      <option>Powder coated</option>
                      <option>Nickel plated</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Additional Requirements / Notes <span className="text-slate-600 text-[10px]">(optional)</span></label>
                  <textarea value={quoteForm.notes} onChange={e => setQuoteForm(p => ({ ...p, notes: e.target.value }))}
                    rows={3} placeholder="Tolerances, special requirements, application details..."
                    className="w-full bg-slate-900/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-3 py-2 rounded-lg outline-none focus:border-cyan-500/60 transition-all placeholder-slate-600 resize-none" />
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setShowQuoteModal(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500 rounded-xl text-sm font-semibold transition-all">
                    Cancel
                  </button>
                  <button onClick={async () => {
                    if (!quoteForm.name.trim() || !quoteForm.email.trim() || !quoteForm.company.trim() || !quoteForm.phone.trim() || !quoteForm.qty.trim()) {
                      alert("Please fill in all required fields (marked with *).");
                      return;
                    }
                    try {
                      const payload = {
                        id: `Q-${Date.now()}`,
                        submittedAt: new Date().toISOString(),
                        contact: { ...quoteForm },
                        geometry: S.res ? {
                          type: S.res.type, L_mm: S.res.L_mm, W_mm: S.res.W_mm,
                          TH_mm: S.res.TH_mm, BH_mm: S.res.BH_mm, FH_mm: S.res.FH_mm,
                          FT_mm: S.res.FT_mm, PD_mm: S.res.PD_mm, taper: S.res.taper,
                          Nfins: S.res.Nfins, material: S.res.matTxt, k: S.res.k,
                        } : null,
                        thermal: S.res ? {
                          Q: S.res.Q, h: S.res.h, Ta: S.res.Ta,
                          eta: S.res.eta, eps: S.res.eps, Tbase: S.res.Tbase,
                          Ttip: S.res.Ttip, R: S.res.R,
                        } : null,
                      };
                      const res = await fetch("/api/quote", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || "Submission failed");
                      setQuoteSent(true);
                    } catch (err: unknown) {
                      alert("Failed to submit quote. Please try again.\n" + (err instanceof Error ? err.message : ""));
                    }
                  }}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm rounded-xl transition-all shadow-[0_4px_16px_rgba(251,146,60,0.3)]">
                    Submit Quote Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Adding pt-24 here pushes the entire dashboard content down, out from under the floating global navbar */}
      <div className="flex flex-col lg:flex-row min-h-screen pt-24">

        {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
        {/* Reverted back to the continuous list view with sticky headers */}
        <aside className="w-full lg:w-[380px] lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto lg:sticky lg:top-24 border-r border-slate-700/40 bg-[#080c14] flex-shrink-0 custom-scrollbar">

          {/* Section 01 -- Base Plate */}
          <div className="sticky top-0 z-10 px-4 py-2.5 bg-[#0d1520] border-b border-slate-700/40 flex items-center gap-2.5">
            <span className="font-mono text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded tracking-[0.8px]">01</span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Base Plate Geometry</span>
          </div>
          <div className="p-4 border-b border-slate-700/30 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div><label className={labelCls}>Length <span className="float-right font-mono text-[10px] text-slate-500">mm</span></label>
                <input ref={bLRef} type="number" defaultValue="100" min="5" max="2000" step="1" onChange={lp} className={inputCls} /></div>
              <div><label className={labelCls}>Width <span className="float-right font-mono text-[10px] text-slate-500">mm</span></label>
                <input ref={bWRef} type="number" defaultValue="80" min="5" max="2000" step="1" onChange={lp} className={inputCls} /></div>
              <div><label className={labelCls}>Total H <span className="float-right font-mono text-[10px] text-slate-500">mm</span></label>
                <input ref={tHRef} type="number" defaultValue="45" min="5" max="500" step="1" onChange={lp} className={inputCls} /></div>
            </div>
            <div><label className={labelCls}>Base Plate Thickness <span className="float-right font-mono text-[10px] text-slate-500">mm</span></label>
              <input ref={bHRef} type="number" defaultValue="5" min="1" max="100" step="0.5" onChange={lp} className={inputCls} /></div>
            <div>
              <label className={labelCls}>Material <span className="float-right font-mono text-[10px] text-cyan-500/70">{kNote}</span></label>
              <select ref={matRef} className={selectCls} onChange={() => {
                const m = matRef.current;
                if (!m) return;
                const isCustom = m.value === "custom";
                setShowCustomK(isCustom);
                setKNote(isCustom ? "custom" : `k = ${m.value} W/m.K`);
              }}>
                <option value="205">Aluminium 6061-T6 -- 205 W/m.K</option>
                <option value="237">Aluminium 1050-H14 -- 237 W/m.K</option>
                <option value="160">Aluminium 6063-T5 -- 160 W/m.K</option>
                <option value="385">Copper Pure -- 385 W/m.K</option>
                <option value="401">Copper C110 -- 401 W/m.K</option>
                <option value="50">Carbon Steel -- 50 W/m.K</option>
                <option value="16">Stainless 316L -- 16 W/m.K</option>
                <option value="custom">Custom...</option>
              </select>
            </div>
            {showCustomK && (
              <div><label className={labelCls}>Custom k <span className="float-right font-mono text-[10px] text-slate-500">W/m.K</span></label>
                <input ref={ckRef} type="number" defaultValue="200" min="1" max="3000" step="1" className={inputCls} /></div>
            )}
          </div>

          {/* Section 02 -- Fin Config */}
          <div className="sticky top-[41px] z-10 px-4 py-2.5 bg-[#0d1520] border-b border-slate-700/40 flex items-center gap-2.5">
            <span className="font-mono text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded tracking-[0.8px]">02</span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Fin Configuration</span>
          </div>
          <div className="p-4 border-b border-slate-700/30 space-y-3">
            <div className="grid grid-cols-4 gap-1.5">
              {(["longitudinal", "pin-inline", "pin-staggered", "conical-inline", "conical-staggered", "polygon-inline", "polygon-staggered"] as FinType[]).map(type => (
                <button key={type} onClick={() => {
                  setS(prev => ({ ...prev, fin: type }));
                  setTimeout(lp, 10);
                }} className={`rounded-xl p-2 border transition-all duration-200 flex flex-col items-center gap-1 ${S.fin === type ? "border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_16px_rgba(6,182,212,0.15)]" : "border-slate-700/50 bg-slate-900/30 hover:border-cyan-500/20 hover:bg-slate-800/40"}`}>
                  {FinIcons[type]}
                  <span className="text-[9px] text-center leading-tight text-slate-400" style={{ fontSize: "9px" }}>{type.replace(/-/g, " ").replace("inline", "inline").replace("staggered", "stag.")}</span>
                </button>
              ))}
            </div>

            {/* Polygon cross-section */}
            {(S.fin === "polygon-inline" || S.fin === "polygon-staggered") && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Cross-Section Shape</label>
                <div className="flex flex-wrap gap-1.5">
                  {[[3, "△ Triangle"], [4, "□ Square"], [5, "Pentagon"], [6, "Hexagon"], [8, "Octagon"]].map(([n, label]) => (
                    <button key={n} onClick={() => setS(prev => ({ ...prev, poly: n as number }))}
                      className={`px-3 py-1 rounded-full text-[10px] font-mono border transition-all ${S.poly === n ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300" : "bg-slate-900/40 border-slate-700/50 text-slate-400 hover:border-cyan-500/20"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stagger offset */}
            {S.fin.includes("staggered") && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Row Offset</label>
                <div className="flex gap-2">
                  {(["half", "third"] as StagType[]).map(t => (
                    <button key={t} onClick={() => setS(prev => ({ ...prev, stag: t }))}
                      className={`px-3 py-1 rounded-full text-[10px] font-mono border transition-all ${S.stag === t ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300" : "bg-slate-900/40 border-slate-700/50 text-slate-400 hover:border-cyan-500/20"}`}>
                      {t === "half" ? "1/2 Pitch" : "1/3 Pitch"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 03 -- Fin Parameters */}
          <div className="px-4 py-2.5 bg-[#0d1520] border-b border-slate-700/40 flex items-center gap-2.5">
            <span className="font-mono text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded tracking-[0.8px]">03</span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Fin Parameters</span>
          </div>
          <div className="p-4 border-b border-slate-700/30 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><label className={labelCls}>Fin Height <span className="float-right font-mono text-[10px] text-slate-500">mm</span></label>
                <input ref={fHRef} type="number" defaultValue="38" min="1" max="500" step="0.5" onChange={lp} className={inputCls} /></div>
              <div>
                <label className={labelCls}>
                  {(S.fin.startsWith("pin") || S.fin.startsWith("conical")) ? "Pin/Inscribed Dia." : "Fin Thickness"}
                  <span className="float-right font-mono text-[10px] text-slate-500">mm</span>
                </label>
                <input ref={fTRef} type="number" defaultValue="2.0" min="0.1" max="100" step="0.1" onChange={lp} className={inputCls} />
              </div>
            </div>
            {(S.fin.startsWith("pin") || S.fin.startsWith("conical") || S.fin.startsWith("polygon")) && (
              <div><label className={labelCls}>Base Diameter (⌀) <span className="float-right font-mono text-[10px] text-slate-500">mm</span></label>
                <input ref={pDRef} type="number" defaultValue="5" min="0.5" max="100" step="0.5" onChange={lp} className={inputCls} /></div>
            )}
            <div>
              <label className={labelCls}>Taper Ratio (tip / base) <span className="float-right font-mono text-[10px] text-slate-500">1.0 = uniform</span></label>
              <div className="flex items-center gap-3">
                <input ref={taperRef} type="range" min="0.05" max="1.0" step="0.05" defaultValue="1.0" onChange={e => { setTaperVal(parseFloat(e.target.value).toFixed(2)); lp(); }} className="flex-1 accent-cyan-500 cursor-pointer" />
                <span className="font-mono text-sm font-bold text-cyan-400 min-w-[40px] text-right">{taperVal}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>
                  {(S.fin.startsWith("pin") || S.fin.startsWith("conical")) ? "Pins (along L)" : "No. of Fins (L)"}
                  <span className="float-right font-mono text-[10px] text-slate-500">--</span>
                </label>
                <input ref={nLRef} type="number" defaultValue="10" min="1" max="500" step="1" onChange={lp} className={inputCls} />
              </div>
              {(S.fin.startsWith("pin") || S.fin.startsWith("conical") || S.fin.startsWith("polygon")) && (
                <div><label className={labelCls}>No. of Fins (W) <span className="float-right font-mono text-[10px] text-slate-500">--</span></label>
                  <input ref={nWRef} type="number" defaultValue="8" min="1" max="500" step="1" onChange={lp} className={inputCls} /></div>
              )}
            </div>
            <div>
              <label className={labelCls}>Pitch (centre-to-centre) <span className="float-right font-mono text-[10px] text-cyan-500/70">{pitchNote}</span></label>
              <input ref={pitchRef} type="number" defaultValue="0" min="0" max="500" step="0.5" placeholder="0 = auto"
                onChange={e => setPitchNote(parseFloat(e.target.value) > 0 ? `${e.target.value}mm` : "auto")} className={inputCls} />
            </div>
          </div>

          {/* Section 04 -- Thermal */}
          <div className="px-4 py-2.5 bg-[#0d1520] border-b border-slate-700/40 flex items-center gap-2.5">
            <span className="font-mono text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded tracking-[0.8px]">04</span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Thermal Conditions</span>
          </div>
          <div className="p-4 border-b border-slate-700/30 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><label className={labelCls}>Heat Input Q <span className="float-right font-mono text-[10px] text-slate-500">W</span></label>
                <input ref={QRef} type="number" defaultValue="50" min="0.01" max="100000" step="1" className={inputCls} /></div>
              <div><label className={labelCls}>Ambient T∞ <span className="float-right font-mono text-[10px] text-slate-500"> °C</span></label>
                <input ref={TaRef} type="number" defaultValue="25" min="-60" max="300" step="1" className={inputCls} /></div>
            </div>
            <div><label className={labelCls}>Conv. Coefficient h <span className="float-right font-mono text-[10px] text-slate-500">W/m²·K</span></label>
              <input ref={hvRef} type="number" defaultValue="25" min="0.1" max="50000" step="1" className={inputCls} /></div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">Quick Presets</p>
              <div className="flex flex-wrap gap-1.5">
                {[["NC Air (~8)", 8], ["FC Air (~30)", 30], ["Fan (~120)", 120], ["Jet (~500)", 500], ["Liquid (~2k)", 2000]].map(([label, val]) => (
                  <button key={label} onClick={() => { if (hvRef.current) hvRef.current.value = String(val); }}
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-900/40 border border-slate-700/50 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400 transition-all">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 05 -- Radiation */}
          <div className="px-4 py-2.5 bg-[#0d1520] border-b border-slate-700/40 flex items-center gap-2.5">
            <span className="font-mono text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded tracking-[0.8px]">05</span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Radiation (Optional)</span>
          </div>
          <div className="p-4 border-b border-slate-700/30 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={radEnabled} onChange={e => setRadEnabled(e.target.checked)} className="w-4 h-4 accent-cyan-500 cursor-pointer rounded" />
              <span className="text-sm font-semibold text-slate-300">Enable Radiation Heat Transfer</span>
            </label>
            {radEnabled && (
              <div className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={labelCls}>Emissivity eps<sub>r</sub> <span className="float-right font-mono text-[10px] text-slate-500">0-1</span></label>
                    <input ref={emisRef} type="number" defaultValue="0.85" min="0.01" max="1.0" step="0.01" className={inputCls} /></div>
                  <div><label className={labelCls}>Radiation Sink T<sub>r</sub> <span className="float-right font-mono text-[10px] text-slate-500"> °C</span></label>
                    <input ref={TrRef} type="number" defaultValue="25" min="-273" max="2000" step="1" className={inputCls} /></div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">Surface Emissivity Presets</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[["Polished Al", 0.05], ["Anodised Al", 0.15], ["Oxidised Al", 0.70], ["Black Coat", 0.85], ["Flat Black", 0.95]].map(([label, val]) => (
                      <button key={label as string} onClick={() => { if (emisRef.current) emisRef.current.value = String(val); }}
                        className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-900/40 border border-slate-700/50 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400 transition-all text-center">
                        {label as string}<br /><span className="text-slate-600">~{val}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed">
                  <span className="text-cyan-400 font-semibold">Note:</span> Radiation is solved iteratively (Newton's method). T<sub>r</sub> is the mean radiant temperature of the surroundings.
                </div>
              </div>
            )}
          </div>

          {/* Compute & Export Actions */}
          <div className="p-4 space-y-3 mb-4">
            <button onClick={compute}
              className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-[0_4px_24px_rgba(6,182,212,0.3)] hover:shadow-[0_6px_32px_rgba(6,182,212,0.45)] hover:-translate-y-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              Compute Analysis
            </button>
            {errMsg && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 text-xs text-red-400">{errMsg}</div>
            )}
            <div className="flex gap-2">
              <button onClick={doSTL} className="flex-1 flex items-center justify-center gap-1.5 bg-transparent border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 rounded-xl px-3 py-2 text-xs font-semibold transition-all">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>STL
              </button>
              <button onClick={doOBJ} className="flex-1 flex items-center justify-center gap-1.5 bg-transparent border border-green-500/30 text-green-400 hover:bg-green-500/10 rounded-xl px-3 py-2 text-xs font-semibold transition-all">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>OBJ
              </button>
              <button onClick={doPDF} className="flex-1 flex items-center justify-center gap-1.5 bg-transparent border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 rounded-xl px-3 py-2 text-xs font-semibold transition-all">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>PDF
              </button>
              {/* <button onClick={doCSV} className="flex-1 flex items-center justify-center gap-1.5 bg-transparent border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-xl px-3 py-2 text-xs font-semibold transition-all">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" /></svg>CSV
              </button> */}
            </div>
            {/* Quote Request Button */}
            <button onClick={() => { if (!S.res) { alert("Please run Compute Analysis first."); return; } setQuoteSent(false); setShowQuoteModal(true); }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-[0_4px_24px_rgba(251,146,60,0.3)] hover:shadow-[0_6px_32px_rgba(251,146,60,0.45)] hover:-translate-y-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Request Manufacturing Quote
            </button>
          </div>
        </aside>

        {/* ── MAIN ────────────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-y-auto">

          {/* Canvas Preview - Applying overflow-hidden to the parent container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-[#080c14] border-b border-slate-700/30">
            {[{ id: "cvT", ref: cvTRef, label: "Top View (X-Y)" }, { id: "cvF", ref: cvFRef, label: "Front View (X-Z)" }, { id: "cvI", ref: cvIRef, label: "3D Isometric" }].map(({ ref, label }) => (
              <div key={label} className="bg-[#0d1520] border border-slate-700/50 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-2 p-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  <span className="font-mono text-[10px] tracking-[1px] text-slate-400 uppercase">{label}</span>
                </div>
                {/* ensuring canvas fills container properly without bleeding */}
                <div className="flex-1 w-full bg-[#080c14]">
                  <canvas ref={ref} width={340} height={220} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>

          {/* Results */}
          <div className="flex-1 p-4 md:p-6">
            {!r ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 text-center">
                <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                </div>
                <p className="text-slate-400 text-sm max-w-sm leading-relaxed">Configure all parameters in the sidebar, then click <span className="text-cyan-400 font-semibold">Compute Analysis</span> to view fin efficiency, effectiveness, surface areas, volume, and full thermal results.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Section header */}
                <div className="flex items-center gap-3 pb-3 border-b border-cyan-500/20">
                  <div className="w-8 h-0.5 bg-cyan-500 rounded-full" />
                  <span className="font-mono text-[10px] text-slate-400 tracking-[1.5px] uppercase">Thermal &amp; Geometric Results</span>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Fin Efficiency eta", val: r.eta.toFixed(1), unit: "%", color: "cyan", top: "border-t-cyan-500" },
                    { label: "Fin Effectiveness eps", val: r.eps.toFixed(2), unit: "dimensionless", color: "orange", top: "border-t-orange-500" },
                    { label: "Overall Surface Eff. eta₀", val: r.eta0.toFixed(1), unit: "%", color: "sky", top: "border-t-sky-500" },
                    { label: "Fin Tip Temperature", val: r.Ttip.toFixed(1), unit: " °C", color: "green", top: "border-t-green-500" },
                    { label: "Total Conv. Surface", val: r.Atot.toFixed(2), unit: "cm²", color: "cyan", top: "border-t-cyan-500" },
                    { label: "Fin Surface Area", val: r.Afintot.toFixed(2), unit: "cm²", color: "orange", top: "border-t-orange-500" },
                    { label: "Total Volume", val: r.Vtot.toFixed(3), unit: "cm³", color: "sky", top: "border-t-sky-500" },
                    { label: "Base Heat Flux", val: r.flux.toFixed(4), unit: "W/cm²", color: "green", top: "border-t-green-500" },
                    ...(r.radEnabled ? [
                      { label: "Radiation Heat Loss Q_rad", val: r.Qrad.toFixed(2), unit: "W", color: "red", top: "border-t-red-500" },
                      { label: "Effective Rad. Coeff. h_r", val: r.hr.toFixed(3), unit: "W/m²·K", color: "red", top: "border-t-red-500" },
                    ] : [])
                  ].map(kpi => (
                    <div key={kpi.label} className={`bg-[#0d1520] border border-slate-700/50 rounded-2xl p-4 border-t-2 ${kpi.top} hover:border-${kpi.color}-500/30 transition-all`}>
                      <div className="text-xs text-slate-400 mb-2">{kpi.label}</div>
                      <div className={`font-mono text-xl font-bold text-${kpi.color}-400 leading-none`}>{kpi.val}</div>
                      <div className="font-mono text-[10px] text-slate-500 mt-1">{kpi.unit}</div>
                    </div>
                  ))}
                </div>

                {/* Gauges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-4">
                    <div className="text-sm font-semibold text-slate-300 mb-3">
                      {r.radEnabled ? "Fin Efficiency eta (combined conv+rad)" : "Fin Efficiency eta (convection only)"}
                    </div>
                    <div className="bg-slate-800/60 rounded h-2.5 mb-2 overflow-hidden">
                      <div className="h-full rounded bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-700" style={{ width: `${Math.min(100, r.eta)}%` }} />
                    </div>
                    <div className="flex justify-between font-mono text-[11px] text-slate-500">
                      <span>0%</span><strong className="text-cyan-400">{r.eta.toFixed(1)}%</strong><span>100%</span>
                    </div>
                  </div>
                  <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-4">
                    <div className="text-sm font-semibold text-slate-300 mb-3">Fin Effectiveness eps (target &gt; 2)</div>
                    <div className="bg-slate-800/60 rounded h-2.5 mb-2 overflow-hidden">
                      <div className="h-full rounded bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-700" style={{ width: `${Math.min(100, (r.eps / 20) * 100)}%` }} />
                    </div>
                    <div className="flex justify-between font-mono text-[11px] text-slate-500">
                      <span>0</span><strong className="text-orange-400">{r.eps.toFixed(2)}</strong><span>20+</span>
                    </div>
                  </div>
                </div>

                {/* Temperature Profile */}
                <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl overflow-hidden">
                  <button onClick={() => { setShowTempProfile(p => { const next = !p; if (!next) return next; setTimeout(drawTempProfile, 50); return next; }) }
                  } className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-all">
                    <div className="flex items-center gap-2">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                      <span className="text-sm font-semibold text-slate-300">Temperature Profile Along Fin</span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" className={`transition-transform ${showTempProfile ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                  {showTempProfile && (
                    <div className="border-t border-slate-700/40 p-4">
                      <canvas ref={cvTempRef} width={560} height={220} className="w-full rounded-lg" />
                      <p className="text-[10px] text-slate-500 mt-2 text-center font-mono">T(x) = T∞ + (T_base − T∞) · cosh[m(L−x)] / cosh(mL) &nbsp;|&nbsp; Insulated tip approximation</p>
                    </div>
                  )}
                </div>

                {/* Optimization Suggestions */}
                <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <span className="text-sm font-semibold text-slate-300">Optimization Suggestions</span>
                  </div>
                  <div className="space-y-2">
                    {getOptimizationTips(r).map((tip, i) => (
                      <div key={i} className={`flex gap-2.5 p-3 rounded-xl text-xs leading-relaxed ${tip.level === "good" ? "bg-green-500/5 border border-green-500/20 text-green-300" : tip.level === "warn" ? "bg-amber-500/5 border border-amber-500/20 text-amber-300" : "bg-red-500/5 border border-red-500/20 text-red-300"}`}>
                        <span className="mt-0.5 flex-shrink-0">
                          {tip.level === "good" ? "✓" : tip.level === "warn" ? "⚠" : "✗"}
                        </span>
                        <span>{tip.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detail Table */}
                {/* Applied overflow-hidden here to ensure table borders don't bleed past the rounded corners */}
                <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="bg-[#0a1628] text-left px-4 py-2.5 font-mono text-[10px] tracking-[1px] text-slate-400 uppercase">Parameter</th>
                        <th className="bg-[#0a1628] text-right px-4 py-2.5 font-mono text-[10px] tracking-[1px] text-slate-400 uppercase">Value</th>
                        <th className="bg-[#0a1628] text-right px-4 py-2.5 font-mono text-[10px] tracking-[1px] text-slate-400 uppercase w-20">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { sec: "EFFICIENCY METRICS" },
                        { p: "Fin Efficiency eta", v: r.eta.toFixed(3), u: "%" },
                        { p: "Overall Surface Efficiency eta0", v: r.eta0.toFixed(3), u: "%" },
                        { p: "Fin Effectiveness eps", v: r.eps.toFixed(4), u: "--" },
                        { p: "mL parameter", v: r.mL.toFixed(5), u: "--" },
                        { p: "m (fin parameter)", v: r.m.toExponential(3), u: "m⁻¹" },
                        { sec: "TEMPERATURES" },
                        { p: "Base Temperature T_b", v: r.Tbase.toFixed(2), u: " °C" },
                        { p: "Fin Tip Temperature T_tip", v: r.Ttip.toFixed(2), u: " °C" },
                        { p: "ΔT Base - Ambient", v: (r.Tbase - r.Ta).toFixed(2), u: " °C" },
                        { p: "ΔT Tip - Ambient", v: (r.Ttip - r.Ta).toFixed(2), u: " °C" },
                        { sec: "SURFACE AREAS" },
                        { p: "Total Convection Area A_total", v: r.Atot.toFixed(3), u: "cm²" },
                        { p: "Fin Surface Area A_fin", v: r.Afintot.toFixed(3), u: "cm²" },
                        { p: "Exposed Base Area A_b", v: r.Abase_exp.toFixed(3), u: "cm²" },
                        { sec: "VOLUME & RESISTANCE" },
                        { p: "Total Heatsink Volume", v: r.Vtot.toFixed(4), u: "cm³" },
                        { p: "Convective Resistance Rθ", v: r.R.toFixed(5), u: " °C/W" },
                        { p: "Base Heat Flux", v: r.flux.toFixed(4), u: "W/cm²" },
                        { sec: "INPUT SUMMARY" },
                        { p: "Number of Fins / Pins", v: String(r.Nfins), u: "--" },
                        { p: "Heat Input Q", v: String(r.Q), u: "W" },
                        { p: "Conv. Coefficient h", v: String(r.h), u: "W/m²·K" },
                        { p: "Thermal Conductivity k", v: String(r.k), u: "W/m·K" },
                        { p: "Taper Ratio", v: r.taper.toFixed(2), u: "--" },
                        ...(r.radEnabled ? [
                          { sec: "RADIATION HEAT TRANSFER" },
                          { p: "Emissivity eps_r", v: r.emis.toFixed(3), u: "--" },
                          { p: "Radiation Sink T_r", v: r.Tr_C.toFixed(1), u: " °C" },
                          { p: "Radiation Heat Loss Q_rad", v: r.Qrad.toFixed(3), u: "W" },
                          { p: "Rad. fraction Q_rad/Q", v: ((r.Qrad / r.Q) * 100).toFixed(1), u: "%" },
                          { p: "Linearised Rad. Coeff. h_r", v: r.hr.toFixed(3), u: "W/m²·K" },
                          { p: "Effective h_eff = h + h_r", v: r.heff.toFixed(3), u: "W/m²·K" },
                          { p: "Effective Thermal Resistance R_eff", v: r.R_eff.toFixed(5), u: " °C/W" },
                          { p: "Convective Resistance R_conv", v: r.R.toFixed(5), u: " °C/W" },
                        ] : [])
                      ].map((row: any, i) =>
                        row.sec ? (
                          <tr key={i}>
                            <td colSpan={3} className="bg-cyan-500/5 text-cyan-500/70 font-mono text-[9px] tracking-[0.8px] font-bold px-4 py-1.5 uppercase border-t border-slate-700/40">{row.sec}</td>
                          </tr>
                        ) : (
                          <tr key={i} className="border-t border-slate-800/60 hover:bg-slate-800/20 transition-colors">
                            <td className="px-4 py-2 text-slate-400">{row.p}</td>
                            <td className="px-4 py-2 text-right font-mono text-cyan-400 font-semibold">{row.v}</td>
                            <td className="px-4 py-2 text-right font-mono text-slate-500 text-[10px]">{row.u}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Cleaned up FOOTER */}
      <footer className="bg-[#080c14] border-t border-slate-700/40 px-4 md:px-6 py-6 flex justify-end text-[11px]">
        <div className="space-y-1 text-right">
          <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Developed by</div>
          <div className="text-white font-semibold text-xs">Dr. S. Manikandan &amp; Dr. K. Anusuya</div>
          <div className="text-slate-400">© 2026 Zhivam Web. All rights reserved.</div>
          {/* <div className="text-slate-500">Kattankulathur, Tamil Nadu, India</div> */}
        </div>
      </footer>
    </div>
  );
}