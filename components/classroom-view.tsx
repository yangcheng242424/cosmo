"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { getAgentsBySubject, getAgentById } from "@/lib/agents";
import { ChatMessage } from "./chat-message";
import { PhysicsSimulation } from "./physics-simulation";
import { QuizCard } from "./quiz-card";
import type { Message } from "@/lib/store";

export function ClassroomView() {
  const {
    selectedSubject,
    selectedTopic,
    messages,
    addMessage,
    isThinking,
    setIsThinking,
    setView,
    activeAgent,
    setActiveAgent,
    classroomMode,
    setClassroomMode,
    currentQuiz,
    setCurrentQuiz,
    addXP,
    incrementProblems,
    updateMastery,
  } = useAppStore();

  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const subject = selectedSubject || "math";
  const agents = getAgentsBySubject(subject);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Welcome message on mount
  useEffect(() => {
    if (messages.length === 0 && selectedTopic) {
      const teacher = agents.find((a) => a.role === "teacher");
      if (teacher) {
        addMessage({
          id: crypto.randomUUID(),
          agentId: teacher.id,
          content: `同学你好！我是${teacher.nameZh}。今天我们一起来学习**${selectedTopic.nameZh}**！\n\n在开始之前，让我问你一个问题：你之前对${selectedTopic.nameZh}了解多少呢？有没有在生活中遇到过和它相关的现象？`,
          timestamp: Date.now(),
          type: "text",
        });
      }
    }
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isThinking) return;

    // Add user message
    addMessage({
      id: crypto.randomUUID(),
      agentId: "user",
      content: text,
      timestamp: Date.now(),
      type: "text",
      isUser: true,
    });
    setInput("");
    setIsThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          agentId: activeAgent?.id || agents[0].id,
          topic: selectedTopic?.nameZh || "",
          subject,
          history: messages.slice(-10).map((m) => ({
            role: m.isUser ? "user" : "assistant",
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Chat API error");

      const data = await response.json();

      // Determine message type from response
      let msgType: Message["type"] = "text";
      if (data.content.includes("[QUIZ]")) msgType = "quiz";
      else if (data.content.includes("[CORRECT]")) msgType = "encouragement";
      else if (data.content.includes("[HINT]")) msgType = "hint";

      // Clean markers from content
      const cleanContent = data.content
        .replace(/\[QUIZ\]/g, "")
        .replace(/\[CORRECT\]/g, "")
        .replace(/\[HINT\]/g, "")
        .trim();

      addMessage({
        id: crypto.randomUUID(),
        agentId: data.agentId || activeAgent?.id || agents[0].id,
        content: cleanContent,
        timestamp: Date.now(),
        type: msgType,
      });

      // Handle quiz generation
      if (data.quiz) {
        setCurrentQuiz(data.quiz);
      }

      // Handle XP from correct answers
      if (msgType === "encouragement") {
        addXP(25);
        incrementProblems(true);
        if (selectedTopic) {
          updateMastery(selectedTopic.id, 10);
        }
      }
    } catch {
      // Fallback: generate a local response
      const agent = activeAgent || agents[0];
      addMessage({
        id: crypto.randomUUID(),
        agentId: agent.id,
        content: getLocalResponse(text, agent.role, selectedTopic?.nameZh || ""),
        timestamp: Date.now(),
        type: "text",
      });
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="pt-20 pb-4 px-4 h-screen flex flex-col">
      <div className="max-w-6xl mx-auto flex-1 flex flex-col gap-4 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("dashboard")}
              className="text-cosmic-300 hover:text-white transition-colors"
            >
              ← 返回
            </button>
            <div>
              <h2 className="text-xl font-bold">{selectedTopic?.nameZh}</h2>
              <p className="text-sm text-cosmic-300">{selectedTopic?.name}</p>
            </div>
          </div>

          {/* Mode selector */}
          <div className="flex gap-2">
            {(["lecture", "discussion", "practice", "simulation"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setClassroomMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  classroomMode === mode
                    ? "bg-nebula-500 text-white"
                    : "glass text-cosmic-300 hover:text-white"
                }`}
              >
                {mode === "lecture" && "📖 讲解"}
                {mode === "discussion" && "💬 讨论"}
                {mode === "practice" && "✏️ 练习"}
                {mode === "simulation" && "🔬 模拟"}
              </button>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Chat area */}
          <div className="flex-1 flex flex-col glass rounded-2xl overflow-hidden min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isThinking && (
                <div className="flex items-center gap-2 text-cosmic-300">
                  <span className="text-lg">{activeAgent?.avatar || "🤖"}</span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-nebula-400 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-nebula-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <span
                      className="w-2 h-2 bg-nebula-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-cosmic-600/30">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="输入你的问题或回答..."
                  className="flex-1 bg-cosmic-700/50 rounded-xl px-4 py-3 text-white placeholder-cosmic-400 border border-cosmic-600/30 focus:border-nebula-500/50 focus:outline-none transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={isThinking || !input.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-nebula-500 to-aurora-500 rounded-xl font-bold disabled:opacity-50 hover:opacity-90 transition-all"
                >
                  发送
                </button>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2 mt-3 flex-wrap">
                <QuickAction text="我不太理解" onClick={() => { setInput("我不太理解，能再解释一下吗？"); }} />
                <QuickAction text="给我一道题" onClick={() => { setInput("能给我出一道题练练吗？"); }} />
                <QuickAction text="举个例子" onClick={() => { setInput("能举一个生活中的例子吗？"); }} />
                <QuickAction text="这有什么用" onClick={() => { setInput("这个知识点在现实中有什么应用？"); }} />
                <QuickAction text="总结一下" onClick={() => { setInput("能帮我总结一下这节课的重点吗？"); }} />
              </div>
            </div>
          </div>

          {/* Sidebar: Agent selector & extras */}
          <div className="w-64 flex-shrink-0 space-y-4 hidden lg:block">
            {/* Agent selector */}
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-bold mb-3">切换对话对象</h3>
              <div className="space-y-2">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setActiveAgent(agent)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                      activeAgent?.id === agent.id
                        ? "bg-nebula-500/20 border border-nebula-500/30"
                        : "hover:bg-cosmic-700/30"
                    }`}
                  >
                    <span className="text-xl">{agent.avatar}</span>
                    <div className="text-left">
                      <div className="text-sm font-medium">{agent.nameZh}</div>
                      <div className="text-xs text-cosmic-400">
                        {agent.role === "teacher" ? "老师" : agent.role === "assistant" ? "助教" : "同学"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quiz card */}
            {currentQuiz && (
              <QuizCard
                quiz={currentQuiz}
                onAnswer={(correct) => {
                  if (correct) {
                    addXP(50);
                    incrementProblems(true);
                    if (selectedTopic) updateMastery(selectedTopic.id, 15);
                  } else {
                    incrementProblems(false);
                  }
                  setCurrentQuiz(null);
                }}
              />
            )}

            {/* Physics simulation (show in simulation mode) */}
            {classroomMode === "simulation" && subject === "physics" && selectedTopic && (
              <PhysicsSimulation topic={selectedTopic} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-xs bg-cosmic-700/50 text-cosmic-200 hover:bg-cosmic-600/50 hover:text-white transition-all"
    >
      {text}
    </button>
  );
}

/**
 * Local fallback response when API is unavailable
 */
function getLocalResponse(input: string, role: string, topic: string): string {
  if (role === "teacher") {
    return `这是一个很好的问题！关于**${topic}**，让我来引导你思考：\n\n首先，你能告诉我你已经知道哪些相关的概念吗？从已知出发往往是理解新知识最好的方式。\n\n*提示：试着回忆一下我们之前学过的基础概念，看看能不能找到联系。*`;
  }
  if (role === "assistant") {
    return `没关系，让我们一步步来！\n\n关于你的问题，我建议我们先把大问题拆分成几个小步骤：\n\n1. 首先确认基本概念\n2. 然后找到关键公式\n3. 最后一步步推导\n\n你觉得从哪一步开始比较好？`;
  }
  return `嘿！我也在学这个呢。我觉得${topic}挺有意思的！\n\n我是这样理解的——你觉得对吗？我们可以一起讨论讨论。`;
}
