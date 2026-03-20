"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { TopicNode } from "@/lib/store";

interface SimulationConfig {
  title: string;
  description: string;
  parameters: {
    name: string;
    label: string;
    min: number;
    max: number;
    default: number;
    unit: string;
  }[];
  draw: (
    ctx: CanvasRenderingContext2D,
    params: Record<string, number>,
    time: number,
    width: number,
    height: number
  ) => void;
}

const SIMULATIONS: Record<string, SimulationConfig> = {
  p_kinematics: {
    title: "匀变速直线运动",
    description: "调整初速度和加速度，观察物体运动轨迹",
    parameters: [
      { name: "v0", label: "初速度", min: 0, max: 20, default: 5, unit: "m/s" },
      { name: "a", label: "加速度", min: -5, max: 5, default: 2, unit: "m/s²" },
    ],
    draw: (ctx, params, time, w, h) => {
      const { v0, a } = params;
      const t = (time / 1000) % 5;
      const x = v0 * t + 0.5 * a * t * t;
      const v = v0 + a * t;

      // Ground
      ctx.strokeStyle = "#4a4a8a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, h - 40);
      ctx.lineTo(w - 20, h - 40);
      ctx.stroke();

      // Tick marks
      ctx.fillStyle = "#6a6aaa";
      ctx.font = "10px monospace";
      for (let i = 0; i <= 10; i++) {
        const px = 20 + (i / 10) * (w - 40);
        ctx.beginPath();
        ctx.moveTo(px, h - 40);
        ctx.lineTo(px, h - 35);
        ctx.stroke();
        ctx.fillText(`${i * 5}m`, px - 8, h - 25);
      }

      // Object (ball)
      const normalizedX = Math.max(0, Math.min(1, x / 50));
      const ballX = 20 + normalizedX * (w - 40);
      const ballY = h - 55;

      // Trail
      ctx.strokeStyle = `rgba(139, 92, 246, 0.3)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let tt = 0; tt <= t; tt += 0.05) {
        const xx = v0 * tt + 0.5 * a * tt * tt;
        const nx = Math.max(0, Math.min(1, xx / 50));
        const px = 20 + nx * (w - 40);
        if (tt === 0) ctx.moveTo(px, ballY);
        else ctx.lineTo(px, ballY);
      }
      ctx.stroke();

      // Ball
      const gradient = ctx.createRadialGradient(ballX, ballY, 0, ballX, ballY, 12);
      gradient.addColorStop(0, "#a78bfa");
      gradient.addColorStop(1, "#8b5cf6");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(ballX, ballY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Velocity arrow
      const arrowLength = Math.min(Math.abs(v) * 4, 60);
      const arrowDir = v >= 0 ? 1 : -1;
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ballX, ballY - 20);
      ctx.lineTo(ballX + arrowLength * arrowDir, ballY - 20);
      ctx.stroke();
      // Arrowhead
      ctx.fillStyle = "#22d3ee";
      ctx.beginPath();
      ctx.moveTo(ballX + arrowLength * arrowDir, ballY - 20);
      ctx.lineTo(ballX + (arrowLength - 8) * arrowDir, ballY - 25);
      ctx.lineTo(ballX + (arrowLength - 8) * arrowDir, ballY - 15);
      ctx.fill();

      // Info display
      ctx.fillStyle = "#cacaee";
      ctx.font = "12px monospace";
      ctx.fillText(`t = ${t.toFixed(1)}s`, 20, 25);
      ctx.fillText(`v = ${v.toFixed(1)} m/s`, 20, 42);
      ctx.fillText(`x = ${x.toFixed(1)} m`, 20, 59);
      ctx.fillText(`v₀ = ${v0} m/s`, w - 110, 25);
      ctx.fillText(`a = ${a} m/s²`, w - 110, 42);
    },
  },

  p_projectile: {
    title: "抛体运动",
    description: "调整发射角度和初速度，观察抛物线轨迹",
    parameters: [
      { name: "v0", label: "初速度", min: 5, max: 30, default: 15, unit: "m/s" },
      { name: "angle", label: "发射角", min: 10, max: 80, default: 45, unit: "°" },
    ],
    draw: (ctx, params, time, w, h) => {
      const { v0, angle } = params;
      const rad = (angle * Math.PI) / 180;
      const vx = v0 * Math.cos(rad);
      const vy = v0 * Math.sin(rad);
      const g = 9.8;
      const totalTime = (2 * vy) / g;
      const t = ((time / 1000) % (totalTime + 1));
      const maxRange = (v0 * v0 * Math.sin(2 * rad)) / g;
      const maxHeight = (vy * vy) / (2 * g);
      const scale = Math.min((w - 80) / Math.max(maxRange, 1), (h - 100) / Math.max(maxHeight, 1)) * 0.8;

      // Ground
      ctx.strokeStyle = "#4a4a8a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, h - 40);
      ctx.lineTo(w - 20, h - 40);
      ctx.stroke();

      // Trajectory (full path)
      ctx.strokeStyle = "rgba(139, 92, 246, 0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let tt = 0; tt <= totalTime; tt += 0.02) {
        const px = 40 + vx * tt * scale;
        const py = h - 40 - (vy * tt - 0.5 * g * tt * tt) * scale;
        if (tt === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Current trail
      ctx.strokeStyle = "#8b5cf6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const currentT = Math.min(t, totalTime);
      for (let tt = 0; tt <= currentT; tt += 0.02) {
        const px = 40 + vx * tt * scale;
        const py = h - 40 - Math.max(0, vy * tt - 0.5 * g * tt * tt) * scale;
        if (tt === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Ball
      if (t <= totalTime) {
        const bx = 40 + vx * t * scale;
        const y = vy * t - 0.5 * g * t * t;
        const by = h - 40 - Math.max(0, y) * scale;
        const gradient = ctx.createRadialGradient(bx, by, 0, bx, by, 10);
        gradient.addColorStop(0, "#fcd34d");
        gradient.addColorStop(1, "#fbbf24");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bx, by, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // Info
      ctx.fillStyle = "#cacaee";
      ctx.font = "12px monospace";
      ctx.fillText(`最大高度: ${maxHeight.toFixed(1)}m`, 20, 25);
      ctx.fillText(`射程: ${maxRange.toFixed(1)}m`, 20, 42);
      ctx.fillText(`飞行时间: ${totalTime.toFixed(1)}s`, 20, 59);
    },
  },

  p_newton_laws: {
    title: "牛顿第二定律 F=ma",
    description: "调整力和质量，观察加速度变化",
    parameters: [
      { name: "F", label: "合力", min: 0, max: 50, default: 10, unit: "N" },
      { name: "m", label: "质量", min: 1, max: 20, default: 5, unit: "kg" },
    ],
    draw: (ctx, params, time, w, h) => {
      const { F, m } = params;
      const a = F / m;
      const t = (time / 1000) % 4;
      const x = 0.5 * a * t * t;

      // Ground
      ctx.strokeStyle = "#4a4a8a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, h - 40);
      ctx.lineTo(w - 20, h - 40);
      ctx.stroke();

      // Box
      const normalizedX = Math.min(1, x / 40);
      const boxX = 40 + normalizedX * (w - 120);
      const boxSize = 20 + m * 1.5;
      const boxY = h - 40 - boxSize;

      ctx.fillStyle = "#6a6aaa";
      ctx.fillRect(boxX - boxSize / 2, boxY, boxSize, boxSize);
      ctx.strokeStyle = "#9a9acc";
      ctx.strokeRect(boxX - boxSize / 2, boxY, boxSize, boxSize);

      // Mass label
      ctx.fillStyle = "white";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${m}kg`, boxX, boxY + boxSize / 2 + 4);
      ctx.textAlign = "start";

      // Force arrow
      if (F > 0) {
        const arrowLen = F * 2;
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(boxX + boxSize / 2, boxY + boxSize / 2);
        ctx.lineTo(boxX + boxSize / 2 + arrowLen, boxY + boxSize / 2);
        ctx.stroke();
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath();
        ctx.moveTo(boxX + boxSize / 2 + arrowLen + 8, boxY + boxSize / 2);
        ctx.lineTo(boxX + boxSize / 2 + arrowLen - 4, boxY + boxSize / 2 - 6);
        ctx.lineTo(boxX + boxSize / 2 + arrowLen - 4, boxY + boxSize / 2 + 6);
        ctx.fill();
        ctx.fillStyle = "#fb7185";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText(`F = ${F}N`, boxX + boxSize / 2 + arrowLen / 2 - 15, boxY + boxSize / 2 - 12);
      }

      // Info
      ctx.fillStyle = "#cacaee";
      ctx.font = "12px monospace";
      ctx.fillText(`a = F/m = ${a.toFixed(1)} m/s²`, 20, 25);
      ctx.fillText(`t = ${t.toFixed(1)}s`, 20, 42);
      ctx.fillText(`v = ${(a * t).toFixed(1)} m/s`, 20, 59);
    },
  },
};

