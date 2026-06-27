// Data module for Agentic Devs Collective Community Platform
// Includes initial datasets for chapters, events, members, and resources.

export const initialChapters = [
  {
    id: "delhi-ncr",
    name: "Delhi NCR Chapter",
    city: "Delhi NCR",
    country: "India",
    lead: "Ishita Sharma",
    members: 245,
    established: "2024",
    status: "Active",
    coordinates: { x: 50, y: 35 }, // Percentages for custom interactive map
    featured: true,
    description: "The hosting chapter of Agent{A}thon NCR 2026. Very active in agent framework integrations."
  },
  {
    id: "bengaluru",
    name: "Bengaluru Chapter",
    city: "Bengaluru",
    country: "India",
    lead: "Rajeev Nair",
    members: 412,
    established: "2023",
    status: "Active",
    coordinates: { x: 45, y: 70 },
    featured: true,
    description: "India's silicon valley hub. Focuses heavily on multi-agent orchestrations and production scale systems."
  },
  {
    id: "mumbai",
    name: "Mumbai Chapter",
    city: "Mumbai",
    country: "India",
    lead: "Amit Patel",
    members: 189,
    established: "2024",
    status: "Active",
    coordinates: { x: 30, y: 55 },
    featured: false,
    description: "Financial agent workflows and enterprise automation solutions focus area."
  },
  {
    id: "san-francisco",
    name: "San Francisco Chapter",
    city: "San Francisco",
    country: "USA",
    lead: "Sarah Jenkins",
    members: 580,
    established: "2023",
    status: "Active",
    coordinates: { x: 10, y: 25 },
    featured: true,
    description: "Deep ties with AgentField.ai core team and foundation model labs."
  },
  {
    id: "london",
    name: "London Chapter",
    city: "London",
    country: "UK",
    lead: "David Wright",
    members: 165,
    established: "2024",
    status: "Active",
    coordinates: { x: 80, y: 15 },
    featured: false,
    description: "Focus on AI safety, compliance, and developer tools standardizations."
  },
  {
    id: "tokyo",
    name: "Tokyo Chapter",
    city: "Tokyo",
    country: "Japan",
    lead: "Kenji Sato",
    members: 142,
    established: "2024",
    status: "Active",
    coordinates: { x: 92, y: 35 },
    featured: false,
    description: "Exploring embedded AI agents, robotic automations, and localized LLMs."
  }
];

export const initialEvents = [
  {
    id: "agentathon-ncr-2026",
    title: "Agent{A}thon NCR 2026",
    host: "Nerds Room",
    sponsor: "AgentField.ai",
    type: "Hackathon",
    date: "2026-07-18",
    time: "09:00 AM IST",
    location: "New Delhi, NCR (In-person & Virtual)",
    description: "A community-driven AI innovation event bringing together students, developers, and builders from across India to explore and showcase the next generation of AI-powered solutions. Use AgentField.ai in your project for +20 bonus points!",
    bonusPoints: 20,
    registrationOpen: true,
    registered: false,
    attendees: 1240,
    image: "agentathon_banner"
  },
  {
    id: "agentfield-deep-dive",
    title: "Building Multi-Agent Systems with AgentField.ai",
    host: "Bengaluru Chapter",
    sponsor: "AgentField.ai",
    type: "Workshop",
    date: "2026-07-05",
    time: "06:00 PM IST",
    location: "Online (Zoom)",
    description: "A step-by-step developer walkthrough on how to write custom tools, build collaborative agent teams, and deploy production-ready AI workflows on AgentField.ai.",
    bonusPoints: 0,
    registrationOpen: true,
    registered: false,
    attendees: 420,
    image: "workshop_banner"
  },
  {
    id: "agent-architecture-panel",
    title: "Future of Agentic Architectures",
    host: "San Francisco Chapter",
    sponsor: "TechVanguard",
    type: "Panel Discussion",
    date: "2026-06-15",
    time: "10:00 AM PST",
    location: "SF Town Hall & Streamed",
    description: "Industry leaders discuss autonomous task loops, self-correcting workflows, and the future of open-source agent SDKs.",
    bonusPoints: 0,
    registrationOpen: false,
    registered: false,
    attendees: 850,
    image: "panel_banner"
  },
  {
    id: "crew-ai-vs-agentfield",
    title: "Orchestration Showdown: CrewAI vs AgentField.ai",
    host: "Delhi NCR Chapter",
    sponsor: "Nerds Room",
    type: "Meetup",
    date: "2026-05-20",
    time: "05:30 PM IST",
    location: "Nerds Room Lab, Delhi",
    description: "A friendly battle of agent frameworks: comparing task execution, error recovery speeds, and token efficiencies.",
    bonusPoints: 0,
    registrationOpen: false,
    registered: false,
    attendees: 180,
    image: "meetup_banner"
  }
];

