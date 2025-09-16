import {
  Brain,
  Target,
  Shield,
  Zap,
  Users,
  BookOpen,
  Trophy,
  Star
} from '../components/icons'

export const COURSE_METADATA = {
  title: "AI Fundamentals for Founders & Small Business Executives",
  subtitle: "Make confident AI decisions, deploy pragmatic automations, and measure business impact in weeks—not quarters.",
  totalLessons: 31,
  totalModules: 8
}

export const COURSE_MODULES = [
  {
    id: 1,
    title: "Foundations",
    description: "Core concepts and strategic thinking",
    lessons: 5,
    color: "bg-blue-500",
    icon: Brain,
    lessons_list: [
      "Generative AI 101 (models, embeddings, agents)",
      "Agents, tools, and orchestrators (what actually does the work)",
      "Prompting systems (TCREI) and evaluation loops",
      "Data privacy, security, and governance essentials",
      "ROI, risk, and portfolio planning for AI initiatives"
    ]
  },
  {
    id: 2,
    title: "Working Day-to-Day",
    description: "Practical applications",
    lessons: 5,
    color: "bg-emerald-500",
    icon: Target,
    lessons_list: [
      "Research & strategy with web-grounded assistants",
      "Writing & content ops (briefs, drafts, brand voice)",
      "Data work (CSV/Sheets, dashboards, QA loops)",
      "Meetings, CRM, and knowledge capture",
      "Legal, policy, and vendor management with AI"
    ]
  },
  {
    id: 3,
    title: "Platform Mastery",
    description: "Hands-on with leading AI tools",
    lessons: 8,
    color: "bg-purple-500",
    icon: Shield,
    lessons_list: [
      "ChatGPT overview (strengths, guardrails, patterns)",
      "Claude overview (analysis, drafting, reliability patterns)",
      "Gemini overview (multimodality, Google ecosystem)",
      "Perplexity overview (web-grounded Q&A, citations)",
      "Custom GPTs in your workflows",
      "n8n lab - build a self-hosted agentic workflow",
      "Zapier lab - build an action-taking assistant",
      "Manus overview (autonomy, risk labeling, sandboxing)"
    ]
  },
  {
    id: 4,
    title: "Process & Design",
    description: "Building sustainable AI systems",
    lessons: 3,
    color: "bg-orange-500",
    icon: Zap,
    lessons_list: [
      "Designing custom workflows (beyond single prompts)",
      "From pilots to production (scaling what works)",
      "Training your team on AI (practical rollout)"
    ]
  },
  {
    id: 5,
    title: "Measurement",
    description: "Tracking business impact",
    lessons: 3,
    color: "bg-rose-500",
    icon: Users,
    lessons_list: [
      "Defining success metrics (time, cost, quality)",
      "Running controlled experiments",
      "Presenting AI impact to stakeholders"
    ]
  },
  {
    id: 6,
    title: "Industry Applications",
    description: "Sector-specific solutions",
    lessons: 3,
    color: "bg-cyan-500",
    icon: BookOpen,
    lessons_list: [
      "AI for service businesses",
      "AI for product companies",
      "AI for content/media organizations"
    ]
  },
  {
    id: 7,
    title: "Advanced Topics",
    description: "Emerging capabilities",
    lessons: 2,
    color: "bg-amber-500",
    icon: Trophy,
    lessons_list: [
      "Voice AI and conversational interfaces",
      "Multi-agent orchestration"
    ]
  },
  {
    id: 8,
    title: "Capstone",
    description: "Bringing it all together",
    lessons: 2,
    color: "bg-indigo-500",
    icon: Star,
    lessons_list: [
      "Building your AI roadmap",
      "Final project presentation"
    ]
  }
]

export const CHEAT_SHEETS = [
  "ChatGPT Cheat Sheet",
  "Claude Cheat Sheet",
  "Perplexity Cheat Sheet",
  "Gemini Cheat Sheet",
  "n8n Cheat Sheet",
  "Zapier Cheat Sheet",
  "Manus Cheat Sheet"
]

export const CAPABILITY_MATRICES = [
  "LLM Capability Matrix (2025)",
  "Function-Calling Agents Comparison"
]

export const PROJECTS = [
  "Executive AI Assistant",
  "Content Generation Pipeline",
  "Customer Support Automation",
  "Data Analysis Workflow",
  "Meeting Intelligence System",
  "Knowledge Base Builder",
  "Process Automation Suite",
  "AI Integration Roadmap"
]

export const PROMPT_PACK = {
  title: "160+ Production-Ready Prompts",
  categories: [
    { name: "Sales", count: 24 },
    { name: "Support", count: 22 },
    { name: "Finance", count: 20 },
    { name: "HR", count: 18 },
    { name: "Ops/SOPs", count: 20 },
    { name: "Product/Analytics", count: 18 },
    { name: "Growth", count: 16 },
    { name: "Automation/Agents", count: 22 }
  ]
}