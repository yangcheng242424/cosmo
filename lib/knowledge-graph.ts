import type { TopicNode } from "./store";

/**
 * Knowledge Graph for High School Math & Physics
 *
 * Structured as a directed acyclic graph (DAG) where
 * edges represent prerequisite relationships.
 */

export const MATH_TOPICS: TopicNode[] = [
  // === Algebra 代数 ===
  {
    id: "m_sets",
    name: "Sets & Logic",
    nameZh: "集合与逻辑",
    subject: "math",
    category: "代数基础",
    difficulty: 1,
    prerequisites: [],
    mastery: 0,
    unlocked: true,
  },
  {
    id: "m_functions_basic",
    name: "Functions Basics",
    nameZh: "函数基本概念",
    subject: "math",
    category: "函数",
    difficulty: 1,
    prerequisites: ["m_sets"],
    mastery: 0,
    unlocked: true,
  },
  {
    id: "m_quadratic",
    name: "Quadratic Functions",
    nameZh: "二次函数与方程",
    subject: "math",
    category: "函数",
    difficulty: 2,
    prerequisites: ["m_functions_basic"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "m_exponential",
    name: "Exponential & Log",
    nameZh: "指数与对数函数",
    subject: "math",
    category: "函数",
    difficulty: 2,
    prerequisites: ["m_functions_basic"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "m_trigonometry",
    name: "Trigonometry",
    nameZh: "三角函数",
    subject: "math",
    category: "函数",
    difficulty: 3,
    prerequisites: ["m_functions_basic"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "m_sequences",
    name: "Sequences & Series",
    nameZh: "数列",
    subject: "math",
    category: "代数",
    difficulty: 3,
    prerequisites: ["m_functions_basic"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "m_inequalities",
    name: "Inequalities",
    nameZh: "不等式",
    subject: "math",
    category: "代数",
    difficulty: 2,
    prerequisites: ["m_sets", "m_functions_basic"],
    mastery: 0,
    unlocked: false,
  },

  // === Geometry 几何 ===
  {
    id: "m_plane_geometry",
    name: "Plane Geometry",
    nameZh: "平面几何",
    subject: "math",
    category: "几何",
    difficulty: 2,
    prerequisites: [],
    mastery: 0,
    unlocked: true,
  },
  {
    id: "m_solid_geometry",
    name: "Solid Geometry",
    nameZh: "立体几何",
    subject: "math",
    category: "几何",
    difficulty: 3,
    prerequisites: ["m_plane_geometry"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "m_analytic_geometry",
    name: "Analytic Geometry",
    nameZh: "解析几何",
    subject: "math",
    category: "几何",
    difficulty: 4,
    prerequisites: ["m_plane_geometry", "m_quadratic"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "m_vectors",
    name: "Vectors",
    nameZh: "向量",
    subject: "math",
    category: "几何",
    difficulty: 3,
    prerequisites: ["m_trigonometry", "m_plane_geometry"],
    mastery: 0,
    unlocked: false,
  },

  // === Calculus 微积分 ===
  {
    id: "m_limits",
    name: "Limits",
    nameZh: "极限",
    subject: "math",
    category: "微积分",
    difficulty: 3,
    prerequisites: ["m_functions_basic", "m_sequences"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "m_derivatives",
    name: "Derivatives",
    nameZh: "导数",
    subject: "math",
    category: "微积分",
    difficulty: 4,
    prerequisites: ["m_limits"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "m_integrals",
    name: "Integrals",
    nameZh: "积分",
    subject: "math",
    category: "微积分",
    difficulty: 5,
    prerequisites: ["m_derivatives"],
    mastery: 0,
    unlocked: false,
  },

  // === Probability 概率统计 ===
  {
    id: "m_combinatorics",
    name: "Combinatorics",
    nameZh: "排列组合",
    subject: "math",
    category: "概率统计",
    difficulty: 3,
    prerequisites: ["m_sets"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "m_probability",
    name: "Probability",
    nameZh: "概率",
    subject: "math",
    category: "概率统计",
    difficulty: 3,
    prerequisites: ["m_combinatorics"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "m_statistics",
    name: "Statistics",
    nameZh: "统计",
    subject: "math",
    category: "概率统计",
    difficulty: 2,
    prerequisites: ["m_probability"],
    mastery: 0,
    unlocked: false,
  },
];

export const PHYSICS_TOPICS: TopicNode[] = [
  // === Mechanics 力学 ===
  {
    id: "p_kinematics",
    name: "Kinematics",
    nameZh: "运动学",
    subject: "physics",
    category: "力学",
    difficulty: 1,
    prerequisites: [],
    mastery: 0,
    unlocked: true,
  },
  {
    id: "p_newton_laws",
    name: "Newton's Laws",
    nameZh: "牛顿运动定律",
    subject: "physics",
    category: "力学",
    difficulty: 2,
    prerequisites: ["p_kinematics"],
    mastery: 0,
    unlocked: true,
  },
  {
    id: "p_forces",
    name: "Common Forces",
    nameZh: "常见力（重力、弹力、摩擦力）",
    subject: "physics",
    category: "力学",
    difficulty: 2,
    prerequisites: ["p_newton_laws"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "p_projectile",
    name: "Projectile Motion",
    nameZh: "抛体运动",
    subject: "physics",
    category: "力学",
    difficulty: 3,
    prerequisites: ["p_kinematics", "p_newton_laws"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "p_circular",
    name: "Circular Motion",
    nameZh: "圆周运动",
    subject: "physics",
    category: "力学",
    difficulty: 3,
    prerequisites: ["p_newton_laws"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "p_work_energy",
    name: "Work & Energy",
    nameZh: "功与能",
    subject: "physics",
    category: "力学",
    difficulty: 3,
    prerequisites: ["p_forces"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "p_momentum",
    name: "Momentum",
    nameZh: "动量",
    subject: "physics",
    category: "力学",
    difficulty: 3,
    prerequisites: ["p_newton_laws"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "p_gravity",
    name: "Universal Gravitation",
    nameZh: "万有引力",
    subject: "physics",
    category: "力学",
    difficulty: 4,
    prerequisites: ["p_circular", "p_work_energy"],
    mastery: 0,
    unlocked: false,
  },

  // === Electromagnetism 电磁学 ===
  {
    id: "p_electrostatics",
    name: "Electrostatics",
    nameZh: "静电学",
    subject: "physics",
    category: "电磁学",
    difficulty: 3,
    prerequisites: ["p_forces"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "p_circuits",
    name: "DC Circuits",
    nameZh: "直流电路",
    subject: "physics",
    category: "电磁学",
    difficulty: 2,
    prerequisites: ["p_electrostatics"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "p_magnetic_field",
    name: "Magnetic Fields",
    nameZh: "磁场",
    subject: "physics",
    category: "电磁学",
    difficulty: 3,
    prerequisites: ["p_electrostatics"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "p_em_induction",
    name: "EM Induction",
    nameZh: "电磁感应",
    subject: "physics",
    category: "电磁学",
    difficulty: 4,
    prerequisites: ["p_magnetic_field", "p_circuits"],
    mastery: 0,
    unlocked: false,
  },

  // === Thermodynamics 热学 ===
  {
    id: "p_thermodynamics",
    name: "Thermodynamics",
    nameZh: "热学",
    subject: "physics",
    category: "热学",
    difficulty: 2,
    prerequisites: ["p_work_energy"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "p_gas_laws",
    name: "Gas Laws",
    nameZh: "气体定律",
    subject: "physics",
    category: "热学",
    difficulty: 3,
    prerequisites: ["p_thermodynamics"],
    mastery: 0,
    unlocked: false,
  },

  // === Waves & Optics 波动与光学 ===
  {
    id: "p_waves",
    name: "Mechanical Waves",
    nameZh: "机械波",
    subject: "physics",
    category: "波动与光学",
    difficulty: 3,
    prerequisites: ["p_kinematics"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "p_optics",
    name: "Optics",
    nameZh: "光学",
    subject: "physics",
    category: "波动与光学",
    difficulty: 3,
    prerequisites: ["p_waves"],
    mastery: 0,
    unlocked: false,
  },

  // === Modern Physics 近代物理 ===
  {
    id: "p_atomic",
    name: "Atomic Physics",
    nameZh: "原子物理",
    subject: "physics",
    category: "近代物理",
    difficulty: 4,
    prerequisites: ["p_optics", "p_electrostatics"],
    mastery: 0,
    unlocked: false,
  },
  {
    id: "p_nuclear",
    name: "Nuclear Physics",
    nameZh: "核物理",
    subject: "physics",
    category: "近代物理",
    difficulty: 5,
    prerequisites: ["p_atomic"],
    mastery: 0,
    unlocked: false,
  },
];

export const ALL_TOPICS = [...MATH_TOPICS, ...PHYSICS_TOPICS];

export function getTopicsBySubject(subject: "math" | "physics"): TopicNode[] {
  return subject === "math" ? MATH_TOPICS : PHYSICS_TOPICS;
}

export function getTopicById(id: string): TopicNode | undefined {
  return ALL_TOPICS.find((t) => t.id === id);
}

export function getAvailableTopics(
  subject: "math" | "physics",
  mastery: Record<string, number>
): TopicNode[] {
  const topics = getTopicsBySubject(subject);
  return topics.map((topic) => {
    const allPrereqsMet = topic.prerequisites.every(
      (prereqId) => (mastery[prereqId] || 0) >= 60
    );
    return {
      ...topic,
      unlocked: topic.prerequisites.length === 0 || allPrereqsMet,
      mastery: mastery[topic.id] || 0,
    };
  });
}

export function getTopicCategories(subject: "math" | "physics"): string[] {
  const topics = getTopicsBySubject(subject);
  return [...new Set(topics.map((t) => t.category))];
}
