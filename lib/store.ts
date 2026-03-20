import { create } from "zustand";

export type View = "home" | "dashboard" | "classroom" | "solve";
export type Subject = "math" | "physics";
export type AgentRole = "teacher" | "assistant" | "classmate";

export interface Agent {
  id: string;
  name: string;
  nameZh: string;
  role: AgentRole;
  avatar: string;
  personality: string;
  subject: Subject;
}

export interface Message {
  id: string;
  agentId: string;
  content: string;
  timestamp: number;
  type: "text" | "equation" | "hint" | "quiz" | "encouragement" | "explanation";
  isUser?: boolean;
}

export interface TopicNode {
  id: string;
  name: string;
  nameZh: string;
  subject: Subject;
  category: string;
  difficulty: number; // 1-5
  prerequisites: string[];
  mastery: number; // 0-100
  unlocked: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: number;
  requirement: string;
}

export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  totalProblems: number;
  correctProblems: number;
  studyMinutes: number;
  achievements: Achievement[];
  topicMastery: Record<string, number>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: number;
  topic: string;
  type: "multiple_choice" | "short_answer" | "proof";
}

interface AppState {
  // Navigation
  currentView: View;
  setView: (view: View) => void;

  // Subject & Topic
  selectedSubject: Subject | null;
  selectedTopic: TopicNode | null;
  setSubject: (subject: Subject) => void;
  setTopic: (topic: TopicNode | null) => void;

  // Agents
  agents: Agent[];
  activeAgent: Agent | null;
  setActiveAgent: (agent: Agent | null) => void;

  // Chat
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  isThinking: boolean;
  setIsThinking: (thinking: boolean) => void;

  // User progress
  progress: UserProgress;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  updateMastery: (topicId: string, delta: number) => void;
  earnAchievement: (achievementId: string) => void;
  incrementProblems: (correct: boolean) => void;

  // Quiz
  currentQuiz: QuizQuestion | null;
  setCurrentQuiz: (quiz: QuizQuestion | null) => void;

  // Classroom
  classroomMode: "lecture" | "discussion" | "practice" | "simulation";
  setClassroomMode: (mode: "lecture" | "discussion" | "practice" | "simulation") => void;

  // Solve (question upload)
  questionText: string;
  questionImage: string | null; // base64 data URL
  setQuestionText: (text: string) => void;
  setQuestionImage: (image: string | null) => void;
  solutionMessages: Message[];
  addSolutionMessage: (message: Message) => void;
  clearSolution: () => void;
  isSolving: boolean;
  setIsSolving: (solving: boolean) => void;
}

const defaultAchievements: Achievement[] = [
  {
    id: "first_step",
    name: "First Step",
    nameZh: "第一步",
    description: "完成第一道题目",
    icon: "🚀",
    earned: false,
    requirement: "complete_1_problem",
  },
  {
    id: "streak_3",
    name: "On Fire",
    nameZh: "三连击",
    description: "连续3天学习",
    icon: "🔥",
    earned: false,
    requirement: "streak_3",
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    nameZh: "周挑战者",
    description: "连续7天学习",
    icon: "⚔️",
    earned: false,
    requirement: "streak_7",
  },
  {
    id: "math_explorer",
    name: "Math Explorer",
    nameZh: "数学探索者",
    description: "完成10道数学题",
    icon: "🧮",
    earned: false,
    requirement: "math_10",
  },
  {
    id: "physics_pioneer",
    name: "Physics Pioneer",
    nameZh: "物理先锋",
    description: "完成10道物理题",
    icon: "⚛️",
    earned: false,
    requirement: "physics_10",
  },
  {
    id: "perfect_10",
    name: "Perfect 10",
    nameZh: "满分十连",
    description: "连续答对10道题",
    icon: "💎",
    earned: false,
    requirement: "perfect_streak_10",
  },
  {
    id: "level_5",
    name: "Rising Star",
    nameZh: "新星崛起",
    description: "达到5级",
    icon: "⭐",
    earned: false,
    requirement: "level_5",
  },
  {
    id: "level_10",
    name: "Supernova",
    nameZh: "超新星",
    description: "达到10级",
    icon: "🌟",
    earned: false,
    requirement: "level_10",
  },
  {
    id: "mastery_first",
    name: "Topic Master",
    nameZh: "知识大师",
    description: "首次将一个知识点掌握度提升到100%",
    icon: "👑",
    earned: false,
    requirement: "mastery_100",
  },
  {
    id: "simulation_fan",
    name: "Lab Rat",
    nameZh: "实验达人",
    description: "完成5次物理模拟实验",
    icon: "🔬",
    earned: false,
    requirement: "simulations_5",
  },
];

function calculateLevel(xp: number): number {
  // XP thresholds: Level n requires n*100 XP total
  // Level 1: 0, Level 2: 100, Level 3: 300, Level 4: 600...
  let level = 1;
  let totalNeeded = 0;
  while (totalNeeded + level * 100 <= xp) {
    totalNeeded += level * 100;
    level++;
  }
  return level;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentView: "home",
  setView: (view) => set({ currentView: view }),

  // Subject & Topic
  selectedSubject: null,
  selectedTopic: null,
  setSubject: (subject) => set({ selectedSubject: subject }),
  setTopic: (topic) => set({ selectedTopic: topic }),

  // Agents
  agents: [],
  activeAgent: null,
  setActiveAgent: (agent) => set({ activeAgent: agent }),

  // Chat
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  isThinking: false,
  setIsThinking: (thinking) => set({ isThinking: thinking }),

  // User progress
  progress: {
    xp: 0,
    level: 1,
    streak: 1,
    totalProblems: 0,
    correctProblems: 0,
    studyMinutes: 0,
    achievements: defaultAchievements,
    topicMastery: {},
  },
  addXP: (amount) =>
    set((state) => {
      const newXP = state.progress.xp + amount;
      return {
        progress: {
          ...state.progress,
          xp: newXP,
          level: calculateLevel(newXP),
        },
      };
    }),
  incrementStreak: () =>
    set((state) => ({
      progress: { ...state.progress, streak: state.progress.streak + 1 },
    })),
  updateMastery: (topicId, delta) =>
    set((state) => {
      const current = state.progress.topicMastery[topicId] || 0;
      const newVal = Math.min(100, Math.max(0, current + delta));
      return {
        progress: {
          ...state.progress,
          topicMastery: { ...state.progress.topicMastery, [topicId]: newVal },
        },
      };
    }),
  earnAchievement: (achievementId) =>
    set((state) => ({
      progress: {
        ...state.progress,
        achievements: state.progress.achievements.map((a) =>
          a.id === achievementId ? { ...a, earned: true, earnedAt: Date.now() } : a
        ),
      },
    })),
  incrementProblems: (correct) =>
    set((state) => ({
      progress: {
        ...state.progress,
        totalProblems: state.progress.totalProblems + 1,
        correctProblems: state.progress.correctProblems + (correct ? 1 : 0),
      },
    })),

  // Quiz
  currentQuiz: null,
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),

  // Classroom
  classroomMode: "lecture",
  setClassroomMode: (mode) => set({ classroomMode: mode }),

  // Solve (question upload)
  questionText: "",
  questionImage: null,
  setQuestionText: (text) => set({ questionText: text }),
  setQuestionImage: (image) => set({ questionImage: image }),
  solutionMessages: [],
  addSolutionMessage: (message) =>
    set((state) => ({ solutionMessages: [...state.solutionMessages, message] })),
  clearSolution: () => set({ solutionMessages: [], questionText: "", questionImage: null }),
  isSolving: false,
  setIsSolving: (solving) => set({ isSolving: solving }),
}));
