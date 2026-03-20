"use client";

import { useAppStore, type Subject } from "@/lib/store";

export function SubjectSelector() {
  const { setSubject, setView } = useAppStore();

  const handleSelect = (subject: Subject) => {
    setSubject(subject);
    setView("dashboard");
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          <span className="gradient-text">选择你的学科</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <SubjectCard
            subject="math"
            icon="🧮"
            title="数学"
            subtitle="Mathematics"
            topics={["函数", "几何", "代数", "微积分", "概率统计"]}
            color="from-nebula-500/20 to-nebula-500/5"
            borderColor="border-nebula-500/30 hover:border-nebula-400/50"
            onClick={() => handleSelect("math")}
          />
          <SubjectCard
            subject="physics"
            icon="⚛️"
            title="物理"
            subtitle="Physics"
            topics={["力学", "电磁学", "热学", "波动与光学", "近代物理"]}
            color="from-aurora-500/20 to-aurora-500/5"
            borderColor="border-aurora-500/30 hover:border-aurora-400/50"
            onClick={() => handleSelect("physics")}
          />
        </div>
      </div>
    </section>
  );
}

function SubjectCard({
  icon,
  title,
  subtitle,
  topics,
  color,
  borderColor,
  onClick,
}: {
  subject: Subject;
  icon: string;
  title: string;
  subtitle: string;
  topics: string[];
  color: string;
  borderColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`glass rounded-2xl p-8 text-left transition-all hover:scale-[1.03] border ${borderColor} bg-gradient-to-br ${color}`}
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-cosmic-300 mb-4">{subtitle}</p>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span
            key={topic}
            className="text-xs px-2 py-1 rounded-full bg-cosmic-700/50 text-cosmic-200"
          >
            {topic}
          </span>
        ))}
      </div>
    </button>
  );
}
