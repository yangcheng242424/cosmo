"use client";

import { useAppStore } from "@/lib/store";

export function HeroSection() {
  const { setView } = useAppStore();

  return (
    <section className="relative pt-32 pb-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main heading */}
        <div className="animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">探索宇宙般的</span>
            <br />
            <span className="text-white">学习体验</span>
          </h1>
          <p className="text-xl text-cosmic-200 mb-4 max-w-2xl mx-auto">
            AI驱动的多Agent互动课堂，让高中数学和物理变得有趣、定制化
          </p>
          <p className="text-sm text-cosmic-300 mb-8 max-w-xl mx-auto">
            灵感源自清华大学 OpenMAIC 多Agent互动教室 — 苏格拉底式教学 · 个性化学习路径 · 游戏化激励
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <button
            onClick={() => setView("dashboard")}
            className="px-8 py-4 bg-gradient-to-r from-nebula-500 to-aurora-500 rounded-xl text-lg font-bold hover:opacity-90 transition-all hover:scale-105 animate-pulse-glow"
          >
            开始学习之旅 🚀
          </button>
          <button
            onClick={() => setView("dashboard")}
            className="px-8 py-4 glass rounded-xl text-lg font-medium hover:bg-cosmic-600/50 transition-all"
          >
            查看学习地图 🗺️
          </button>
        </div>

        {/* Features grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <FeatureCard
            icon="🧙‍♂️"
            title="多Agent课堂"
            description="AI老师讲解、AI助教辅导、AI同学讨论，模拟真实课堂体验"
          />
          <FeatureCard
            icon="🎯"
            title="个性化路径"
            description="智能知识图谱追踪掌握度，动态调整难度和学习路线"
          />
          <FeatureCard
            icon="🎮"
            title="游戏化学习"
            description="经验值、等级、成就、连续学习奖励，让学习像游戏一样上瘾"
          />
        </div>

        {/* Additional features */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 animate-slide-up"
          style={{ animationDelay: "0.6s" }}
        >
          <FeatureCard
            icon="🔬"
            title="互动模拟"
            description="物理实验可视化模拟，拖拽参数看现象变化"
          />
          <FeatureCard
            icon="💡"
            title="苏格拉底教学"
            description="从不直接给答案，通过提问引导你自己发现真理"
          />
          <FeatureCard
            icon="📊"
            title="智能题库"
            description="AI根据你的薄弱点生成针对性练习题"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="glass glass-hover rounded-2xl p-6 text-left transition-all hover:scale-[1.02] cursor-default">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-cosmic-200">{description}</p>
    </div>
  );
}
