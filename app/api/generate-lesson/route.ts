import { NextRequest, NextResponse } from "next/server";
import { LESSON_GENERATION_PROMPT } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { topic, subject, level } = await request.json();

    const prompt = LESSON_GENERATION_PROMPT
      .replace("{topic}", topic)
      .replace("{subject}", subject === "math" ? "数学" : "物理")
      .replace("{level}", String(level));

    // Try to call AI, fall back to template
    let lesson;

    if (process.env.ANTHROPIC_API_KEY) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "claude-sonnet-4-6",
          max_tokens: 2048,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content[0].text;
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          lesson = JSON.parse(jsonMatch[0]);
        }
      }
    }

    // Fallback template
    if (!lesson) {
      lesson = generateFallbackLesson(topic, subject);
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Lesson generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate lesson" },
      { status: 500 }
    );
  }
}

function generateFallbackLesson(topic: string, subject: string) {
  return {
    title: `${topic} - 互动课堂`,
    objectives: [
      `理解${topic}的基本概念和定义`,
      `掌握${topic}的核心公式和应用条件`,
      `能够运用${topic}解决实际问题`,
    ],
    warmup: {
      question: `在日常生活中，你能想到哪些和${topic}相关的现象？`,
      hint: "试着观察身边的事物，很多看似简单的现象都蕴含着深刻的道理",
    },
    sections: [
      {
        title: "概念引入",
        type: "lecture",
        content: `${topic}的基本概念介绍`,
        keyFormulas: [],
        examples: ["引入示例"],
        interactiveElement: "思考与讨论",
      },
      {
        title: "核心知识",
        type: "lecture",
        content: `${topic}的核心原理和公式推导`,
        keyFormulas: [],
        examples: ["经典例题"],
        interactiveElement: "动手验证",
      },
      {
        title: "实战练习",
        type: "practice",
        content: "巩固练习",
        keyFormulas: [],
        examples: ["练习题组"],
        interactiveElement: "限时挑战",
      },
    ],
    practice: [
      {
        question: `关于${topic}的基础练习题`,
        difficulty: 2,
        type: "multiple_choice",
        options: ["选项A", "选项B", "选项C", "选项D"],
        answer: "A",
        explanation: "解题思路...",
      },
    ],
    summary: `本节课我们学习了${topic}的基本概念、核心公式和应用方法。`,
    nextTopics: ["建议继续学习的知识点"],
  };
}
