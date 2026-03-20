import { NextRequest, NextResponse } from "next/server";

const SOLVE_SYSTEM_PROMPT = `你是CosmoLearn宇宙学堂的AI解题老师，专门帮助高中生理解和解答数学、物理题目。

## 教学原则
1. **苏格拉底式引导**：不直接给出最终答案，而是通过分步骤引导学生理解解题思路
2. **分步解析**：将复杂问题拆解为清晰的步骤，每步都解释"为什么"这样做
3. **公式标注**：使用LaTeX格式书写公式，用 $...$ 表示行内公式，$$...$$ 表示独立公式
4. **互动鼓励**：在解题过程中穿插引导性问题，鼓励学生思考

## 输出格式
请按以下结构组织你的回答：

**题目分析**：简要分析题目考察的知识点和解题方向
**解题过程**：分步骤详细解析，每步标注步骤号
**关键总结**：总结解题方法和需要注意的易错点
**延伸思考**：提出1-2个相关的思考问题，引导进一步学习

请用中文回答。对于数学公式使用LaTeX格式。`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionText, imageBase64, history } = body;

    if (!questionText && !imageBase64) {
      return NextResponse.json(
        { error: "请提供题目文字或图片" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        content: generateFallbackSolution(questionText),
        isFollowUp: false,
      });
    }

    const isFollowUp = history && history.length > 0;

    const messages: Array<{
      role: string;
      content: string | Array<{ type: string; text?: string; image_url?: { url: string; detail?: string } }>;
    }> = [];

    // Add conversation history for follow-up questions
    if (history) {
      for (const h of history) {
        messages.push({
          role: h.role,
          content: h.content,
        });
      }
    }

    // Build the user message
    if (imageBase64 && !isFollowUp) {
      // First message with image
      const userContent: Array<{ type: string; text?: string; image_url?: { url: string; detail?: string } }> = [];
      userContent.push({
        type: "image_url",
        image_url: { url: imageBase64, detail: "high" },
      });
      userContent.push({
        type: "text",
        text: questionText
          ? `请看这道题的图片，题目补充说明：${questionText}\n\n请详细解析这道题。`
          : "请看这道题的图片，详细解析这道题。",
      });
      messages.push({ role: "user", content: userContent });
    } else if (questionText) {
      const prompt = isFollowUp
        ? questionText
        : `请详细解析这道题：\n\n${questionText}`;
      messages.push({ role: "user", content: prompt });
    }

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "grok-3-mini",
        messages: [
          { role: "system", content: SOLVE_SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Grok API error:", response.status, errorText);
      return NextResponse.json({
        content: generateFallbackSolution(questionText),
        isFollowUp,
      });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return NextResponse.json({
      content,
      isFollowUp,
    });
  } catch (error) {
    console.error("Solve API error:", error);
    return NextResponse.json(
      { error: "解题服务暂时不可用，请稍后重试" },
      { status: 500 }
    );
  }
}

function generateFallbackSolution(questionText: string): string {
  return `**题目分析**

你提交的题目是一个很有代表性的问题！让我来帮你分析一下。

> ${questionText || "（图片题目）"}

**解题思路引导**

这道题需要我们：

1. **明确已知条件** — 仔细读题，把所有已知量和要求的量标出来
2. **找到核心关系** — 想想这道题涉及哪些公式或定理？
3. **建立方程** — 用数学语言把已知和未知联系起来
4. **求解验证** — 计算结果后别忘了验算

**延伸思考**

- 如果改变题目中的某个条件，结果会怎样变化？
- 这道题还有其他解法吗？

💡 *提示：你可以继续追问某个步骤的细节，我会为你进一步讲解！*`;
}
