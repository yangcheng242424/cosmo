"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/store";

interface QuizCardProps {
  quiz: QuizQuestion;
  onAnswer: (correct: boolean) => void;
}

export function QuizCard({ quiz, onAnswer }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [userInput, setUserInput] = useState("");

  const handleSubmit = () => {
    const answer = quiz.type === "multiple_choice" ? selectedOption : userInput.trim();
    if (!answer) return;

    setShowResult(true);

    const isCorrect =
      answer.toLowerCase().replace(/\s/g, "") ===
      quiz.correctAnswer.toLowerCase().replace(/\s/g, "");

    // Delay callback to show animation
    setTimeout(() => onAnswer(isCorrect), 2000);
  };

  const isCorrect =
    showResult &&
    (quiz.type === "multiple_choice" ? selectedOption : userInput.trim())
      ?.toLowerCase()
      .replace(/\s/g, "") ===
      quiz.correctAnswer.toLowerCase().replace(/\s/g, "");

  return (
    <div className="glass rounded-2xl p-4 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">✏️</span>
        <h3 className="text-sm font-bold">小测验</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-cosmic-600/50 text-cosmic-300">
          {"★".repeat(quiz.difficulty)}
        </span>
      </div>

      <p className="text-sm text-cosmic-100 mb-4">{quiz.question}</p>

      {/* Multiple choice */}
      {quiz.type === "multiple_choice" && quiz.options && (
        <div className="space-y-2 mb-4">
          {quiz.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selectedOption === letter;
            const isAnswer = quiz.correctAnswer === letter;

            let optionStyle = "border-cosmic-600/30 hover:border-nebula-500/30";
            if (showResult) {
              if (isAnswer) optionStyle = "border-plasma-500 bg-plasma-500/10";
              else if (isSelected && !isAnswer) optionStyle = "border-nova-500 bg-nova-500/10";
            } else if (isSelected) {
              optionStyle = "border-nebula-500 bg-nebula-500/10";
            }

            return (
              <button
                key={idx}
                onClick={() => !showResult && setSelectedOption(letter)}
                disabled={showResult}
                className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${optionStyle}`}
              >
                <span className="font-bold mr-2">{letter}.</span>
                {option}
                {showResult && isAnswer && <span className="ml-2">✓</span>}
                {showResult && isSelected && !isAnswer && <span className="ml-2">✗</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Short answer */}
      {quiz.type === "short_answer" && (
        <div className="mb-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={showResult}
            placeholder="输入你的答案..."
            className="w-full bg-cosmic-700/50 rounded-xl px-4 py-2 text-sm border border-cosmic-600/30 focus:border-nebula-500/50 focus:outline-none"
          />
        </div>
      )}

      {/* Submit / Result */}
      {!showResult ? (
        <button
          onClick={handleSubmit}
          disabled={quiz.type === "multiple_choice" ? !selectedOption : !userInput.trim()}
          className="w-full py-2 bg-gradient-to-r from-nebula-500 to-aurora-500 rounded-xl text-sm font-bold disabled:opacity-50 transition-all"
        >
          提交答案
        </button>
      ) : (
        <div
          className={`p-3 rounded-xl text-sm ${
            isCorrect ? "bg-plasma-500/10 border border-plasma-500/20" : "bg-nova-500/10 border border-nova-500/20"
          }`}
        >
          <div className="font-bold mb-1">
            {isCorrect ? "🎉 回答正确！+50 XP" : "💡 再想想看"}
          </div>
          <p className="text-cosmic-200 text-xs">{quiz.explanation}</p>
        </div>
      )}
    </div>
  );
}