export const initialMembers = [
  {
    name: "Kabir Mehta",
    role: "AI Lead, Nerds Room",
    chapter: "Delhi NCR",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
    skills: ["AgentField.ai", "CrewAI", "Python", "LlamaIndex"],
    projects: 3,
    github: "https://github.com",
    badge: "Organizer"
  },
  {
    name: "Priya Rao",
    role: "Undergrad Builder",
    chapter: "Bengaluru",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    skills: ["AgentField.ai", "LangChain", "FastAPI", "React"],
    projects: 5,
    github: "https://github.com",
    badge: "Elite Builder"
  },
  {
    name: "Alex Rivera",
    role: "DevOps / MLOps Engineer",
    chapter: "San Francisco",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    skills: ["AgentField.ai", "Docker", "Kubernetes", "Python"],
    projects: 4,
    github: "https://github.com",
    badge: "Core Contributor"
  },
  {
    name: "Aanya Verma",
    role: "Full Stack AI Developer",
    chapter: "Delhi NCR",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
    skills: ["LangGraph", "AgentField.ai", "Next.js", "TailwindCSS"],
    projects: 6,
    github: "https://github.com",
    badge: "Hacker Master"
  },
  {
    name: "Hiroshi Tanaka",
    role: "Research Scientist",
    chapter: "Tokyo",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    skills: ["Python", "PyTorch", "Autonomous Agents", "Reinforcement Learning"],
    projects: 2,
    github: "https://github.com",
    badge: "Research Lead"
  }
];

export const initialResources = [
  {
    id: "agentfield-getting-started",
    title: "AgentField.ai Official Developer Guide",
    category: "SDK Documentation",
    duration: "15 min read",
    tags: ["AgentField.ai", "Python", "Getting Started"],
    link: "#",
    likes: 124,
    description: "The core setup guide detailing how to install AgentField.ai, define your first agent, assign custom tools, and run a single-loop workflow."
  },
  {
    id: "agentathon-starter-template",
    title: "Agent{A}thon NCR 2026 Starter Boilerplate",
    category: "Code Template",
    duration: "GitHub Repository",
    tags: ["AgentField.ai", "FastAPI", "React", "Template"],
    link: "#",
    likes: 245,
    description: "Fully configured boilerplates combining AgentField.ai backends with interactive web frontends. Perfect starting point to secure the +20 bonus points."
  },
  {
    id: "multi-agent-orchestrator",
    title: "Orchestrating Multi-Agent Workflows",
    category: "Advanced Tutorial",
    duration: "30 min video",
    tags: ["AgentField.ai", "Orchestration", "CrewAI"],
    link: "#",
    likes: 89,
    description: "Learn how to build hierarchical groups of agents where a supervisor agent delegates subtasks to specialist research and coder agents."
  },
  {
    id: "agentfield-custom-tools",
    title: "Connecting Agents to Real-World APIs",
    category: "Guides",
    duration: "10 min read",
    tags: ["AgentField.ai", "Custom Tools", "APIs"],
    link: "#",
    likes: 54,
    description: "Step-by-step instructions on writing Python tool wrappers for Slack, GitHub, Google Search, and Custom DBs, enabling agents to act on external software."
  }
];

export const statisticsData = {
  monthlyGrowth: [
    { month: "Jan", members: 320, events: 4 },
    { month: "Feb", members: 480, events: 6 },
    { month: "Mar", members: 690, events: 8 },
    { month: "Apr", members: 890, events: 9 },
    { month: "May", members: 1150, events: 12 },
    { month: "Jun", members: 1530, events: 15 }
  ],
  frameworkDistribution: [
    { name: "AgentField.ai", percentage: 48 },
    { name: "CrewAI", percentage: 22 },
    { name: "LangGraph", percentage: 18 },
    { name: "AutoGen", percentage: 12 }
  ],
  registrationsByChapter: [
    { chapter: "Delhi NCR", registrations: 450 },
    { chapter: "Bengaluru", registrations: 380 },
    { chapter: "San Francisco", registrations: 210 },
    { chapter: "Mumbai", registrations: 120 },
    { chapter: "Others", registrations: 80 }
  ]
};
