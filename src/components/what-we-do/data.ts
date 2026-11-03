export type IconKey =
  | "agentic"
  | "headless"
  | "architecture"
  | "bi"
  | "database"
  | "sales"
  | "discovery"
  | "matching"
  | "social"
  | "recovery"
  | "multichannel"
  | "voice"
  | "engagement"
  | "followup"
  | "scheduling"
  | "workforce"
  | "onboarding"
  | "training"
  | "ops"
  | "infrastructure";

export type Service = { icon: IconKey; title: string; description: string };

export type Chapter = { id: 1 | 2 | 3 | 4; label: string; kicker: string; title: string };

export const CHAPTERS: Chapter[] = [
  { id: 1, label: "01", kicker: "Build the brain", title: "The Intelligence" },
  { id: 2, label: "02", kicker: "Find and win", title: "The Growth" },
  { id: 3, label: "03", kicker: "Engage and connect", title: "The Conversation" },
  { id: 4, label: "04", kicker: "Workforce, operations, infrastructure", title: "The Scale" },
];

const SERVICES: Record<number, Service[]> = {
  1: [
    {
      icon: "agentic",
      title: "Agentic AI Systems",
      description:
        "We build systems that don’t just answer questions. They’re designed to pursue a goal, make decisions, take actions, coordinate tasks and move a process toward completion.",
    },
    {
      icon: "headless",
      title: "Headless AI Systems",
      description:
        "We build intelligence that can operate across existing software, websites and workflows without requiring the business to replace its entire technology stack.",
    },
    {
      icon: "architecture",
      title: "Custom AI Architecture",
      description:
        "Bring us the business problem. We architect the intelligence, workflows and systems required to solve it.",
    },
    {
      icon: "bi",
      title: "Business Intelligence & Decision Systems",
      description:
        "Build intelligence around a company’s unique capabilities, territory, customers, workforce, goals and operating constraints so decisions aren’t generic.",
    },
    {
      icon: "database",
      title: "Database Intelligence",
      description:
        "Turn existing databases into active assets by understanding who’s in them, identifying opportunities, segmenting people and initiating the appropriate next action.",
    },
  ],
  2: [
    {
      icon: "sales",
      title: "Sales Systems",
      description:
        "Systems designed to identify opportunities, engage prospects, qualify interest, move conversations forward and support the sales process at scale.",
    },
    {
      icon: "discovery",
      title: "Opportunity Discovery",
      description:
        "Systems that continuously identify potential customers, candidates, contracts, relationships or other opportunities relevant to the business.",
    },
    {
      icon: "matching",
      title: "Qualification & Matching Systems",
      description:
        "Determine whether a person, company, candidate, opportunity or contract fits predefined business requirements and route it appropriately.",
    },
    {
      icon: "social",
      title: "Social Media Growth & Prospecting",
      description:
        "Identify relevant people and conversations, engage at scale, develop relationships and create new opportunities through social media.",
    },
    {
      icon: "recovery",
      title: "Lead Recovery",
      description:
        "Re-engage old, dormant and forgotten leads and turn existing databases back into active sales opportunities.",
    },
  ],
  3: [
    {
      icon: "multichannel",
      title: "Multi-Channel Communication",
      description:
        "Coordinate conversations and follow-up through channels such as text, email, web chat, social platforms and voice.",
    },
    {
      icon: "voice",
      title: "AI Voice Systems",
      description:
        "Intelligent voice agents capable of carrying on conversations, qualifying people, answering questions, following up and moving people toward the appropriate next step.",
    },
    {
      icon: "engagement",
      title: "Customer Engagement Systems",
      description:
        "Intelligent conversations across the customer journey, from initial inquiry through qualification, scheduling and ongoing communication.",
    },
    {
      icon: "followup",
      title: "Automated Follow-Up",
      description:
        "Persistent follow-up across prospects, applicants, customers and opportunities so valuable conversations don’t simply disappear.",
    },
    {
      icon: "scheduling",
      title: "Appointment Setting & Scheduling",
      description:
        "Qualify people and move qualified opportunities directly into scheduled conversations with the appropriate human.",
    },
  ],
  4: [
    {
      icon: "workforce",
      title: "Workforce & Recruiting Systems",
      description:
        "Find → Engage → Qualify → Connect → Onboard → Train → Follow Up. Built for high-volume and distributed workforces.",
    },
    {
      icon: "onboarding",
      title: "Onboarding Systems",
      description:
        "Guide new employees, contractors, customers or partners through onboarding while keeping the process moving and identifying people who haven’t completed required steps.",
    },
    {
      icon: "training",
      title: "Training Systems",
      description:
        "Deliver training, track progress, gather feedback and trigger the appropriate next steps.",
    },
    {
      icon: "ops",
      title: "Operational Workflow Automation",
      description:
        "Identify repetitive human processes inside a business and architect systems capable of executing or coordinating them at scale.",
    },
    {
      icon: "infrastructure",
      title: "Scalable Business Infrastructure",
      description:
        "Ultimately, we take processes that normally require more people, more time and more manual effort and redesign them so the business can operate and grow at a completely different scale.",
    },
  ],
};

export const servicesFor = (chapter: number): Service[] => SERVICES[chapter] ?? [];

export const PIPELINE = ["Find", "Engage", "Qualify", "Connect", "Onboard", "Train", "Follow Up"];

export const INTRO =
  "LeadZLoco architects intelligent systems that allow businesses to do what was previously limited by people, time, technology and scale.";

export const TICKER =
  "Agentic AI · Headless AI · Intelligent Workflows · Workforce Systems · Sales · Follow-Up · Growth · Operations · ";

export const CLOSING = "You bring us the problem. We build the system that solves it.";
