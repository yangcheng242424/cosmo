import { NextRequest, NextResponse } from "next/server";
import { buildAgentSystemPrompt } from "@/lib/agents";
import { getAgentById } from "@/lib/agents";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, agentId, topic, subject, history } = body;

    const agent = getAgentById(agentId);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 400 });
    }

    const systemPrompt = buildAgentSystemPrompt(agent, topic, 2);

    // Try Grok first, then Anthropic, then OpenAI
    const provider = process.env.AI_PROVIDER || "anthropic";

    let content: string;

    if (provider === "grok" && process.env.GROK_API_KEY) {
      content = await callGrok(systemPrompt, message, history);
    } else if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
      content = await callAnthropic(systemPrompt, message, history);
    } else if (process.env.OPENAI_API_KEY) {
      content = await callOpenAI(systemPrompt, message, history);
    } else {
      // Fallback: generate a contextual response locally
      content = generateFallbackResponse(agent.role, topic, message);
    }

    // Check for quiz markers in the response
    let quiz = null;
    if (content.includes("[QUIZ]")) {
      quiz = generateSimpleQuiz(topic, subject);
    }

    return NextResponse.json({
      content,
      agentId: agent.id,
      quiz,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function callGrok(
  systemPrompt: string,
  message: string,
  history: { role: string; content: string }[]
): Promise<string> {
  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message },
  ];

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "grok-3",
      messages,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(
  systemPrompt: string,
  message: string,
  history: { role: string; content: string }[]
): Promise<string> {
  const messages = [
    ...history.map((h: { role: string; content: string }) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    })),
    { role: "user" as const, content: message },
  ];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callOpenAI(
  systemPrompt: string,
  message: string,
  history: { role: string; content: string }[]
): Promise<string> {
  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generates a contextual fallback response when no API key is configured.
 * This enables the product to be demo-able without any API keys.
 */
function generateFallbackResponse(
  role: string,
  topic: string,
  userMessage: string
): string {
  const isQuestion = userMessage.includes("?") || userMessage.includes("？");
  const wantsPractice = userMessage.includes("题") || userMessage.includes("练");
  const wantsExample = userMessage.includes("例") || userMessage.includes("举");
  const confused = userMessage.includes("不懂") || userMessage.includes("不理解") || userMessage.includes("不太");

  if (role === "teacher") {
    if (wantsPractice) {
      return `好的，既然你想练习**${topic}**，让我来出一道题！\n\n这道题需要你运用我们刚才讲的核心概念。记住，解题的关键在于理清已知条件和要求的量之间的关系。\n\n来试试看吧！ [QUIZ]`;
    }
    if (wantsExample) {
      return `很好的问题！让我用一个生活中的例子来说明**${topic}**。\n\n想象一下你坐在高铁上，看着窗外的风景飞速后退。这其实就和我们讨论的概念有关。\n\n你觉得这个例子中，哪些量是我们需要关注的？`;
    }
    if (confused) {
      return `没关系！**${topic}**确实有一些需要仔细理解的地方。\n\n让我换一个角度来解释。我们先回到最基本的定义：\n\n你能告诉我，在这个概念中，最核心的那个"变化量"是什么吗？从这里出发，我们一步步推导。`;
    }
    return `关于**${topic}**，你提了一个很有深度的问题！\n\n在回答之前，我想让你先思考一个问题：如果把这个概念简化到最本质，你觉得它在描述什么？\n\n提示：试着用自己的话说一说，即使不完全准确也没关系。`;
  }

  if (role === "assistant") {
    if (confused) {
      return `别担心，让我们把这个问题拆解开来看！\n\n关于**${topic}**，我建议分三步理解：\n\n**第一步**：确认基本定义 — 用最简单的话说这个概念是什么\n**第二步**：找到关键公式 — 看看哪些量之间有关系\n**第三步**：试着用一个具体的例子来验证\n\n你想从哪一步开始？我们一步步来，不着急 😊`;
    }
    return `关于你的问题，让我补充一些细节。\n\n在学习**${topic}**时，一个常见的思路是：\n1. 先画图/列出已知条件\n2. 找到核心关系式\n3. 代入求解\n\n你之前的理解方向是对的！再往前走一步试试看。`;
  }

  // Classmate
  if (isQuestion) {
    return `哎，你这个问题我也想过！关于**${topic}**，我是这样想的...\n\n不过我不太确定对不对，你觉得呢？我们可以一起问问老师。\n\n对了，我发现一个小技巧：如果先画个图就容易理解多了！`;
  }
  return `确实！**${topic}**这块我觉得挺有意思的。\n\n我之前做了一道类似的题，一开始也卡住了，后来发现其实关键就在于找到那个核心等式。\n\n你有没有试过从另一个角度想？有时候换个思路就豁然开朗了！`;
}

/**
 * Generate a simple quiz question for demo purposes.
 */
function generateSimpleQuiz(topic: string, subject: string) {
  const mathQuizzes = [
    {
      id: "q1",
      question: `关于${topic}，下列说法正确的是？`,
      options: [
        "A. 函数的定义域和值域可以相同",
        "B. 所有函数都是连续的",
        "C. 函数必须有解析表达式",
        "D. 函数的图象一定是曲线",
      ],
      correctAnswer: "A",
      explanation: "函数的定义域和值域可以相同，例如 y=x 的定义域和值域都是实数集R。函数可以用解析式、图表、图象等方式表示，不一定需要解析表达式。",
      difficulty: 2,
      topic,
      type: "multiple_choice" as const,
    },
  ];

  const physicsQuizzes = [
    {
      id: "q1",
      question: `一个物体从静止开始做匀加速直线运动，加速度为 $2 m/s^2$，求第3秒末的速度。`,
      options: ["A. 2 m/s", "B. 4 m/s", "C. 6 m/s", "D. 8 m/s"],
      correctAnswer: "C",
      explanation:
        "根据速度公式 $v = v_0 + at$，其中 $v_0 = 0$，$a = 2 m/s^2$，$t = 3s$，所以 $v = 0 + 2 × 3 = 6 m/s$",
      difficulty: 1,
      topic,
      type: "multiple_choice" as const,
    },
  ];

  const quizzes = subject === "math" ? mathQuizzes : physicsQuizzes;
  return quizzes[Math.floor(Math.random() * quizzes.length)];
}