// Default simulation for topics without custom ones
const DEFAULT_SIM: SimulationConfig = {
  title: "物理实验室",
  description: "选择一个力学知识点开始模拟实验",
  parameters: [
    { name: "param1", label: "参数1", min: 0, max: 100, default: 50, unit: "" },
  ],
  draw: (ctx, _params, time, w, h) => {
    ctx.fillStyle = "#cacaee";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🔬 该知识点的模拟实验正在开发中...", w / 2, h / 2 - 10);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#6a6aaa";
    ctx.fillText("试试运动学、抛体运动或牛顿定律的模拟", w / 2, h / 2 + 15);
    ctx.textAlign = "start";

    // Decorative particles
    for (let i = 0; i < 5; i++) {
      const angle = (time / 1000 + i * 1.2) % (Math.PI * 2);
      const radius = 50;
      const px = w / 2 + Math.cos(angle) * radius;
      const py = h / 2 + Math.sin(angle) * radius + 30;
      ctx.fillStyle = `rgba(139, 92, 246, ${0.3 + 0.2 * Math.sin(time / 500 + i)})`;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};

export function PhysicsSimulation({ topic }: { topic: TopicNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sim = SIMULATIONS[topic.id] || DEFAULT_SIM;
  const [params, setParams] = useState<Record<string, number>>(
    Object.fromEntries(sim.parameters.map((p) => [p.name, p.default]))
  );

  const drawFrame = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sim.draw(ctx, params, time, canvas.width, canvas.height);
    },
    [params, sim]
  );

  useEffect(() => {
    let animId: number;
    const animate = (time: number) => {
      drawFrame(time);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [drawFrame]);

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="text-sm font-bold mb-2">🔬 {sim.title}</h3>
      <p className="text-xs text-cosmic-300 mb-3">{sim.description}</p>

      <canvas
        ref={canvasRef}
        width={280}
        height={180}
        className="w-full rounded-xl bg-cosmic-900/50 mb-3"
      />

      {/* Parameter sliders */}
      <div className="space-y-3">
        {sim.parameters.map((param) => (
          <div key={param.name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-cosmic-200">{param.label}</span>
              <span className="text-nebula-300 font-mono">
                {params[param.name]} {param.unit}
              </span>
            </div>
            <input
              type="range"
              min={param.min}
              max={param.max}
              step={(param.max - param.min) / 100}
              value={params[param.name]}
              onChange={(e) =>
                setParams((prev) => ({ ...prev, [param.name]: Number(e.target.value) }))
              }
              className="w-full h-1.5 bg-cosmic-700 rounded-lg appearance-none cursor-pointer accent-nebula-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
