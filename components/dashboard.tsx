"use client";

import { useAppStore } from "@/lib/store";
import { getAvailableTopics, getTopicCategories } from "@/lib/knowledge-graph";
import { getAgentsBySubject } from "@/lib/agents";
import type { TopicNode } from "@/lib/store";

export function Dashboard() {
  const {
    selectedSubject,
    setSubject,
    setTopic,
    setView,
    setActiveAgent,
    setClassroomMode,
    clearMessages,
    progress,
  } = useAppStore();

  const subject = selectedSubject || "math";
  const topics = getAvailableTopics(subject, progress.topicMastery);
  const categories = getTopicCategories(subject);
  const agents = getAgentsBySubject(subject);

  const handleTopicSelect = (topic: TopicNode) => {
    if (!topic.unlocked) return;
    setTopic(topic);
    setActiveAgent(agents.find((a) => a.role === "teacher") || agents[0]);
    setClassroomMode("lecture");
    clearMessages();
    setView("classroom");
  };

  const accuracy =
    progress.totalProblems > 0
      ? Math.round((progress.correctProblems / progress.totalProblems) * 100)
      : 0;

  const earnedAchievements = progress.achievements.filter((a) => a.earned);

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Subject Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSubject("math")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              subject === "math"
                ? "bg-gradient-to-r from-nebula-500 to-nebula-400 text-white"
                : "glass text-cosmic-200 hover:text-white"
            }`}
          >
            🧮 数学
          </button>
          <button
            onClick={() => setSubject("physics")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              subject === "physics"
                ? "bg-gradient-to-r from-aurora-500 to-aurora-400 text-white"
                : "glass text-cosmic-200 hover:text-white"
            }`}
          >
            ⚛️ 物理
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content: Knowledge Map */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">
              <span className="gradient-text">知识地图</span>
              <span className="text-sm text-cosmic-300 ml-3">
                完成前置知识点解锁新内容
              </span>
            </h2>

            {categories.map((category) => {
              const categoryTopics = topics.filter((t) => t.category === category);
              return (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-bold text-cosmic-100 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-nebula-400" />
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categoryTopics.map((topic) => (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        onClick={() => handleTopicSelect(topic)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar: Stats & Achievements */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">📊 学习统计</h3>
              <div className="grid grid-cols-2 gap-4">
                <StatItem label="等级" value={`Lv.${progress.level}`} color="text-star-400" />
                <StatItem label="经验值" value={`${progress.xp}`} color="text-nebula-400" />
                <StatItem label="连续天数" value={`${progress.streak}天`} color="text-nova-400" />
                <StatItem label="正确率" value={`${accuracy}%`} color="text-plasma-400" />
                <StatItem label="总做题数" value={`${progress.totalProblems}`} color="text-aurora-400" />
                <StatItem
                  label="学习时长"
                  value={`${progress.studyMinutes}分`}
                  color="text-cosmic-100"
                />
              </div>
            </div>

            {/* AI Tutors */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">🤖 AI教学团队</h3>
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-cosmic-700/30 hover:bg-cosmic-700/50 transition-colors"
                  >
                    <span className="text-2xl">{agent.avatar}</span>
                    <div>
                      <div className="text-sm font-bold">{agent.nameZh}</div>
                      <div className="text-xs text-cosmic-300">
                        {agent.role === "teacher"
                          ? "主讲老师"
                          : agent.role === "assistant"
                          ? "助教"
                          : "学习伙伴"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">
                🏆 成就 ({earnedAchievements.length}/{progress.achievements.length})
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {progress.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`relative group w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                      achievement.earned
                        ? "bg-cosmic-600/50 hover:scale-110"
                        : "bg-cosmic-700/30 opacity-40 grayscale"
                    }`}
                    title={`${achievement.nameZh}: ${achievement.description}`}
                  >
                    {achievement.icon}
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-cosmic-700 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="font-bold">{achievement.nameZh}</div>
                      <div className="text-cosmic-300">{achievement.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicCard({
  topic,
  onClick,
}: {
  topic: TopicNode;
  onClick: () => void;
}) {
  const difficultyStars = "★".repeat(topic.difficulty) + "☆".repeat(5 - topic.difficulty);

  return (
    <button
      onClick={onClick}
      disabled={!topic.unlocked}
      className={`text-left p-4 rounded-xl transition-all ${
        topic.unlocked
          ? "glass glass-hover hover:scale-[1.02] cursor-pointer"
          : "bg-cosmic-800/30 border border-cosmic-700/20 opacity-50 cursor-not-allowed"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-bold text-sm">{topic.nameZh}</div>
          <div className="text-xs text-cosmic-400">{topic.name}</div>
        </div>
        {!topic.unlocked && <span className="text-lg">🔒</span>}
        {topic.unlocked && topic.mastery >= 100 && <span className="text-lg">👑</span>}
      </div>

      {/* Difficulty */}
      <div className="text-xs text-star-400 mb-2">{difficultyStars}</div>

      {/* Mastery bar */}
      {topic.unlocked && (
        <div className="w-full h-1.5 bg-cosmic-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              topic.mastery >= 80
                ? "bg-plasma-400"
                : topic.mastery >= 40
                ? "bg-star-400"
                : "bg-nebula-400"
            }`}
            style={{ width: `${topic.mastery}%` }}
          />
        </div>
      )}
      {topic.unlocked && (
        <div className="text-xs text-cosmic-400 mt-1">掌握度: {topic.mastery}%</div>
      )}
    </button>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="text-center p-3 rounded-xl bg-cosmic-700/30">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-cosmic-300 mt-1">{label}</div>
    </div>
  );
}
