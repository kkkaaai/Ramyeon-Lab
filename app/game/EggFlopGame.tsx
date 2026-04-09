"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────
const W = 480;
const H = 580;
const EGG_X = 110;
const EGG_HW = 18; // half-width
const EGG_HH = 24; // half-height
const GRAVITY = 0.48;
const FLAP_VY = -9;
const GAP = 170; // gap between chopsticks and bowl
const OBS_W = 76;
const BASE_SPEED = 2.8;
const GROUND_H = 32;
const MIN_TOP_H = 55; // minimum chopstick section height

type State = "idle" | "playing" | "dead";

interface Obstacle {
  x: number;
  topH: number; // height of chopstick section
  scored: boolean;
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────

function drawBackground(ctx: CanvasRenderingContext2D, frame: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#0f0805");
  grad.addColorStop(0.55, "#2d1509");
  grad.addColorStop(1, "#4a1e0d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Drifting steam wisps
  ctx.save();
  for (let i = 0; i < 10; i++) {
    const t = (frame * 0.7 + i * 149) % 400;
    const px = (i * 91 + Math.sin(t * 0.025) * 18 + 380) % W;
    const py = H + 40 - (t * 1.6) % (H + 100);
    const alpha = 0.025 + Math.sin(t * 0.02) * 0.015;
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.beginPath();
    ctx.arc(px, py, 9 + (i % 4) * 5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawGround(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#2e1a11";
  ctx.fillRect(0, H - GROUND_H, W, GROUND_H);
  ctx.fillStyle = "#4a2c1a";
  ctx.fillRect(0, H - GROUND_H, W, 7);
  // Grain marks
  ctx.strokeStyle = "#1a0e08";
  ctx.lineWidth = 1;
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 60, H - GROUND_H + 11);
    ctx.lineTo(i * 60 + 38, H - 5);
    ctx.stroke();
  }
}

function drawChopsticks(ctx: CanvasRenderingContext2D, x: number, h: number) {
  if (h <= 0) return;
  const s1x = x + OBS_W * 0.28;
  const s2x = x + OBS_W * 0.72;
  const sw = 9;

  function drawStick(sx: number) {
    const g = ctx.createLinearGradient(sx - sw / 2, 0, sx + sw / 2, 0);
    g.addColorStop(0, "#c8a060");
    g.addColorStop(0.45, "#e8c880");
    g.addColorStop(1, "#a07038");
    ctx.fillStyle = g;
    ctx.strokeStyle = "#2e1a11";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx - sw / 2, 0);
    ctx.lineTo(sx + sw / 2, 0);
    ctx.lineTo(sx + 3, h);
    ctx.lineTo(sx - 3, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Red lacquer band
    ctx.fillStyle = "#c0392b";
    ctx.fillRect(sx - sw / 2 - 1, 14, sw + 2, 7);
    ctx.strokeStyle = "#2e1a11";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sx - sw / 2 - 1, 14, sw + 2, 7);
  }

  ctx.save();
  drawStick(s1x);
  drawStick(s2x);

  // Holder bracket at ceiling
  ctx.fillStyle = "#7a3a10";
  ctx.strokeStyle = "#2e1a11";
  ctx.lineWidth = 2;
  ctx.fillRect(x + 10, 0, OBS_W - 20, 14);
  ctx.strokeRect(x + 10, 0, OBS_W - 20, 14);
  ctx.restore();
}

function drawRamenBowl(ctx: CanvasRenderingContext2D, x: number, startY: number) {
  const totalH = H - GROUND_H - startY;
  if (totalH <= 0) return;

  const noodleH = Math.min(48, totalH * 0.38);
  ctx.save();

  // Broth / noodle area
  ctx.fillStyle = "#b5471a";
  ctx.fillRect(x, startY, OBS_W, noodleH);

  // Noodle waves
  ctx.strokeStyle = "#e8c080";
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 4; i++) {
    const ny = startY + 7 + i * 11;
    if (ny < startY + noodleH - 5) {
      ctx.beginPath();
      ctx.moveTo(x + 4, ny);
      for (let wx = 0; wx + 16 < OBS_W - 8; wx += 16) {
        ctx.quadraticCurveTo(
          x + 4 + wx + 8,
          ny + (i % 2 === 0 ? -5 : 5),
          x + 4 + wx + 16,
          ny
        );
      }
      ctx.stroke();
    }
  }

  // Bowl brim
  ctx.fillStyle = "#8B2012";
  ctx.strokeStyle = "#2e1a11";
  ctx.lineWidth = 2.5;
  ctx.fillRect(x - 7, startY + noodleH - 5, OBS_W + 14, 17);
  ctx.strokeRect(x - 7, startY + noodleH - 5, OBS_W + 14, 17);

  // Bowl body
  const bodyTop = startY + noodleH + 12;
  const bodyH = totalH - noodleH - 12;
  if (bodyH > 0) {
    ctx.beginPath();
    ctx.moveTo(x - 7, bodyTop);
    ctx.lineTo(x + OBS_W + 7, bodyTop);
    ctx.lineTo(x + OBS_W - 3, bodyTop + bodyH);
    ctx.lineTo(x + 3, bodyTop + bodyH);
    ctx.closePath();
    ctx.fillStyle = "#c0392b";
    ctx.fill();
    ctx.strokeStyle = "#2e1a11";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Highlight strip
    ctx.fillStyle = "rgba(255,90,40,0.18)";
    ctx.fillRect(x - 5, bodyTop, 13, bodyH - 5);
  }
  ctx.restore();
}

function drawEgg(ctx: CanvasRenderingContext2D, x: number, y: number, vy: number) {
  const angle = Math.max(-0.38, Math.min(0.85, vy * 0.058));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Drop shadow
  ctx.beginPath();
  ctx.ellipse(4, 5, EGG_HW, EGG_HH, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fill();

  // Egg white
  ctx.beginPath();
  ctx.ellipse(0, 0, EGG_HW, EGG_HH, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#fff8f0";
  ctx.strokeStyle = "#2e1a11";
  ctx.lineWidth = 2.5;
  ctx.fill();
  ctx.stroke();

  // Yolk
  ctx.beginPath();
  ctx.arc(0, 7, 13, 0, Math.PI * 2);
  ctx.fillStyle = "#f7ca5e";
  ctx.strokeStyle = "#d4960e";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  // Yolk inner glow
  ctx.beginPath();
  ctx.arc(-3, 3, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,200,0.45)";
  ctx.fill();

  // Shell shine
  ctx.beginPath();
  ctx.ellipse(7, -12, 5, 3, -0.45, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fill();

  ctx.restore();
}

function drawScore(ctx: CanvasRenderingContext2D, score: number) {
  ctx.save();
  ctx.font = "20px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#2e1a11";
  ctx.strokeText(String(score), W / 2, 44);
  ctx.fillStyle = "#fff8f0";
  ctx.fillText(String(score), W / 2, 44);
  ctx.restore();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EggFlopGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game state lives in refs so the canvas loop always reads current values
  const stateRef = useRef<State>("idle");
  const eggYRef = useRef(H / 2);
  const eggVYRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const scoreRef = useRef(0);
  const frameRef = useRef(0);
  const nextSpawnFrameRef = useRef(120);
  const rafRef = useRef(0);

  // React state for UI (dashboard + overlays)
  const [uiState, setUiState] = useState<State>("idle");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [newRecord, setNewRecord] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("eggflop_best");
    if (saved) setBestScore(parseInt(saved, 10));
  }, []);

  const resetRefs = useCallback(() => {
    eggYRef.current = H / 2;
    eggVYRef.current = FLAP_VY;
    obstaclesRef.current = [];
    scoreRef.current = 0;
    frameRef.current = 0;
    nextSpawnFrameRef.current = 120;
    setScore(0);
    setNewRecord(false);
  }, []);

  const die = useCallback(() => {
    const cur = scoreRef.current;
    const prev = parseInt(localStorage.getItem("eggflop_best") || "0", 10);
    if (cur > prev) {
      localStorage.setItem("eggflop_best", String(cur));
      setBestScore(cur);
      setNewRecord(true);
    }
    stateRef.current = "dead";
    setUiState("dead");
  }, []);

  const flap = useCallback(() => {
    const s = stateRef.current;
    if (s === "idle") {
      resetRefs();
      stateRef.current = "playing";
      setUiState("playing");
    } else if (s === "playing") {
      eggVYRef.current = FLAP_VY;
    } else {
      // dead → back to idle title screen
      stateRef.current = "idle";
      setUiState("idle");
      eggYRef.current = H / 2;
      eggVYRef.current = 0;
    }
  }, [resetRefs]);

  // Keyboard input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "Enter") {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flap]);

  // Canvas game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function spawnObstacle() {
      const maxTop = H - GROUND_H - GAP - MIN_TOP_H;
      const topH = MIN_TOP_H + Math.random() * (maxTop - MIN_TOP_H);
      obstaclesRef.current.push({ x: W + 20, topH, scored: false });
    }

    function collidesWithObs(obs: Obstacle): boolean {
      const eL = EGG_X - EGG_HW + 5;
      const eR = EGG_X + EGG_HW - 5;
      const eT = eggYRef.current - EGG_HH + 5;
      const eB = eggYRef.current + EGG_HH - 5;
      const oL = obs.x - 6;
      const oR = obs.x + OBS_W + 6;
      if (eR < oL || eL > oR) return false;
      return eT < obs.topH || eB > obs.topH + GAP;
    }

    function loop() {
      const frame = ++frameRef.current;
      const state = stateRef.current;
      ctx.clearRect(0, 0, W, H);
      drawBackground(ctx, frame);

      if (state === "playing") {
        // Physics
        eggVYRef.current += GRAVITY;
        eggYRef.current += eggVYRef.current;

        const speed = BASE_SPEED + scoreRef.current * 0.07;

        // Spawn
        if (frame >= nextSpawnFrameRef.current) {
          spawnObstacle();
          const interval = Math.max(78, 128 - scoreRef.current * 2);
          nextSpawnFrameRef.current = frame + interval;
        }

        // Move + score obstacles
        obstaclesRef.current = obstaclesRef.current.filter((o) => o.x > -OBS_W - 30);
        for (const obs of obstaclesRef.current) {
          obs.x -= speed;
          if (!obs.scored && obs.x + OBS_W < EGG_X) {
            obs.scored = true;
            scoreRef.current++;
            setScore(scoreRef.current);
          }
        }

        // Boundary collision
        if (
          eggYRef.current + EGG_HH >= H - GROUND_H ||
          eggYRef.current - EGG_HH <= 0
        ) {
          eggYRef.current = Math.min(
            H - GROUND_H - EGG_HH,
            Math.max(EGG_HH, eggYRef.current)
          );
          die();
        }

        // Obstacle collision
        for (const obs of obstaclesRef.current) {
          if (collidesWithObs(obs)) {
            die();
            break;
          }
        }
      } else if (state === "idle") {
        eggYRef.current = H / 2 + Math.sin(frame * 0.045) * 14;
        eggVYRef.current = 0;
      }

      // Draw obstacles behind egg
      for (const obs of obstaclesRef.current) {
        drawChopsticks(ctx, obs.x, obs.topH);
        drawRamenBowl(ctx, obs.x, obs.topH + GAP);
      }

      drawGround(ctx);
      drawEgg(ctx, EGG_X, eggYRef.current, eggVYRef.current);

      if (state === "playing") drawScore(ctx, scoreRef.current);

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [die]);

  return (
    <div className="flex flex-col items-center gap-5">

      {/* ── Score dashboard ── */}
      <div className="flex gap-4 w-full max-w-[480px]">
        <div className="flex-1 bg-rl-yellow-light border-4 border-rl-border rounded-lg p-3 text-center shadow-pixel">
          <p className="font-pixel text-[8px] text-rl-text/60 mb-1">SCORE</p>
          <p className="font-pixel text-[22px] text-rl-text tabular-nums">{score}</p>
        </div>
        <div className="flex-1 bg-rl-yellow border-4 border-rl-border rounded-lg p-3 text-center shadow-pixel">
          <p className="font-pixel text-[8px] text-rl-text/60 mb-1">BEST</p>
          <p className="font-pixel text-[22px] text-rl-text tabular-nums">{bestScore}</p>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div
        className="relative border-4 border-rl-border rounded-xl overflow-hidden shadow-pixel-dark w-full max-w-[480px]"
        style={{ aspectRatio: `${W}/${H}` }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onClick={flap}
          onTouchStart={(e) => { e.preventDefault(); flap(); }}
          className="w-full h-full cursor-pointer block"
          style={{ touchAction: "none" }}
        />

        {/* Title overlay */}
        {uiState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/45 pointer-events-none">
            <p className="font-pixel text-[24px] text-rl-yellow drop-shadow-lg">EGG FLOP</p>
            <p className="font-pixel text-[8px] text-white text-center leading-[2.2] opacity-90">
              FLY THROUGH THE GAP<br />
              DODGE THE CHOPSTICKS<br />
              AVOID THE RAMEN BOWL<br />
              <br />
              SPACE / CLICK / TAP
            </p>
          </div>
        )}

        {/* Game over overlay */}
        {uiState === "dead" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/55 pointer-events-none">
            <p className="font-pixel text-[20px] text-rl-danger drop-shadow-lg">CRACKED!</p>
            <p className="font-pixel text-[10px] text-white text-center leading-[2.2]">
              SCORE: {score}
            </p>
            {newRecord && (
              <p className="font-pixel text-[9px] text-rl-yellow animate-pulse">
                NEW RECORD!
              </p>
            )}
            <p className="font-pixel text-[8px] text-white/65 text-center leading-[2.2] mt-1">
              SPACE / CLICK / TAP<br />TO RETRY
            </p>
          </div>
        )}
      </div>

      <p className="font-pixel text-[7px] text-rl-text/45 text-center tracking-wide">
        SPACE · CLICK · TAP TO FLOP
      </p>
    </div>
  );
}
