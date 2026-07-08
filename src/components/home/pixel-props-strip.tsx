"use client";

import { useEffect, useRef } from "react";

const P = 6;
const COLS = 120;
const ROWS = 17;

const INK = "#2b2118";
const CORAL = "#ff6b4a";
const MINT = "#3ddc97";
const MINT_DARK = "#28b47b";
const YELLOW = "#ffc93c";
const YELLOW_DARK = "#e0a920";
const SKY = "#5ac8fa";
const PAPER = "#fffaf1";
const BROWN = "#a8967a";
const GROUND = "#e4d2ab";

export function PixelPropsStrip() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const gy = 14;

    const DOLLAR_GLYPH = [
      "..#..",
      ".###.",
      "#.#..",
      "#.#..",
      ".###.",
      "..#.#",
      "..#.#",
      ".###.",
      "..#..",
    ];

    function dollarCoin(bx: number, bob: number) {
      const cy = gy - 7 + bob;

      cell(bx + 2, gy - 0.5, 8, 1, INK, 0.15);

      const outline = [
        [4, 4],
        [2, 8],
        [1, 10],
        [0, 12],
        [0, 12],
        [0, 12],
        [0, 12],
        [0, 12],
        [0, 12],
        [1, 10],
        [2, 8],
        [4, 4],
      ] as const;
      outline.forEach(([offset, width], i) => {
        cell(bx + offset, cy - 6 + i, width, 1, INK);
      });

      const inner = [
        [5, 2],
        [3, 6],
        [2, 8],
        [1, 10],
        [1, 10],
        [1, 10],
        [1, 10],
        [1, 10],
        [1, 10],
        [2, 8],
        [3, 6],
        [5, 2],
      ] as const;
      inner.forEach(([offset, width], i) => {
        cell(bx + offset, cy - 6 + i + 0.5, width, 1, i > 7 ? YELLOW_DARK : YELLOW);
      });

      DOLLAR_GLYPH.forEach((row, r) => {
        for (let c = 0; c < row.length; c++) {
          if (row[c] === "#") cell(bx + 3.5 + c, cy - 4 + r, 1, 1, INK);
        }
      });
    }

    function moneyTree(bx: number, sway: number) {
      const y = gy;
      cell(bx + 2, y - 1, 6, 1, INK);
      cell(bx + 2.5, y - 1.5, 5, 1, MINT_DARK);
      cell(bx + 4, y - 6, 2, 5, INK);
      cell(bx + 4.4, y - 6, 1.2, 5, BROWN);
      const cx = bx + 5 + sway;
      cell(cx - 4, gy - 11, 8, 5, INK);
      cell(cx - 3.4, gy - 10.6, 6.8, 4.2, MINT);
      cell(cx - 5, gy - 9, 2, 3, INK);
      cell(cx - 4.6, gy - 8.6, 1.2, 2.2, MINT);
      cell(cx + 3, gy - 9.5, 2, 3, INK);
      cell(cx + 3.4, gy - 9.1, 1.2, 2.2, MINT);
      cell(cx - 1.2, gy - 9.6, 1.4, 1.4, YELLOW);
      cell(cx + 1.2, gy - 8, 1.4, 1.4, YELLOW);
      cell(cx - 2.6, gy - 7.6, 1.2, 1.2, YELLOW);
    }

    function coinStack(bx: number, glint: number) {
      const coins = 4;
      for (let i = 0; i < coins; i++) {
        const y = gy - 1 - i * 2;
        cell(bx, y - 2, 10, 2, INK);
        cell(bx + 1, y - 1.7, 8, 1.4, YELLOW);
        cell(bx + 1, y - 0.6, 8, 0.6, YELLOW_DARK);
        cell(bx + 3, y - 1.3, 4, 0.6, YELLOW_DARK, 0.7);
      }
      cell(bx + 2, gy - 1 - (coins - 1) * 2 - 1.5, 1.2, 0.5, "#ffffff", glint);
    }

    function receiptRoll(bx: number, bob: number) {
      const y = gy + bob;
      cell(bx + 1, y - 1, 8, 1, INK);
      cell(bx + 1.5, y - 0.7, 7, 0.5, BROWN);
      cell(bx + 2, y - 9, 6, 8, INK);
      cell(bx + 2.6, y - 8.4, 4.8, 6.8, PAPER);
      cell(bx + 3.2, y - 7, 3.6, 0.6, MINT);
      cell(bx + 3.2, y - 5.6, 2.4, 0.6, MINT);
      cell(bx + 3.2, y - 4.2, 3.6, 0.6, "#d8c9a6");
      for (let i = 0; i < 3; i++) {
        cell(bx + 2.6 + i * 1.6, y - 9, 1.6, i % 2 === 0 ? 0.6 : 0, PAPER);
      }
    }

    function calculator(bx: number, blinkOn: boolean) {
      const y = gy - 9;
      cell(bx, y, 11, 9, INK);
      cell(bx + 1, y + 1, 9, 7, GROUND);
      cell(bx + 1.5, y + 1.5, 8, 2, INK);
      cell(bx + 2, y + 2, 7, 1.2, "#173d2c");
      cell(bx + 2.3, y + 2.2, blinkOn ? 3.2 : 2.4, 0.7, SKY);
      const btnColors = [CORAL, MINT, YELLOW, SKY];
      let ci = 0;
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 4; c++) {
          cell(bx + 1.8 + c * 2, y + 4 + r * 2, 1.3, 1.3, btnColors[ci % btnColors.length]);
          ci++;
        }
      }
    }

    function grassTuft(bx: number, tall: number) {
      cell(bx, gy - tall, 1, tall, MINT_DARK);
      cell(bx + 1, gy - tall - 1, 1, tall + 1, MINT);
      cell(bx + 2, gy - tall, 1, tall, MINT_DARK);
    }

    function draw(now: number) {
      const t = now - start;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      cell(0, gy, COLS, 1.4, INK, 0.16);

      const bob1 = Math.sin(t / 1400) * 0.4;
      const sway = Math.sin(t / 1600) * 0.6;
      const glint = 0.4 + Math.sin(t / 500) * 0.4;
      const bob2 = Math.sin(t / 1400 + 2) * 0.4;
      const blinkOn = Math.sin(t / 500) > 0;

      dollarCoin(3, bob1);
      grassTuft(17, 3);
      moneyTree(23, sway);
      grassTuft(44, 2);
      coinStack(51, Math.max(0, glint));
      grassTuft(65, 3.5);
      receiptRoll(73, bob2);
      grassTuft(85, 2.5);
      calculator(93, blinkOn);
      grassTuft(107, 3);

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={COLS * P}
      height={ROWS * P}
      className="mx-auto block max-w-full select-none"
      style={{ width: COLS * P, imageRendering: "pixelated" }}
      aria-hidden="true"
    />
  );
}
