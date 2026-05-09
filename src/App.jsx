import React, { useState, useRef, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {
  TrendingUp, Users, MessageSquareQuote, Target, Compass,
  Download, ExternalLink, ChevronDown, ChevronRight, Menu, X,
  Code2, Sparkles, CheckCircle2, Clock, Circle, ArrowUpRight,
  Layers
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList
} from 'recharts'

// ============================================================================
// DATA
// ============================================================================

const SECTIONS = [
  { id: 'summary',     label: 'Executive Summary', icon: Layers },
  { id: 'questions',   label: 'The Three Questions', icon: MessageSquareQuote },
  { id: 'year',        label: 'The Year in Motion', icon: TrendingUp },
  { id: 'benchmarks',  label: 'Benchmarks vs IC6', icon: Target },
  { id: 'ahead',       label: "What I'm Asking For", icon: Compass },
]

const KPI_TILES = [
  {
    label: 'PRODUCTION PLATFORM SHIPPED',
    value: '1',
    sub: 'BFSI Master Platform — live, role-gated, used by senior leadership',
    icon: Code2,
    accent: 'blue',
    drilldown: {
      title: 'BFSI Master Platform — what shipped',
      blurb: 'A live, production React web app conceived, scoped, built, and shipped end-to-end as a single IC. In active alignment conversations with Daniel Harron to merge into the broader TI Platform.',
      sections: [
        {
          heading: 'Six modules shipped',
          items: [
            { strong: 'Revenue Forecast', text: 'FY26 BFSI outlook with 90% confidence + best case + pipeline + actuals YTD; drill by account, quarter, SOW' },
            { strong: 'Talent Pool', text: 'Live headcount, billable vs buffer, FTE vs sub-contractor split, role distribution, account-level utilization' },
            { strong: 'Recruiting', text: 'Active candidate pipeline across Apollo, Goldman Sachs, BlackRock with status tracking' },
            { strong: 'P&L', text: 'Revenue, COGS, gross margin by account at Q1 and monthly granularity' },
            { strong: 'Burn Sheets', text: 'Live cost burn by account/SOW/developer with planned-vs-actual tracking and branded PDF export' },
            { strong: 'Delivery', text: 'RAG summary tiles, health trend, risks-by-account, project-level drill-down' },
          ]
        },
        {
          heading: 'Role-based access from day one',
          items: [
            { strong: 'Leadership / Finance / Fulfillment / Delivery', text: 'each role sees only the data appropriate to it' },
            { strong: 'Sensitive-field stripping at the Apps Script middleware layer', text: 'base salary, fully-loaded cost, hire date, email IDs never reach the client regardless of role' },
          ]
        },
        {
          heading: 'Calibration loops baked in',
          items: [
            { strong: 'Built module-by-module', text: 'with Amar Duggal and Rahul Bora reviewing each before broader rollout' },
            { strong: 'Apr 22 Rahul feedback', text: 'shipped fixes for slow loading, drill-downs, and recruiting module overhaul same-day' },
          ]
        }
      ],
      cta: { label: 'View live platform', url: 'https://bfsi-web-app.netlify.app/' }
    }
  },
  {
    label: "Q2'26 BFSI REVENUE OWNED",
    value: '$2.91M',
    sub: 'Weekly WoW cadence to Amar Duggal, account-level variance reporting',
    icon: TrendingUp,
    accent: 'teal',
    drilldown: {
      title: "BFSI revenue forecast — what I own",
      blurb: 'End-to-end ownership of the BFSI vertical\'s quarterly forecasting, with a weekly WoW cadence to Amar Duggal and account-level variance reporting after every monthly close.',
      sections: [
        {
          heading: 'FY26 forecast trajectory',
          items: [
            { strong: "Q1'26 — actualized", text: '$1.78M (Jan–Mar 2026)' },
            { strong: "Q2'26 — forecast", text: '$2.91M' },
            { strong: "Q3'26 — forecast", text: '$2.99M' },
            { strong: "Q4'26 — forecast", text: '$2.96M' },
            { strong: "FY26 total — forecast", text: '~$10.65M across the BFSI vertical' },
          ]
        },
        {
          heading: 'Account-level Q1\'26 actuals',
          items: [
            { strong: 'Apollo Global Management', text: '$1.48M — largest BFSI account, weekly tracked' },
            { strong: 'ADS Securities', text: '$189K' },
            { strong: 'BlackRock', text: '$112K — variance reported with full root-cause' },
          ]
        },
        {
          heading: 'Operating cadence',
          items: [
            { strong: 'Weekly WoW delta report to Amar', text: 'initiated April 15 — quarterly forecast, weekly change, commentary, account-level breakdown' },
            { strong: 'CBRE early-warning catch', text: 'flagged a $585K shift from BFSI to Emerging Org with one week of lead time, before it hit the close' },
            { strong: 'Account-level variance reporting', text: 'completed for the Q1\'26 close across Apollo, BlackRock, ADS Securities' },
            { strong: 'Mandatory rate-type verification', text: 'documented step in the monthly close workflow (T&M vs fixed-monthly vs daily)' },
          ]
        }
      ]
    }
  },
  {
    label: 'CROSS-FUNCTIONAL INITIATIVES',
    value: '5+',
    sub: 'Outbound Reporting, Talent Dashboards, Fulfillment Funnel, BFSI Platform, Forecast cadence',
    icon: Users,
    accent: 'violet',
    drilldown: {
      title: 'Cross-functional initiatives — driven without a project manager',
      blurb: 'Each of these required coordination across multiple teams and stakeholders. None had a dedicated PM. Each is operationalized and being used today.',
      sections: [
        {
          heading: 'Active initiatives',
          items: [
            { strong: 'BFSI Master Platform', text: 'Stakeholders: Amar Duggal, Rahul Bora, Daniel Harron · 6 modules, role-based access, branded PDF export' },
            { strong: 'Weekly BFSI Forecast Cadence', text: 'Stakeholder: Amar Duggal · Weekly WoW delta + account-level variance reporting' },
            { strong: 'Outbound Reporting Initiative', text: 'Stakeholders: Abhilash Kandwal, Aditya Bam, Madhan Kumar, Kal Bowers · Cross-channel reporting (SDR, AE, Recruiter, Paid Marketing, Email); live Jan 1, 2026' },
            { strong: 'Ti Projects Sales Dashboard', text: 'Stakeholders: Dave Critchley, Erika Rhinehart, Joydip Mukherji · SF-native dashboard, rolled out Sept 30, 2025' },
            { strong: 'Fulfillment Funnel Dashboards', text: 'Stakeholders: Ivan, Nishad Acharya · Funnel by Reps + detailed Packets/Interview views' },
            { strong: 'Talent Active Devs / Starts / Stops', text: 'Stakeholder: Rahul Bora · AE-level metrics, Account-level Starts/Stops, Active Devs M-o-M' },
          ]
        }
      ]
    }
  },
  {
    label: 'VOLUME VS FY24/25',
    value: '~3x',
    sub: 'Higher complexity, single IC, AI-native operating model',
    icon: Sparkles,
    accent: 'orange',
    drilldown: {
      title: 'Year-over-year scope expansion',
      blurb: 'Honest measure: roughly 3x the volume of work delivered this year vs last, with materially higher complexity, as a single IC. AI is the reason that math works.',
      sections: [
        {
          heading: 'FY24/25 delivered',
          items: [
            { strong: 'Gemini ICE Marketing Gem', text: 'LLM evaluation framework, 71% accuracy (15pp above best in class)' },
            { strong: 'Salesforce Lead Queue Tracker', text: 'Recovered 8 SQLs, $500K TCV' },
            { strong: 'Revenue forecasting model', text: 'Unified forecasting + revenue leakage logic' },
            { strong: 'MECE workflow matrix', text: 'Delivery operations playbooks for Multimodality and Advanced Reasoning' },
          ]
        },
        {
          heading: 'FY25/26 delivered',
          items: [
            { strong: 'BFSI Master Platform', text: '4,658-line production React app, 6 modules, role-gated, live for senior leadership' },
            { strong: 'BFSI revenue ownership', text: '$1.78M Q1\'26 actualized, $2.91M Q2\'26 forecast, weekly cadence, account-level variance reporting' },
            { strong: 'Outbound Reporting Initiative', text: 'Cross-channel reporting across 5 channels, live Jan 1, 2026' },
            { strong: 'Ti Projects Sales Dashboard', text: 'SF-native dashboard rolled out to AEs across TI Projects' },
            { strong: 'Salesforce attribution diagnosis + fixes', text: 'AE/SDR campaign overlap, lead duplication, Email-ID-as-key proposal' },
            { strong: 'Fulfillment Funnel + Talent dashboards', text: 'Multiple dashboards for Ivan, Rahul Bora, fulfillment ops' },
          ]
        },
        {
          heading: 'How it scaled',
          items: [
            { strong: 'AI pair-programming', text: 'Production code shipped via structured Claude → Codex pair-programming' },
            { strong: 'Long-context workspaces', text: 'Slack self-DM as a structured project log; sub-minute context resume across sessions' },
            { strong: 'Automation discipline', text: 'Codex-driven forecast snapshot pipelines, Apps Script middleware, recurring report refreshes' },
          ]
        }
      ]
    }
  },
]

const QUESTIONS = [
  {
    id: 'q1',
    number: '01',
    title: 'Delivery Against Objectives',
    subtitle: 'Looking at your objectives for this year, describe the outcomes you delivered. Where did you have the most impact, and where did you fall short?',
    bluf: 'Shipped a production analytics platform, took end-to-end ownership of BFSI revenue forecasting, and operationalized cross-channel reporting infrastructure — IC6-scope work delivered as a single IC.',
    sections: [
      {
        heading: 'Where I had the most impact',
        bullets: [
          { strong: 'BFSI Master Platform', text: ' — conceived, built, and shipped the live React web application with six modules (Revenue Forecast, Talent Pool, Recruiting, P&L, Burn Sheets, Delivery), role-based access (Leadership/Finance/Fulfillment/Delivery), live Google Sheets data via Apps Script middleware, and branded PDF burn-sheet export. Now in alignment conversations with Daniel Harron\'s broader TI Platform.', link: { url: 'https://bfsi-web-app.netlify.app/', label: 'View live →' } },
          { strong: 'BFSI revenue forecast ownership', text: ' — Q1\'26 actualized at $1.78M, with Apollo Global Management at $1.48M, ADS Securities at $189K, and BlackRock at $112K. Q2\'26 forecast at $2.91M, with the FY26 BFSI vertical tracking to ~$10.65M total. Initiated and now run a weekly WoW forecast cadence to Amar Duggal, with full account-level variance reporting after every monthly close.' },
          { strong: 'Outbound Reporting Initiative', text: ' — centralized cross-channel reporting across SDR cadences, AE cadences, Job Recruiter Campaigns, Paid Marketing, and Email; auto-refresh every 24 hours; operationalized January 1, 2026. Coordinated with Abhilash Kandwal, Aditya Bam, Madhan Kumar, and Kal Bowers without a project manager.' },
          { strong: 'Ti Projects Sales Dashboard', text: ' — Salesforce-native one-stop dashboard rolled out to TI Projects AEs (Dave Critchley, Erika Rhinehart, Joydip Mukherji) on September 30, 2025. Active devs and billing rates, opportunities, deals won, pipeline, and Tradeshow/Event leads — all filtered to Account Owner.' },
          { strong: 'Diagnosis of broken lead-to-opportunity attribution', text: ' — identified and documented the AE/SDR campaign overlap, lead duplication, and missing unique-identifier issues across Salesforce; proposed Email-ID-as-key and sister-campaign separation as the fixes.' },
        ]
      },
      {
        heading: 'My active growth area',
        prose: 'Honest answer: my biggest growth area this year was learning to walk into high-stakes leadership conversations with the strategic ask, recommendation, and stakeholder alignment already in motion — not just the substance. The shift from briefing senior leaders on what I have done to framing the one decision that needs to be made is the difference between IC4 work and IC6 work, and it is the part of the role I am most actively developing. The work this year has given me the substance; the next step is consistently turning that substance into the clearest possible recommendation, walked through with the right people, before the room gets together.'
      }
    ]
  },
  {
    id: 'q2',
    number: '02',
    title: 'Values in Action',
    subtitle: 'Provide an example of where you demonstrated our values most strongly, and an example of where you could have embodied them more.',
    bluf: 'Built the BFSI Platform to give senior leadership (Amar, Rahul) unified visibility today, with a longer-term path Amar sees of giving external BFSI clients limited access to their own account data — Client First and AI Forward intertwined. Could have brought my immediate team into the joy of the wins more deliberately — Work with Joy.',
    sections: [
      {
        heading: 'Where I demonstrated our values most strongly — Client First (and AI Forward, intertwined)',
        prose: 'The BFSI Master Platform is the cleanest example. Amar Duggal and Rahul Bora — senior leadership for the BFSI vertical — needed unified visibility into operations, but the data was scattered across at least four sheets, with brittle BigQuery connections, manual reconciliation, and no role-appropriate access for Finance vs Delivery vs Fulfillment. The most obvious move would have been to build a better spreadsheet. Instead I built the right artifact for what they actually needed: a real platform with role-gated views, live data, and a branded export. Amar sees a longer-term path where this platform becomes a true Client First tool — eventually giving external BFSI clients limited access to know everything about their respective accounts. The platform shipped on a startup-speed timeline because I treated it as a real product, not a side project.'
      },
      {
        heading: '',
        prose: 'It is also the strongest AI Forward example I have. The platform was built primarily by pair-programming with Claude (then migrated to Codex when Claude credits ran out — operational maturity around tool dependencies as much as tool usage). I used a structured self-DM in Slack as a long-context workspace to manage the build across sessions. The result: one IC delivered what would conventionally require analytics, frontend, and backend roles.'
      },
      {
        heading: 'Where I could have embodied them more — Work with Joy',
        prose: 'During the heaviest stretches of the platform build and weekly forecast cycles, I defaulted to grinding through alone. The Turing values say "loving the process is what makes it last" — I was loving the build, but I did not bring my immediate team (Shubhodhay, Michael) into the joy of the wins as deliberately as I could have. Going into next year I want to be more intentional about celebrating shipped work as a team event, not a private one. It is a small change but it changes the culture of how the work feels.'
      }
    ]
  },
  {
    id: 'q3',
    number: '03',
    title: 'AI Utilization and Impact',
    subtitle: 'How are you using AI to be more productive in your job, and what results have you seen?',
    bluf: 'AI is the foundation of how I work, not a tool I occasionally use. Pair-programmed a 4,658-line production React app, run long-context workspaces via self-DM, and automate recurring forecast pipelines. Result: ~3x volume vs last year, single IC.',
    sections: [
      {
        heading: 'Three concrete patterns',
        bullets: [
          { strong: 'Pair-programming a production application.', text: ' The BFSI Master Platform — a 4,658-line React app with Apps Script middleware, role-based access, six fully built modules, and PDF export — was built primarily through structured pair-programming with Claude, then migrated to Codex (OpenAI) when I hit Claude credits limits as a non-R&D user. The migration itself was a productivity moment: I learned to manage AI tool dependencies (versioning, context handoff, tool-switching mid-project) the same way an engineer manages framework dependencies.' },
          { strong: 'Long-context workspaces via self-DM.', text: ' For complex multi-session builds, I use a dedicated Slack DM to myself as a structured project log — every "context for new chat" handoff captures the full state (files built, sheet structure, role matrix, sensitive fields, next steps). This pattern reliably gets me back to full velocity in a new AI session in under a minute. It is the discipline that makes AI-driven multi-week builds actually possible.' },
          { strong: 'Automation of recurring analytical work.', text: ' Adopted Codex for automating forecast snapshot pipelines and trend-line accuracy tracking across multiple G Sheets — work that previously was manual every Monday. Similar patterns automating the Master Reporting Tracker refresh and the Apps Script middleware that powers the BFSI Platform.' },
        ]
      },
      {
        heading: 'Results',
        prose: 'I shipped a production platform in weeks, not months, while running a weekly forecast cadence and rolling out cross-channel reporting in parallel. The honest measure is that I produced this year roughly 3x the volume of work I produced last year, with higher complexity, as a single IC. AI is the reason that math works.'
      }
    ]
  },
]

const QUARTERS = [
  {
    id: 'q3-25',
    label: "Q3'25",
    period: 'Jul – Sep 2025',
    headline: 'Setting the foundation',
    initiatives: [
      { title: 'Ti Projects Sales Dashboard rollout', impact: 'Salesforce-native dashboard rolled out to TI Projects AEs on Sept 30, 2025 — Dave Critchley, Erika Rhinehart, Joydip Mukherji. Personalized walkthrough per AE, instant adoption.' },
      { title: 'Problem Solving call series', impact: 'Curated cross-functional analytical forum — Matching System walkthrough with Aneel, Marketing Team intros with Maya. Established a regular venue for cross-team alignment.' },
    ]
  },
  {
    id: 'q4-25',
    label: "Q4'25",
    period: 'Oct – Dec 2025',
    headline: 'Scaling outbound and fulfillment visibility',
    initiatives: [
      { title: 'Outbound Reporting Initiative', impact: 'Cross-channel reporting across SDR, AE, Job Recruiter, Paid Marketing, Email channels. Master Reporting Tracker with auto-refresh every 24 hours, live January 1, 2026.' },
      { title: 'Lead-to-opportunity attribution diagnosis', impact: 'Identified AE/SDR campaign overlap, lead duplication, and broken attribution. Proposed Email-ID-as-key and sister-campaign solutions with Madhan Kumar.' },
      { title: 'Fulfillment Funnel for Ivan', impact: 'Built Funnel by Reps (last 2 months + YTD), detailed Packets/Interview funnel views — partnered with Nishad Acharya.' },
      { title: 'Talent Active Devs / Starts / Stops dashboards', impact: 'AE-level metrics, Account-level Starts/Stops, Active Devs M-o-M for Rahul Bora. Worked through SF reconciliation issues.' },
      { title: '2026 Forecasting setup', impact: 'Aligned Olivia, Emily, Connor on BigQuery baseline issues — 80 misclassified Staff Aug devs, daily-hours assumptions, customer-rate source. Locked the model before year flip.' },
    ]
  },
  {
    id: 'q1-26',
    label: "Q1'26",
    period: 'Jan – Mar 2026',
    headline: 'Owning BFSI revenue forecasting',
    initiatives: [
      { title: 'BFSI quarterly forecast', impact: 'Q1\'26 actualized at $1.78M (Apollo $1.48M, ADS Securities $189K, BlackRock $112K). Q2\'26 forecast $2.91M; FY26 BFSI tracking to ~$10.65M total. Account and SOW-level breakdowns embedded into weekly review with Amar.' },
      { title: 'Churn and revenue analytics', impact: 'Churned-accounts pivot from January 2025 onward; Actuals vs Forecasted Revenue and Marketing Spend tabs added to dashboard sheet.' },
      { title: 'Salesforce Talent vs Projects reconciliation', impact: 'Cleanup across Rivian, CBRE, Aircall, Annalect — devs incorrectly tagged in either direction surfaced and corrected.' },
    ]
  },
  {
    id: 'q2-26',
    label: "Q2'26",
    period: 'Apr 2026 — QTD',
    headline: 'The IC6 leap: BFSI Master Platform',
    initiatives: [
      { title: 'BFSI Master Platform — shipped', impact: 'Live React platform with 6 modules, role-based access (Leadership/Finance/Fulfillment/Delivery), Apps Script middleware for live data, branded PDF burn-sheet export. Calibration loops with Amar and Rahul before each module shipped.', link: { url: 'https://bfsi-web-app.netlify.app/', label: 'View platform →' } },
      { title: 'Weekly BFSI forecast cadence', impact: 'Initiated April 15 — every week Amar gets a structured WoW delta with quarterly forecast, weekly change, commentary, and account-level breakdown. Caught the $585K CBRE shift to Emerging Org with a week of lead time.' },
      { title: 'BFSI board deck for Jon and senior leadership', impact: 'Co-built v1 with Amar and Rahul; partnered with Tara Hildabrant and Kal Bowers to brand-align. Sourced account-level wins narrative from Rahul Gupte for Apollo, BlackRock, Goldman Sachs.' },
      { title: 'BFSI dev tagging cleanup in COR sheet', impact: 'Corrected tagging across Apollo, BlackRock, Goldman, CBRE devs (TI Projects vs Bench) for consistent downstream finance reporting.' },
      { title: 'Daniel Harron alignment', impact: 'Initiated conversations to sync the BFSI Platform with the broader TI Platform roadmap — avoid duplicated effort, define integration path.' },
    ]
  },
]

// Numeric scale for status: Negative=1, WIP=2, Positive=3 — for the chart
const STATUS_SCORE = { negative: 1, wip: 2, positive: 3 }
const STATUS_LABEL = { negative: 'Was Negative', wip: 'In Progress', positive: 'Positive' }

const BENCHMARKS = [
  {
    name: 'Domain Knowledge',
    short: 'Domain',
    desc: 'Possesses deep functional expertise and organizational knowledge to identify, explain and drive decisions that impact entire function and influence the company\'s achievement of goals.',
    last: { status: 'wip', text: 'Lacked breadth initially, primarily focused on LLM Evals and Marketing analytics.' },
    now: { status: 'positive', text: 'Operating across Sales Operations, Revenue Forecasting, Finance reconciliation, Talent/Projects classification, and full-stack platform engineering. Carry the BFSI vertical\'s revenue model end-to-end and now act as the bridge between Finance, RevOps, Delivery, and engineering platforms.' },
  },
  {
    name: 'Impact',
    short: 'Impact',
    desc: 'Drives strategy and outcomes of the business; translating broad strategies into specific priorities and objectives. Actively plays a role in defining their function\'s multi-quarter strategic impact on Turing\'s roadmap.',
    last: { status: 'negative', text: 'Delivered strong tactical outcomes in Delivery but limited influence on strategic direction.' },
    now: { status: 'positive', text: 'BFSI Platform now part of the conversation with Daniel Harron about a unified TI Platform — shaping a multi-quarter platform roadmap. Weekly forecast cadence with Amar feeds into ELT business reviews. The BFSI board deck I co-built lands with Jon and senior leadership.' },
  },
  {
    name: 'Productivity',
    short: 'Productivity',
    desc: 'Leads projects that impact the company as a whole and push functions forward. Seen as a multiplier by consistently delivering ingenious solutions. Ability to design and execute a multi-year strategy/roadmap within their function.',
    last: { status: 'wip', text: 'Consistently executed impactful tasks, though multi-year strategic planning was limited.' },
    now: { status: 'positive', text: 'Shipped a production React platform (4,658 lines, live, role-gated, used by senior leadership) effectively in solo IC time using AI pair-programming. One IC delivering what would otherwise need analytics + frontend + backend — the multiplier definition.' },
  },
  {
    name: 'Communication',
    short: 'Communication',
    desc: 'Always knows the desired outcome before communicating, and has a clear communication path planned to achieve the outcome. Has stakeholder buy-in before they even know the problem/solution.',
    last: { status: 'wip', text: 'Needed guidance initially with stakeholder alignment and concise communication.' },
    now: { status: 'wip', text: 'Actively developing the executive presence to walk into senior leadership conversations with the recommendation, ask, and stakeholder pre-alignment already in motion — not just the substance. Stakeholder buy-in for the BFSI Platform pre-built via calibration loops with Amar and Rahul before each module shipped, which is the same pattern applied at the room scale.' },
  },
  {
    name: 'Autonomy',
    short: 'Autonomy',
    desc: 'Drives implementation and development of strategic priorities in coordination with Senior People Leaders. Prioritization may have a company-wide or roadmap function-wide impact.',
    last: { status: 'wip', text: 'Primarily executed predefined tasks; limited independent strategic initiative.' },
    now: { status: 'positive', text: 'Conceived, scoped, built, and shipped the BFSI Master Platform end-to-end without being assigned. Initiated the weekly BFSI forecast cadence with Amar without being asked. Drove the Outbound Reporting Initiative across 5 stakeholders without a project manager. Operating at the autonomy level the benchmark describes.' },
  },
]

const FEEDBACK = [
  { item: 'Brevity and clarity in written communication, especially with senior stakeholders', progress: 'Shifting from briefing senior leaders on completed work to framing the one decision that needs to be made — pre-aligned with the right stakeholders before the conversation. The BFSI Platform calibration loops with Amar and Rahul are an early example of this pattern in motion. My biggest active growth area.' },
  { item: 'Stakeholder collaboration before building', progress: 'Built the BFSI Platform module-by-module with calibration loops at each step. April 22 update to Rahul Bora is a clean example: shipped fixes for slow loading, drill-downs, and recruiting module updates the same day based on his direct feedback.' },
  { item: 'Adoption over output', progress: 'Internalized as the operating principle for the BFSI Platform. Weekly BFSI forecast cadence (initiated April 15) is the adoption vehicle — reporting structure that gets used every week, not a dashboard that sits idle.' },
  { item: 'Asking questions from a management PoV when building systems', progress: 'Self-flagged BigQuery baseline issues to Olivia/Emily/Connor before relying on them; questioned data lineage on the Vinal Mishra BFSI sheet before consuming it; structured the platform around role-based access from day one rather than retrofitting.' },
  { item: 'Minimize operational misses, handle errors effectively', progress: 'Built mandatory rate-type verification into monthly close workflow after April variance review. Documented step, not memory-based. Same systems thinking applied to platform data layer (sensitive-field stripping at server level).' },
]

const FORWARD_ASKS = [
  { title: 'Unified TI Platform partnership', text: 'Co-own the integration of the BFSI Platform with Daniel Harron\'s broader TI Platform — expand the role-based, live-data, branded-export pattern across other verticals (Emerging, Enterprise).' },
  { title: 'Forecast precision as a function-wide standard', text: 'Extend the weekly WoW cadence pattern to other verticals, with the BFSI variance-tracking workflow as the template.' },
  { title: 'AI-native operations as a discipline', text: 'Formalize the pair-programming and self-DM-workspace patterns that made this year\'s volume possible, and bring the rest of the RevOps team into the same operating model.' },
  { title: 'Executive presence as the last unblock', text: 'Move from delivering substance to leading the room. Walk into senior leadership conversations with the recommendation, the ask, and stakeholder alignment already pre-built. The growth area that matters most for IC6 effectiveness at the scope I\'m now operating at.' },
]

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function StatusChip({ status, size = 'md' }) {
  const Icon = status === 'positive' ? CheckCircle2 : status === 'wip' ? Clock : Circle
  return (
    <span className={`status-chip status-${status}`}>
      <Icon size={12} />
      {STATUS_LABEL[status]}
    </span>
  )
}

function Eyebrow({ children }) {
  return <div className="eyebrow-chip">{children}</div>
}

// ============================================================================
// SIDEBAR
// ============================================================================

function Sidebar({ active, setActive, mobileOpen, setMobileOpen, onDownload }) {
  return (
    <>
      <div className={`sidebar-overlay no-print ${mobileOpen ? 'show' : ''}`} onClick={() => setMobileOpen(false)} />

      <aside className={`sidebar no-print ${mobileOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img
              src={`${import.meta.env.BASE_URL}turing-logo.jpg`}
              alt="Turing"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-brand-title">Gaurav Kumar Singh</div>
            <div className="sidebar-brand-subtitle">FY 2025 / 26 · Year in Review</div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden"
            style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: 4 }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Section label */}
        <div className="sidebar-section-label">Sections</div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {SECTIONS.map((s) => {
            const Icon = s.icon
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`sidebar-link ${active === s.id ? 'active' : ''}`}
                onClick={() => { setActive(s.id); setMobileOpen(false) }}
              >
                <Icon size={18} className="sidebar-link-icon" />
                {s.label}
              </a>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button onClick={onDownload} className="sidebar-footer-button primary">
            <Download size={16} />
            Download as PDF
          </button>
          <a
            href="https://bfsi-web-app.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-footer-button"
            style={{ marginTop: 8, textDecoration: 'none' }}
          >
            <ExternalLink size={16} />
            View BFSI Platform
          </a>
        </div>
      </aside>
    </>
  )
}

function MobileTopBar({ setMobileOpen }) {
  return (
    <div className="mobile-topbar no-print">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <img
            src={`${import.meta.env.BASE_URL}turing-logo.jpg`}
            alt="Turing"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>Year in Review</div>
      </div>
      <button
        onClick={() => setMobileOpen(true)}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>
    </div>
  )
}

// ============================================================================
// SECTION 1: EXECUTIVE SUMMARY
// ============================================================================

function ExecSummary() {
  const [openTile, setOpenTile] = useState(null)

  // Close modal on Escape
  useEffect(() => {
    if (openTile === null) return
    const onKey = (e) => { if (e.key === 'Escape') setOpenTile(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openTile])

  return (
    <section id="summary" className="fade-up">
      <Eyebrow>FY 2025 / 26 · Annual Review</Eyebrow>

      <h1 className="section-title" style={{ fontSize: 'clamp(32px, 5vw, 52px)' }}>
        From building dashboards to shipping a platform and owning a vertical.
      </h1>

      <p className="section-subtitle" style={{ fontSize: 18, maxWidth: 880, marginBottom: 36 }}>
        FY25/26 was the year I expanded scope across three dimensions at once: shipped a production analytics platform for the BFSI vertical, took end-to-end ownership of its revenue forecast, and operationalized cross-channel reporting infrastructure that the business now runs on weekly.
      </p>

      {/* KPI Tiles — clickable, drilldown modals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 32 }}>
        {KPI_TILES.map((k, i) => {
          const Icon = k.icon
          return (
            <button
              key={i}
              onClick={() => setOpenTile(i)}
              className="kpi-tile clickable"
              type="button"
              aria-label={`Open detail for ${k.label}`}
            >
              <div className="kpi-header">
                <div className={`kpi-icon-square icon-square-${k.accent}`}>
                  <Icon size={16} />
                </div>
                <div className="kpi-label">{k.label}</div>
              </div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-sub">{k.sub}</div>
              <div className="kpi-drill">
                Click for drill-down
                <ChevronRight size={12} />
              </div>
            </button>
          )
        })}
      </div>

      {/* Modal */}
      {openTile !== null && (
        <DrilldownModal
          tile={KPI_TILES[openTile]}
          onClose={() => setOpenTile(null)}
        />
      )}

      {/* Headline win — BFSI link card (light treatment, not dark) */}
      <a
        href="https://bfsi-web-app.netlify.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="card"
        style={{
          display: 'block',
          textDecoration: 'none',
          color: 'inherit',
          padding: '32px 36px',
          borderColor: '#dce6fa',
          background: 'linear-gradient(135deg, #f8f8fe 0%, #ffffff 100%)',
          marginBottom: 32
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Sparkles size={14} style={{ color: '#2e6edf' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#2e6edf', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Headline Win</span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0f0f0f', letterSpacing: '-0.02em', marginBottom: 8 }}>
              BFSI Master Platform
            </h2>
            <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, maxWidth: 640, margin: 0 }}>
              Live React web app, six modules, role-gated access, Apps Script middleware for live data,
              branded PDF export. Used by Amar Duggal and Rahul Bora; in alignment conversations with the broader TI Platform.
            </p>
          </div>
          <div className="link-arrow" style={{ whiteSpace: 'nowrap' }}>
            View live platform <ArrowUpRight size={18} />
          </div>
        </div>
      </a>
    </section>
  )
}

// ============================================================================
// DRILLDOWN MODAL
// ============================================================================

function DrilldownModal({ tile, onClose }) {
  const Icon = tile.icon
  const d = tile.drilldown

  return (
    <Dialog.Root open={true} onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 15, 15, 0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease',
          }}
        />
        <Dialog.Content
          aria-describedby={undefined}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(100vw - 48px)',
            maxWidth: 720,
            maxHeight: 'calc(100vh - 48px)',
            background: 'white',
            borderRadius: 20,
            boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'modalScaleIn 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Header */}
          <div className="modal-header" style={{ flexShrink: 0 }}>
            <div className={`modal-header-icon icon-square-${tile.accent}`}>
              <Icon size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="modal-headline-value">
                {tile.value} · {tile.label}
              </div>
              <Dialog.Title asChild>
                <h3 className="modal-title">{d.title}</h3>
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="modal-close" aria-label="Close">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="modal-body" style={{ flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
            {d.blurb && <p className="modal-blurb">{d.blurb}</p>}

            {d.sections.map((sec, i) => (
              <div key={i} className="modal-section">
                {sec.heading && (
                  <div className="modal-section-heading">{sec.heading}</div>
                )}
                {sec.items && (
                  <ul className="modal-list">
                    {sec.items.map((item, j) => (
                      <li key={j} className="modal-list-item">
                        <ChevronRight size={14} className="modal-list-item-marker" />
                        <span><strong>{item.strong}</strong> — {item.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {d.cta && (
              <a
                href={d.cta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-cta"
              >
                {d.cta.label}
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          {/* Footer with Close button */}
          <div className="modal-footer" style={{ flexShrink: 0 }}>
            <Dialog.Close asChild>
              <button type="button" className="modal-footer-close">
                Close
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ============================================================================
// SECTION 2: THE THREE QUESTIONS
// ============================================================================

function QuestionCard({ q, expanded, onToggle }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
      <button
        onClick={onToggle}
        className="no-print"
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '28px 32px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 20,
          fontFamily: 'inherit'
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 700, color: '#dce6fa', lineHeight: 1, letterSpacing: '-0.03em', flexShrink: 0, marginTop: 4 }}>{q.number}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#0f0f0f', marginBottom: 8, letterSpacing: '-0.02em' }}>{q.title}</h3>
          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.55, marginBottom: 16, margin: '0 0 16px' }}>{q.subtitle}</p>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#f8f8fe', borderRadius: 10, padding: 14, border: '1px solid #dce6fa' }}>
            <span className="bluf-chip" style={{ flexShrink: 0, marginTop: 2 }}>BLUF</span>
            <p style={{ fontSize: 14, color: '#212121', lineHeight: 1.55, margin: 0 }}>{q.bluf}</p>
          </div>
        </div>
        <div style={{ flexShrink: 0, color: '#888', marginTop: 4 }}>
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {/* Print version of header */}
      <div className="print-only" style={{ padding: '24px 32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#2e6edf' }}>{q.number}</span>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f0f0f', margin: 0 }}>{q.title}</h3>
        </div>
        <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>{q.subtitle}</p>
        <div style={{ background: '#f8f8fe', border: '1px solid #dce6fa', borderRadius: 8, padding: 12, marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: '#212121', margin: 0 }}><strong>BLUF:</strong> {q.bluf}</p>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 32px 32px' }} className="fade-up">
          <div style={{ borderTop: '1px solid #ededed', paddingTop: 24 }}>
            {q.sections.map((sec, i) => (
              <div key={i} style={{ marginBottom: i === q.sections.length - 1 ? 0 : 24 }}>
                {sec.heading && (
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f0f0f', marginBottom: 12, letterSpacing: '-0.01em' }}>{sec.heading}</h4>
                )}
                {sec.prose && (
                  <p style={{ fontSize: 15, color: '#444', lineHeight: 1.7, margin: '0 0 12px' }}>{sec.prose}</p>
                )}
                {sec.bullets && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {sec.bullets.map((b, j) => (
                      <li key={j} style={{ fontSize: 15, color: '#444', lineHeight: 1.7, paddingLeft: 20, position: 'relative', marginBottom: 12 }}>
                        <span style={{ position: 'absolute', left: 0, top: 11, width: 6, height: 6, background: '#2e6edf', borderRadius: '50%' }}></span>
                        <span style={{ fontWeight: 700, color: '#0f0f0f' }}>{b.strong}</span>
                        <span>{b.text}</span>
                        {b.link && (
                          <a href={b.link.url} target="_blank" rel="noopener noreferrer" className="link-arrow" style={{ marginLeft: 4, fontSize: 14 }}>
                            {b.link.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print-only expanded content */}
      <div className="print-only" style={{ padding: '0 32px 24px' }}>
        <div style={{ borderTop: '1px solid #ededed', paddingTop: 16 }}>
          {q.sections.map((sec, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              {sec.heading && <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f0f0f', marginBottom: 8 }}>{sec.heading}</h4>}
              {sec.prose && <p style={{ fontSize: 12, color: '#444', lineHeight: 1.6, margin: '0 0 8px' }}>{sec.prose}</p>}
              {sec.bullets && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {sec.bullets.map((b, j) => (
                    <li key={j} style={{ fontSize: 12, color: '#444', lineHeight: 1.6, paddingLeft: 14, position: 'relative', marginBottom: 8 }}>
                      <span style={{ position: 'absolute', left: 0, top: 8, width: 4, height: 4, background: '#2e6edf', borderRadius: '50%' }}></span>
                      <strong style={{ color: '#0f0f0f' }}>{b.strong}</strong>{b.text}
                      {b.link && <span style={{ color: '#2e6edf' }}> ({b.link.url})</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function QuestionsSection() {
  const [expanded, setExpanded] = useState({ q1: true, q2: false, q3: false })
  const toggle = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }))

  return (
    <section id="questions" className="fade-up">
      <Eyebrow>The Three Questions</Eyebrow>

      <h2 className="section-title">What I'm answering, and how.</h2>
      <p className="section-subtitle" style={{ marginBottom: 32 }}>
        Each answer leads with a BLUF (Bottom Line Up Front) summary — the format I adopted this year as a direct response to Amar Duggal and Michael Wang's brevity coaching. Tap any card to expand.
      </p>

      <div>
        {QUESTIONS.map((q) => (
          <QuestionCard key={q.id} q={q} expanded={expanded[q.id]} onToggle={() => toggle(q.id)} />
        ))}
      </div>
    </section>
  )
}

// ============================================================================
// SECTION 3: THE YEAR IN MOTION
// ============================================================================

function YearInMotion() {
  const [active, setActive] = useState('q2-26')
  const activeQ = QUARTERS.find((q) => q.id === active)

  return (
    <section id="year" className="fade-up">
      <Eyebrow>The Year in Motion</Eyebrow>

      <h2 className="section-title">Foundation → Scale → Ownership → Platform.</h2>
      <p className="section-subtitle" style={{ marginBottom: 32 }}>Each quarter built directly on the last. Tap a quarter to see the initiatives shipped.</p>

      {/* Account-tab-style quarter selector */}
      <div className="account-tabs no-print" style={{ marginBottom: 24 }}>
        {QUARTERS.map((q) => (
          <button
            key={q.id}
            onClick={() => setActive(q.id)}
            className={`account-tab ${active === q.id ? 'active' : ''}`}
          >
            {q.label} <span style={{ fontWeight: 400, opacity: 0.7, marginLeft: 4 }}>· {q.period}</span>
          </button>
        ))}
      </div>

      {/* Active quarter card */}
      <div className="card no-print fade-up" key={active}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span className="bluf-chip">{activeQ.label}</span>
          <span style={{ fontSize: 13, color: '#666' }}>{activeQ.period}</span>
        </div>
        <h3 style={{ fontSize: 24, fontWeight: 700, color: '#0f0f0f', marginBottom: 24, letterSpacing: '-0.02em' }}>{activeQ.headline}</h3>
        <div>
          {activeQ.initiatives.map((init, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 16,
              paddingBottom: 18,
              marginBottom: 18,
              borderBottom: i === activeQ.initiatives.length - 1 ? 'none' : '1px solid #ededed'
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: '#e9f3ff',
                color: '#2e6edf', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, flexShrink: 0, marginTop: 2
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0f0f0f', marginBottom: 6 }}>{init.title}</div>
                <p style={{ fontSize: 14, color: '#444', lineHeight: 1.65, margin: 0 }}>{init.impact}</p>
                {init.link && (
                  <a href={init.link.url} target="_blank" rel="noopener noreferrer" className="link-arrow" style={{ marginTop: 8, display: 'inline-flex', fontSize: 13 }}>
                    {init.link.label}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print version: all quarters */}
      <div className="print-only">
        {QUARTERS.map((q) => (
          <div key={q.id} className="card" style={{ marginBottom: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="bluf-chip">{q.label}</span>
              <span style={{ fontSize: 12, color: '#666' }}>{q.period}</span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f0f0f', marginBottom: 12 }}>{q.headline}</h3>
            {q.initiatives.map((init, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#0f0f0f' }}>{init.title}</div>
                <p style={{ fontSize: 11, color: '#444', lineHeight: 1.5, margin: 0 }}>{init.impact}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

// ============================================================================
// SECTION 4: BENCHMARKS VS IC6 (with signature chart)
// ============================================================================

function BenchmarkChart() {
  const data = BENCHMARKS.map(b => ({
    name: b.short,
    'FY24/25': STATUS_SCORE[b.last.status],
    'FY25/26': STATUS_SCORE[b.now.status],
  }))

  // Custom tick rendering for the y-axis
  const yLabels = { 1: 'Negative', 2: 'WIP', 3: 'Positive' }

  const renderYTick = ({ x, y, payload }) => (
    <text x={x - 8} y={y + 4} fill="#666" fontSize={12} fontWeight={500} textAnchor="end" fontFamily="Poppins">
      {yLabels[payload.value] || ''}
    </text>
  )

  return (
    <div className="card" style={{ padding: 28, marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f0f0f', marginBottom: 4, letterSpacing: '-0.02em' }}>IC6 Benchmark Progression</h3>
          <p style={{ fontSize: 13, color: '#666', margin: 0 }}>FY24/25 (last year's self-assessment) vs FY25/26 (this year). Higher = closer to fully meeting the IC6 benchmark.</p>
        </div>
      </div>

      <div style={{ width: '100%', height: 320, marginTop: 24 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 24, right: 20, left: 30, bottom: 8 }} barCategoryGap="20%">
            <CartesianGrid stroke="#ededed" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={{ stroke: '#ededed' }}
              tickLine={false}
              tick={{ fill: '#444', fontSize: 12, fontFamily: 'Poppins', fontWeight: 500 }}
            />
            <YAxis
              domain={[0, 3]}
              ticks={[1, 2, 3]}
              tick={renderYTick}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #ededed',
                borderRadius: 8,
                fontFamily: 'Poppins',
                fontSize: 13,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
              }}
              formatter={(value) => [yLabels[value] || value, '']}
              cursor={{ fill: 'rgba(46,110,223,0.04)' }}
            />
            <Legend
              iconType="circle"
              iconSize={9}
              wrapperStyle={{ fontFamily: 'Poppins', fontSize: 13, fontWeight: 500, paddingTop: 12 }}
            />
            <Bar dataKey="FY24/25" fill="#a8ccf8" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="FY24/25" position="top" formatter={(v) => yLabels[v]} style={{ fill: '#666', fontSize: 11, fontFamily: 'Poppins', fontWeight: 600 }} />
            </Bar>
            <Bar dataKey="FY25/26" fill="#2f6ae3" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="FY25/26" position="top" formatter={(v) => yLabels[v]} style={{ fill: '#0f0f0f', fontSize: 11, fontFamily: 'Poppins', fontWeight: 700 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function BenchmarksSection() {
  return (
    <section id="benchmarks" className="fade-up">
      <Eyebrow>Benchmarks vs IC6</Eyebrow>

      <h2 className="section-title">Side-by-side: last year vs this year.</h2>
      <p className="section-subtitle" style={{ marginBottom: 32 }}>
        Same rubric I self-assessed against last year. Four of five benchmarks moved to <strong style={{ color: '#0f0f0f' }}>Positive</strong>. Communication remains the active growth area.
      </p>

      {/* Stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="kpi-tile" style={{ padding: 24 }}>
          <div className="kpi-label" style={{ marginBottom: 8 }}>BENCHMARKS AT POSITIVE</div>
          <div className="kpi-value" style={{ fontSize: 36, color: '#2e6edf' }}>4 / 5</div>
        </div>
        <div className="kpi-tile" style={{ padding: 24 }}>
          <div className="kpi-label" style={{ marginBottom: 8 }}>STATUSES IMPROVED YOY</div>
          <div className="kpi-value" style={{ fontSize: 36, color: '#41bfad' }}>+4</div>
        </div>
        <div className="kpi-tile" style={{ padding: 24 }}>
          <div className="kpi-label" style={{ marginBottom: 8 }}>ACTIVE GROWTH AREA</div>
          <div className="kpi-value" style={{ fontSize: 36, color: '#ed8138' }}>1</div>
        </div>
      </div>

      {/* Signature chart */}
      <BenchmarkChart />

      {/* Benchmark detail rows */}
      <div>
        {BENCHMARKS.map((b, i) => (
          <div key={i} className="card" style={{ marginBottom: 16, padding: 28 }}>
            <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #ededed' }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f0f0f', marginBottom: 8, letterSpacing: '-0.02em' }}>{b.name}</h3>
              <p style={{ fontSize: 13, color: '#888', fontStyle: 'italic', lineHeight: 1.6, margin: 0, maxWidth: 820 }}>{b.desc}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {/* Last year */}
              <div style={{ background: '#f8f8f8', borderRadius: 12, padding: 20, border: '1px solid #ededed' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase' }}>FY24/25</span>
                  <StatusChip status={b.last.status} />
                </div>
                <p style={{ fontSize: 14, color: '#444', lineHeight: 1.65, margin: 0 }}>{b.last.text}</p>
              </div>

              {/* This year */}
              <div style={{ background: '#f8f8fe', borderRadius: 12, padding: 20, border: '2px solid #2e6edf', position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: -10, left: 16,
                  background: '#2e6edf', color: 'white',
                  fontSize: 10, fontWeight: 700, padding: '3px 8px',
                  borderRadius: 4, letterSpacing: '0.1em', textTransform: 'uppercase'
                }}>This Year</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1c48bf', letterSpacing: '0.1em', textTransform: 'uppercase' }}>FY25/26</span>
                  <StatusChip status={b.now.status} />
                </div>
                <p style={{ fontSize: 14, color: '#212121', lineHeight: 1.65, margin: 0 }}>{b.now.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action items */}
      <div style={{ marginTop: 56 }}>
        <h3 style={{ fontSize: 24, fontWeight: 700, color: '#0f0f0f', marginBottom: 8, letterSpacing: '-0.02em' }}>Action items from last year</h3>
        <p style={{ fontSize: 15, color: '#666', marginBottom: 20, maxWidth: 820 }}>
          Direct response to the items from FY24/25's review and Michael's running coaching this year.
        </p>
        <div className="card" style={{ padding: 0 }}>
          {FEEDBACK.map((f, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: 24,
                padding: '20px 28px',
                borderBottom: i !== FEEDBACK.length - 1 ? '1px solid #ededed' : 'none'
              }}
              className="feedback-row"
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Action item</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f0f0f', lineHeight: 1.45 }}>{f.item}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#2e6edf', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Progress</div>
                <div style={{ fontSize: 14, color: '#444', lineHeight: 1.65 }}>{f.progress}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// SECTION 5: WHAT I'M ASKING FOR
// ============================================================================

function ForwardSection() {
  return (
    <section id="ahead" className="fade-up">
      <Eyebrow>Looking Ahead</Eyebrow>

      <h2 className="section-title">IC6 scope, formalized.</h2>
      <p className="section-subtitle">
        The work I shipped this year already operates at IC6 scope — multi-quarter strategic infrastructure, function-wide impact, and demonstrated multiplier effect. The promotion ask is to formalize that scope, not to grant new scope.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
        {FORWARD_ASKS.map((a, i) => (
          <div key={i} className="card" style={{ padding: 28 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: '#e9f3ff', color: '#2e6edf',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 15, marginBottom: 16, letterSpacing: '-0.02em'
            }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f0f0f', marginBottom: 8, letterSpacing: '-0.01em' }}>{a.title}</h3>
            <p style={{ fontSize: 14, color: '#444', lineHeight: 1.65, margin: 0 }}>{a.text}</p>
          </div>
        ))}
      </div>

      {/* Closing card — clean, light treatment */}
      <div className="card" style={{ padding: '40px 44px', background: 'linear-gradient(135deg, #f8f8fe 0%, #ffffff 100%)', borderColor: '#dce6fa' }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: '#0f0f0f', lineHeight: 1.35, marginBottom: 6, letterSpacing: '-0.02em' }}>
          Confident the work this year speaks for itself.
        </p>
        <p style={{ fontSize: 15, color: '#666', margin: '0 0 32px' }}>
          Looking forward to the conversation.
        </p>
        <div style={{
          paddingTop: 24, borderTop: '1px solid #dce6fa',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Gaurav Kumar Singh</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0f0f0f' }}>Senior Sales Operations Partner · Turing</div>
          </div>
          <a
            href="https://bfsi-web-app.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#2f6ae3', color: 'white',
              fontSize: 14, fontWeight: 600,
              padding: '12px 22px', borderRadius: 8,
              textDecoration: 'none',
              boxShadow: '0 0 8px rgba(47,106,227,0.4)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#004dc9'; e.currentTarget.style.boxShadow = '0 0 16px rgba(47,106,227,0.6)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#2f6ae3'; e.currentTarget.style.boxShadow = '0 0 8px rgba(47,106,227,0.4)' }}
          >
            View BFSI Platform
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// APP ROOT
// ============================================================================

export default function App() {
  const [active, setActive] = useState('summary')
  const [mobileOpen, setMobileOpen] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const handleDownload = async () => {
    // Lazy-load the PDF generator (keeps initial bundle small)
    const { generateReviewPDF } = await import('./pdfGenerator.js')
    generateReviewPDF({
      kpis: KPI_TILES,
      questions: QUESTIONS,
      quarters: QUARTERS,
      benchmarks: BENCHMARKS,
      forwardAsks: FORWARD_ASKS,
    })
  }

  return (
    <div>
      <Sidebar
        active={active}
        setActive={setActive}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onDownload={handleDownload}
      />

      <MobileTopBar setMobileOpen={setMobileOpen} />

      <main className="main">
        <div className="main-inner" ref={contentRef}>
          <ExecSummary />
          <QuestionsSection />
          <YearInMotion />
          <BenchmarksSection />
          <ForwardSection />

          <footer className="no-print" style={{
            marginTop: 96, paddingTop: 32, borderTop: '1px solid #ededed',
            textAlign: 'center', fontSize: 12, color: '#888'
          }}>
            <div>Built by Gaurav · FY 2025/26 Year in Review</div>
          </footer>
        </div>
      </main>
    </div>
  )
}
