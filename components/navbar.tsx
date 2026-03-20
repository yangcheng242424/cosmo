"use client";

import { useAppStore } from "@/lib/store";

export function Navbar() {
  const { currentView, setView, progress } = useAppStore();

  const xpForNextLevel = progress.level * 100;
  const currentLevelXP = progress.xp - (progress.level - 1) * progress.level / 2 * 100;
  const xpProgress = Math.min(100, (currentLevelXP / xpForNextLevel) * 100);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-cosmic-600/30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => setView("home")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">🌌</span>
          <span className="text-xl font-bold gradient-text">CosmoLearn</span>
          <span className="text-sm text-cosmic-200 hidden sm:inline">宇宙学堂</span>
        </button>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setView("home")}
            className={`text-sm transition-colors ${
              currentView === "home" ? "text-nebula-400" : "text-cosmic-200 hover:text-white"
            }`}
          >
            首页
          </button>
          <button
            onClick={() => setView("dashboard")}
            className={`text-sm transition-colors ${
              currentView === "dashboard" ? "text-nebula-400" : "text-cosmic-200 hover:text-white"
            }`}
          >
            学习中心
          </button>

          {/* XP & Level indicator */}
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-cosmic-600/30">
            <div className="flex items-center gap-1">
              <span className="text-star-400 text-sm font-bold">Lv.{progress.level}</span>
            </div>
            <div className="w-20 h-2 bg-cosmic-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-nebula-500 to-aurora-500 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <span className="text-xs text-cosmic-300">{progress.xp} XP</span>
            <div className="flex items-center gap-1 text-nova-400">
              <span className="text-sm">🔥</span>
              <span className="text-sm font-bold">{progress.streak}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
