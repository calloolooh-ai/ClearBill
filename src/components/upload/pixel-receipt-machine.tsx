"use client";

import { useEffect, useRef } from "react";

const P = 7;
const COLS = 24;
const ROWS = 30;

const INK = "#2b2118";
const MACHINE = "#f3e6c9";
const MACHINE_SHADE = "#e4d2ab";
const PAPER = "#fffaf1";
const MINT = "#3ddc97";
const CORAL = "#ff6b4a";
const YELLOW = "#ffc93c";
const SKY = "#5ac8fa";

interface PixelReceiptMachineProps {
  dragActive: boolean;
  celebrate: boolean;
}

export function PixelReceiptMachine({ dragActive, celebrate }: PixelReceiptMachineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const celebrateStart = useRef<number | null>(null);

  useEffect(() => {
    if (celebrate) celebrateStart.current = performance.now();
  }, [celebrate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.imageSmoothingEnabled = false;

    const start = performance.now();
    let raf = 0;

    function cell(x: number, y: number, w: number, h: number, color: string, alpha = 1) {
      ctx!.globalAlpha = alpha;
      ctx!.fillStyle = color;
      ctx!.fillRect(Math.round(x * P), Math.round(y * P), Math.round(w * P), Math.round(h * P));
      ctx!.globalAlpha = 1;
    }

    function sparkle(cx: number, cy: number, color: string, alpha: number) {
      cell(cx, cy - 1, 1, 3, color, alpha);
      cell(cx - 1, cy, 3, 1, color, alpha);
    }

    function draw(now: number) {
      const t = now - start;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const celebrating = celebrateStart.current !== null && now - celebrateStart.current < 950;
      if (celebrateStart.current !== null && now - celebrateStart.current >= 950) celebrateStart.current = null;
      const ct = celebrating ? now - celebrateStart.current! : 0;

      const ox = 4;
      const oy = 13;

      // --- machine body ---
      cell(ox, oy, 16, 13, INK);
      cell(ox + 1, oy + 1, 14, 11, MACHINE);
      cell(ox + 1, oy + 7, 14, 5, MACHINE_SHADE);

      // vents (retro dither stripes)
      for (let i = 0; i < 4; i++) {
        cell(ox + 2 + i * 1.6, oy + 8, 0.8, 2.5, INK, 0.35);
      }
      for (let i = 0; i < 4; i++) {
        cell(ox + 9.5 + i * 1.6, oy + 8, 0.8, 2.5, INK, 0.35);
      }

      // mini display
      const dispColor = celebrating ? MINT : dragActive ? SKY : "#c9bb9c";
      cell(ox + 5, oy + 3, 6, 2.6, INK);
      cell(ox + 5.4, oy + 3.4, 5.2, 1.8, "#1c150f");
      const dispPulse = 0.5 + Math.sin(t / (dragActive ? 90 : 500)) * 0.5;
      cell(ox + 5.8, oy + 3.9, 4.4 * (celebrating ? 1 : dispPulse), 0.9, dispColor);

      // LED
      const ledOn = celebrating
        ? Math.sin(t / 60) > 0
        : dragActive
          ? Math.sin(t / 130) > -0.2
          : Math.sin(t / 700) > 0.6;
      cell(ox + 13, oy + 2, 1.4, 1.4, INK);
      cell(ox + 13.2, oy + 2.2, 1, 1, ledOn ? (dragActive || celebrating ? MINT : YELLOW) : INK, ledOn ? 1 : 0.5);

      // slot
      cell(ox + 3.5, oy, 9, 1.2, INK);
      cell(ox + 4, oy + 0.2, 8, 0.8, "#1c150f");

      // --- paper feed ---
      const paperH = 7;
      let paperBottom: number;
      if (celebrating) {
        paperBottom = oy + 1 - (ct / 950) * 17;
      } else if (dragActive) {
        paperBottom = oy - 1 - Math.sin(t / 260) * 1;
      } else {
        paperBottom = oy + 1 - Math.sin(t / 900) * 0.7;
      }
      const paperTop = paperBottom - paperH;

      cell(ox + 4, paperTop, 8, paperH, INK);
      cell(ox + 4.7, paperTop + 0.7, 6.6, paperH - 1.4, PAPER);
      cell(ox + 5.5, paperTop + 1.6, 5, 0.6, MINT);
      cell(ox + 5.5, paperTop + 3, 3.4, 0.6, MINT);
      cell(ox + 5.5, paperTop + 4.4, 4.4, 0.6, "#d8c9a6");
      // torn zigzag top edge of paper
      for (let i = 0; i < 4; i++) {
        const zx = ox + 4.7 + i * 1.65;
        cell(zx, paperTop + (i % 2 === 0 ? 0.7 : 0), 1.65, i % 2 === 0 ? 0.7 : 1.4, PAPER);
      }

      // drop arrow above the paper
      const arrowBaseY = oy - paperH - 4 + Math.sin(t / (dragActive ? 180 : 550)) * 0.8;
      const arrowColor = dragActive ? CORAL : "#a8967a";
      cell(ox + 6.5, arrowBaseY, 3, 1, arrowColor);
      cell(ox + 7, arrowBaseY + 1, 2, 1, arrowColor);
      cell(ox + 7.5, arrowBaseY + 2, 1, 1, arrowColor);

      // sparkles while dragging
      if (dragActive) {
        const s1 = 0.5 + Math.sin(t / 150) * 0.5;
        const s2 = 0.5 + Math.sin(t / 150 + 2) * 0.5;
        sparkle(ox - 2, oy - 2, YELLOW, Math.max(0, s1));
        sparkle(ox + 18, oy + 1, SKY, Math.max(0, s2));
      }

      // confetti coins on success
      if (celebrating) {
        const colors = [CORAL, YELLOW, SKY, MINT];
        for (let i = 0; i < 7; i++) {
          const angle = (Math.PI * 2 * i) / 7 + 0.4;
          const dist = (ct / 950) * 10;
          const cx = ox + 8 + Math.cos(angle) * dist;
          const cy = oy - 4 + Math.sin(angle) * dist * 0.6 - (ct / 950) * 6;
          const alpha = 1 - ct / 950;
          cell(cx, cy, 1.1, 1.1, colors[i % colors.length], Math.max(0, alpha));
        }
      }

      // subtle CRT scanlines over the machine only
      const scanTop = Math.round((oy - paperH - 6) * P);
      const scanBottom = Math.round((oy + 13) * P);
      ctx!.globalAlpha = 0.05;
      ctx!.fillStyle = INK;
      for (let y = scanTop; y < scanBottom; y += 4) {
        ctx!.fillRect(Math.round((ox - 1) * P), y, Math.round(18 * P), 2);
      }
      ctx!.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [dragActive]);

  return (
    <canvas
      ref={canvasRef}
      width={COLS * P}
      height={ROWS * P}
      className="pointer-events-none select-none"
      style={{ width: COLS * P, height: ROWS * P }}
      aria-hidden="true"
    />
  );
}
