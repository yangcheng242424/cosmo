"use client";

import { getAgentById } from "@/lib/agents";
import type { Message } from "@/lib/store";

export function ChatMessage({ message }: { message: Message }) {
  const agent = message.isUser ? null : getAgentById(message.agentId);

  const typeStyles: Record<Message["type"], string> = {
    text: "",
    equation: "border-l-2 border-nebula-400 pl-3",
    hint: "bg-star-500/10 border border-star-500/20 rounded-xl p-3",
    quiz: "bg-aurora-500/10 border border-aurora-500/20 rounded-xl p-3",
    encouragement: "bg-plasma-500/10 border border-plasma-500/20 rounded-xl p-3",
    explanation: "bg-nebula-500/10 border border-nebula-500/20 rounded-xl p-3",
  };

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
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cosmic-700 flex items-center justify-center text-lg">
        {agent?.avatar || "🤖"}
      </div>

      {/* Content */}
      <div className="flex-1 max-w-[80%]">
        {/* Name & role */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-cosmic-100">
            {agent?.nameZh || "AI"}
          </span>
          <span className="text-xs text-cosmic-400">
            {agent?.role === "teacher"
              ? "老师"
              : agent?.role === "assistant"
              ? "助教"
              : "同学"}
          </span>
        </div>

        {/* Message body */}
        <div className={`text-sm text-cosmic-100 leading-relaxed ${typeStyles[message.type]}`}>
          <FormattedContent content={message.content} />
        </div>
      </div>
    </div>
  );
}

/**
 * Renders markdown-like content with LaTeX formula support.
 * In production, this would use KaTeX for proper rendering.
 */
function FormattedContent({ content }: { content: string }) {
  // Split content by LaTeX delimiters and bold markers
  const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^$]+\$|\*\*[^*]+\*\*)/g);

  return (
    <div className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        // Display math ($$...$$)
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
        // Inline math ($...$)
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          const formula = part.slice(1, -1);
          return (
            <code key={i} className="px-1.5 py-0.5 bg-cosmic-700/50 rounded text-nebula-300 font-mono text-xs">
              {formula}
            </code>
          );
        }
        // Bold (**...**)
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="text-white font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        // Regular text
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}
