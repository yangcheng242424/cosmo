"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import type { Message } from "@/lib/store";

export function SolveView() {
  const {
    questionText,
    questionImage,
    setQuestionText,
    setQuestionImage,
    solutionMessages,
    addSolutionMessage,
    clearSolution,
    isSolving,
    setIsSolving,
    setView,
    addXP,
  } = useAppStore();

  const [followUpInput, setFollowUpInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [solutionMessages]);

  const handleImageUpload = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 10 * 1024 * 1024) {
        alert("图片大小不能超过10MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setQuestionImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [setQuestionImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleImageUpload(file);
    },
    [handleImageUpload]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) handleImageUpload(file);
          break;
        }
      }
    },
    [handleImageUpload]
  );

  const handleSubmitQuestion = async () => {
    if (!questionText.trim() && !questionImage) return;
    if (isSolving) return;

    setSubmitted(true);
    setIsSolving(true);

    // Add user's question as a message
    addSolutionMessage({
      id: crypto.randomUUID(),
      agentId: "user",
      content: questionText || "（图片题目）",
      timestamp: Date.now(),
      type: "text",
      isUser: true,
    });

    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText,
          imageBase64: questionImage,
          history: [],
        }),
      });

      if (!response.ok) throw new Error("API error");

      const data = await response.json();

      addSolutionMessage({
        id: crypto.randomUUID(),
        agentId: "solver",
        content: data.content,
        timestamp: Date.now(),
        type: "explanation",
      });

      addXP(10);
    } catch {
      addSolutionMessage({
        id: crypto.randomUUID(),
        agentId: "solver",
        content:
          "抱歉，解题服务暂时不可用。请稍后再试，或者换一种方式描述你的题目。",
        timestamp: Date.now(),
        type: "text",
      });
    } finally {
      setIsSolving(false);
    }
  };

  const handleFollowUp = async () => {
    const text = followUpInput.trim();
    if (!text || isSolving) return;

    addSolutionMessage({
      id: crypto.randomUUID(),
      agentId: "user",
      content: text,
      timestamp: Date.now(),
      type: "text",
      isUser: true,
    });
    setFollowUpInput("");
    setIsSolving(true);

    try {
      const history = solutionMessages.map((m) => ({
        role: m.isUser ? "user" : "assistant",
        content: m.content,
      }));

      const response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: text,
          history,
        }),
      });

      if (!response.ok) throw new Error("API error");
      const data = await response.json();

      addSolutionMessage({
        id: crypto.randomUUID(),
        agentId: "solver",
        content: data.content,
        timestamp: Date.now(),
        type: "explanation",
      });

      addXP(5);
    } catch {
      addSolutionMessage({
        id: crypto.randomUUID(),
        agentId: "solver",
        content: "抱歉，追问服务暂时不可用，请稍后再试。",
        timestamp: Date.now(),
        type: "text",
      });
    } finally {
      setIsSolving(false);
    }
  };

  const handleNewQuestion = () => {
    clearSolution();
    setSubmitted(false);
  };

  return (
    <div className="pt-20 pb-4 px-4 min-h-screen flex flex-col">
      <div className="max-w-4xl mx-auto flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                handleNewQuestion();
                setView("home");
              }}
              className="text-cosmic-300 hover:text-white transition-colors"
            >
              ← 返回首页
            </button>
            <div>
              <h2 className="text-2xl font-bold gradient-text">
                智能解题
              </h2>
              <p className="text-sm text-cosmic-300">
                上传题目图片或输入文字，AI为你定制解答
              </p>
            </div>
          </div>
          {submitted && (
            <button
              onClick={handleNewQuestion}
              className="px-4 py-2 glass rounded-xl text-sm hover:bg-cosmic-600/50 transition-all"
            >
              新题目
            </button>
          )}
        </div>

        {/* Question Input Area (shown when not submitted) */}
        {!submitted && (
          <div className="space-y-6 animate-slide-up">
            {/* Image Upload */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              className={`relative glass rounded-2xl border-2 border-dashed transition-all ${
                dragOver
                  ? "border-nebula-400 bg-nebula-500/10"
                  : questionImage
                  ? "border-plasma-500/50"
                  : "border-cosmic-600/50 hover:border-cosmic-500/50"
              }`}
            >
              {questionImage ? (
                <div className="p-4">
                  <div className="relative">
                    <img
                      src={questionImage}
                      alt="题目图片"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <button
                      onClick={() => setQuestionImage(null)}
                      className="absolute top-2 right-2 w-8 h-8 bg-cosmic-900/80 rounded-full flex items-center justify-center text-cosmic-300 hover:text-white hover:bg-nova-500/80 transition-all"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-center text-xs text-plasma-400 mt-2">
                    图片已上传
                  </p>
                </div>
              ) : (
                <div
                  className="p-8 text-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-4xl mb-3">📷</div>
                  <p className="text-cosmic-200 mb-1">
                    拖放题目图片到这里，或点击上传
                  </p>
                  <p className="text-xs text-cosmic-400">
                    支持 JPG、PNG、WEBP 格式，也可以直接粘贴截图 (Ctrl+V)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-cosmic-600/30" />
              <span className="text-xs text-cosmic-400">或者手动输入题目</span>
              <div className="flex-1 h-px bg-cosmic-600/30" />
            </div>

            {/* Text Input */}
            <div className="glass rounded-2xl p-4">
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                onPaste={handlePaste}
                placeholder="在此输入题目内容...&#10;&#10;例如：一个物体从20m高处自由落下，求落地时的速度（g取10m/s²）"
                className="w-full bg-transparent text-white placeholder-cosmic-500 resize-none outline-none min-h-[120px] text-sm leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitQuestion}
              disabled={!questionText.trim() && !questionImage}
              className="w-full py-4 bg-gradient-to-r from-nebula-500 to-aurora-500 rounded-xl text-lg font-bold disabled:opacity-30 hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              开始解题 🚀
            </button>

            {/* Tips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-xl mb-1">📸</div>
                <p className="text-xs text-cosmic-300">
                  拍照/截图上传，支持手写题
                </p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-xl mb-1">💬</div>
                <p className="text-xs text-cosmic-300">
                  解答后可继续追问细节
                </p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-xl mb-1">🎯</div>
                <p className="text-xs text-cosmic-300">
                  AI引导思考，不直接给答案
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Solution Area (shown after submission) */}
        {submitted && (
          <div className="flex-1 flex flex-col glass rounded-2xl overflow-hidden min-h-0">
            {/* Question preview bar */}
            {questionImage && (
              <div className="px-4 py-2 border-b border-cosmic-600/30 flex items-center gap-3">
                <img
                  src={questionImage}
                  alt="题目"
                  className="h-10 rounded cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    // Could open a modal, but keeping it simple
                  }}
                />
                <span className="text-xs text-cosmic-400">题目图片</span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {solutionMessages.map((message) => (
                <SolveMessage key={message.id} message={message} />
              ))}
              {isSolving && (
                <div className="flex items-center gap-2 text-cosmic-300">
                  <span className="text-lg">🧠</span>
                  <span className="text-sm">正在思考解题方案...</span>
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

            {/* Follow-up input */}
            <div className="p-4 border-t border-cosmic-600/30">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleFollowUp()
                  }
                  placeholder="继续追问：这一步为什么？能再详细讲讲吗？"
                  className="flex-1 bg-cosmic-700/50 rounded-xl px-4 py-3 text-white placeholder-cosmic-400 border border-cosmic-600/30 focus:border-nebula-500/50 focus:outline-none transition-colors"
                />
                <button
                  onClick={handleFollowUp}
                  disabled={isSolving || !followUpInput.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-nebula-500 to-aurora-500 rounded-xl font-bold disabled:opacity-50 hover:opacity-90 transition-all"
                >
                  追问
                </button>
              </div>

              {/* Quick follow-ups */}
              <div className="flex gap-2 mt-3 flex-wrap">
                <FollowUpChip
                  text="这步不理解"
                  onClick={() => setFollowUpInput("这个步骤我不太理解，能再详细解释一下吗？")}
                />
                <FollowUpChip
                  text="换种方法"
                  onClick={() => setFollowUpInput("有没有其他解法？能换一种方法来解吗？")}
                />
                <FollowUpChip
                  text="出类似题"
                  onClick={() => setFollowUpInput("能出一道类似的题让我练习吗？")}
                />
                <FollowUpChip
                  text="总结知识点"
                  onClick={() => setFollowUpInput("能总结一下这道题涉及的知识点和解题技巧吗？")}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SolveMessage({ message }: { message: Message }) {
  if (message.isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] bg-nebula-500/20 border border-nebula-500/30 rounded-2xl rounded-br-sm px-4 py-3">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-slide-up">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-nebula-500 to-aurora-500 flex items-center justify-center text-lg">
        🧠
      </div>
      <div className="flex-1 max-w-[90%]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-cosmic-100">AI解题老师</span>
        </div>
        <div className="text-sm text-cosmic-100 leading-relaxed bg-nebula-500/5 border border-nebula-500/10 rounded-xl p-4">
          <FormattedSolution content={message.content} />
        </div>
      </div>
    </div>
  );
}

function FormattedSolution({ content }: { content: string }) {
  const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^$]+\$|\*\*[^*]+\*\*)/g);

  return (
    <div className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const formula = part.slice(2, -2).trim();
          return (
            <div
              key={i}
              className="my-2 p-3 bg-cosmic-700/50 rounded-lg font-mono text-nebula-300 text-center overflow-x-auto"
            >
              {formula}
            </div>
          );
        }
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          const formula = part.slice(1, -1);
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 bg-cosmic-700/50 rounded text-nebula-300 font-mono text-xs"
            >
              {formula}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="text-white font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}

function FollowUpChip({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-xs bg-cosmic-700/50 text-cosmic-200 hover:bg-cosmic-600/50 hover:text-white transition-all"
    >
      {text}
    </button>
  );
}
