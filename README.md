# 🌌 CosmoLearn 宇宙学堂

**AI-Powered Interactive Tutoring for High School Math & Physics**

灵感源自清华大学 [OpenMAIC](https://github.com/THU-MAIC/OpenMAIC) 多Agent互动教室平台，CosmoLearn 专注于高中数学和物理的个性化辅导，让学习变得有趣、高效。

## 核心特色

### 🧙‍♂️ 多Agent互动课堂
- **AI老师** — 苏格拉底式教学，引导而非灌输
- **AI助教** — 脚手架式辅导，耐心拆解每一步
- **AI同学** — 活跃课堂气氛，提出启发性问题

### 🎯 智能知识图谱
- 覆盖高中数学17个知识点、物理18个知识点
- 基于前置关系的解锁机制
- 实时追踪每个知识点的掌握度

### 🎮 游戏化激励系统
- 经验值(XP)与等级系统
- 10个可解锁成就
- 连续学习奖励机制

### 🔬 互动物理模拟
- Canvas实时渲染的物理实验
- 可调参数的匀变速运动、抛体运动、牛顿定律模拟
- 所见即所得的物理直觉建立

### 💡 AI辅导特色
- 永不直接给答案，引导学生自主发现
- 动态难度调节
- 即时反馈与鼓励

## 技术栈

- **Frontend**: Next.js 15 + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 (宇宙主题深色设计)
- **State**: Zustand
- **AI**: Anthropic Claude / OpenAI (可切换，支持无API演示)
- **Simulations**: Canvas 2D

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的 API Key

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000 开始学习！

> **注意**: 即使没有配置API Key，产品也可以使用内置的智能回复系统进行演示。

## 项目结构

```
cosmolearn/
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── chat/           # 多Agent聊天 API
│   │   └── generate-lesson/ # AI课程生成 API
│   ├── layout.tsx          # 全局布局
│   └── page.tsx            # 主页面
├── components/             # React 组件
│   ├── starfield.tsx       # 星空背景动画
│   ├── navbar.tsx          # 导航栏(含XP/等级显示)
│   ├── hero-section.tsx    # 首页主视觉
│   ├── subject-selector.tsx # 科目选择
│   ├── dashboard.tsx       # 学习中心(知识地图+统计)
│   ├── classroom-view.tsx  # 互动课堂(核心交互)
│   ├── chat-message.tsx    # 聊天消息(支持LaTeX)
│   ├── quiz-card.tsx       # 测验卡片
│   └── physics-simulation.tsx # 物理实验模拟
├── lib/                    # 核心逻辑
│   ├── store.ts            # Zustand 状态管理
│   ├── agents.ts           # 多Agent系统定义
│   ├── knowledge-graph.ts  # 知识图谱 (35个知识点)
│   └── prompts.ts          # AI Prompt 模板
└── .env.example            # 环境变量模板
```

## 设计理念

本产品的设计结合了以下教育研究最佳实践：

1. **苏格拉底式教学** — AI永不直接给出答案，通过提问引导学生自主思考
2. **脚手架理论 (Scaffolding)** — 将复杂问题分解为可管理的小步骤
3. **最近发展区 (ZPD)** — 动态调整难度，保持在"有挑战但能达到"的范围
4. **多Agent交互** — 参考OpenMAIC，模拟真实课堂的社交学习环境
5. **游戏化学习** — 通过XP、成就、连续打卡等机制维持学习动力

## 参考资料

- [OpenMAIC](https://github.com/THU-MAIC/OpenMAIC) — 清华大学多Agent互动教室
- [Khanmigo](https://www.khanmigo.ai/) — Khan Academy AI辅导系统
- [AI Tutoring Research](https://www.nature.com/articles/s41598-025-97652-6) — AI辅导效果研究

## License

MIT
