import React, { useState, useRef, useEffect } from 'react'
import {
  LayoutDashboard, MessageSquareQuote, Calendar, Target, Compass,
  Download, ExternalLink, ChevronDown, ChevronRight, Menu, X,
  Code2, TrendingUp, Users, Sparkles, CheckCircle2, Clock, Circle, ArrowUpRight
} from 'lucide-react'

// ============================================================================
// DATA
// ============================================================================

const SECTIONS = [
  { id: 'summary',     label: 'Executive Summary', icon: LayoutDashboard },
  { id: 'questions',   label: 'The Three Questions', icon: MessageSquareQuote },
  { id: 'year',        label: 'The Year in Motion', icon: Calendar },
  { id: 'benchmarks',  label: 'Benchmarks vs IC6', icon: Target },
  { id: 'ahead',       label: "What I'm Asking For", icon: Compass },
]

const KPI_TILES = [
  { value: '1', unit: 'production platform shipped', sub: 'BFSI Master Platform — live, role-gated, used by senior leadership', icon: Code2, accent: 'blue-50' },
  { value: '$3.0M', unit: 'Q2\'26 BFSI revenue forecast owned', sub: 'Weekly WoW cadence to Amar Duggal, account-level variance reporting', icon: TrendingUp, accent: 'teal' },
  { value: '5+', unit: 'cross-functional initiatives without a PM', sub: 'Outbound Reporting, Talent Dashboards, Fulfillment Funnel, BFSI Platform, Forecast cadence', icon: Users, accent: 'indigo' },
  { value: '~3x', unit: 'volume of work vs FY24/25', sub: 'Higher complexity, single IC, AI-native operating model', icon: Sparkles, accent: 'violet' },
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
          { strong: 'BFSI Master Platform', text: ' — conceived, built, and shipped the live React web application with six modules (Revenue Forecast, Talent Pool, Recruiting, P&L, Burn Sheets, Delivery), role-based access (Leadership/Finance/TA/Delivery), live Google Sheets data via Apps Script middleware, and branded PDF burn-sheet export. Now in alignment conversations with Daniel Harron\'s broader TI Platform.', link: { url: 'https://bfsi-web-app.netlify.app/', label: 'View live →' } },
          { strong: 'BFSI revenue forecast ownership', text: ' — Q1\'26 locked at $2.21M (+$10.6K from new March devs); Q2\'26 90% case $3.43M, upside $4.07M. Initiated and now run a weekly WoW forecast cadence to Amar Duggal. April close completed with full account-level variance reporting (Apollo, BlackRock, ADS Securities).' },
          { strong: 'Outbound Reporting Initiative', text: ' — centralized cross-channel reporting across SDR cadences, AE cadences, Job Recruiter Campaigns, Paid Marketing, and Email; auto-refresh every 24 hours; operationalized January 1, 2026. Coordinated with Abhilash Kandwal, Aditya Bam, Madhan Kumar, and Kal Bowers without a project manager.' },
          { strong: 'Ti Projects Sales Dashboard', text: ' — Salesforce-native one-stop dashboard rolled out to TI Projects AEs (Dave Critchley, Erika Rhinehart, Joydip Mukherji) on September 30, 2025. Active devs and billing rates, opportunities, deals won, pipeline, and Tradeshow/Event leads — all filtered to Account Owner.' },
          { strong: 'Diagnosis of broken lead-to-opportunity attribution', text: ' — identified and documented the AE/SDR campaign overlap, lead duplication, and missing unique-identifier issues across Salesforce; proposed Email-ID-as-key and sister-campaign separation as the fixes.' },
        ]
      },
      {
        heading: 'Where I fell short',
        prose: "Honest answer: written brevity, especially with senior stakeholders. Michael flagged this in March — \"the message is well written, the main thing is it could be shortened... Amar is very busy and doesn\u2019t want to read a super long message.\" I have been actively working on it and have adopted a Bottom-Line-Up-Front (BLUF) format — every major update now leads with [Topic | Date], a one-line summary, then details. The structure is now consistent; the length is still longer than it should be. This remains my most active iteration loop."
      }
    ]
  },
  {
    id: 'q2',
    number: '02',
    title: 'Values in Action',
    subtitle: 'Provide an example of where you demonstrated our values most strongly, and an example of where you could have embodied them more.',
    bluf: 'Built the BFSI Platform because the client (Amar, Rahul, the BFSI vertical) needed it — Client First and AI Forward intertwined. Could have brought my immediate team into the joy of the wins more deliberately — Work with Joy.',
    sections: [
      {
        heading: 'Where I demonstrated our values most strongly — Client First (and AI Forward, intertwined)',
        prose: 'The BFSI Master Platform is the cleanest example. Amar Duggal and Rahul Bora needed unified visibility into BFSI operations, but the data was scattered across at least four sheets, with brittle BigQuery connections, manual reconciliation, and no role-appropriate access for Finance vs Delivery vs TA. The most obvious move would have been to build a better spreadsheet. Instead I built the right artifact for what they actually needed: a real platform with role-gated views, live data, and a branded export they can share with their clients\u2019 executive teams. The platform exists because the client needed it to exist, and shipped on a startup-speed timeline because I treated it as a real product, not a side project.'
      },
      {
        heading: '',
        prose: 'It is also the strongest AI Forward example I have. The platform was built primarily by pair-programming with Claude (then migrated to Codex when Claude credits ran out — operational maturity around tool dependencies as much as tool usage). I used a structured self-DM in Slack as a long-context workspace to manage the build across sessions. The result: one IC delivered what would conventionally require analytics, frontend, and backend roles.'
      },
      {
        heading: 'Where I could have embodied them more — Work with Joy',
        prose: 'During the heaviest stretches of the platform build and weekly forecast cycles, I defaulted to grinding through alone. The values doc says "loving the process is what makes it last" — I was loving the build, but I did not bring my immediate team (Shubhodhay, Michael) into the joy of the wins as deliberately as I could have. Going into next year I want to be more intentional about celebrating shipped work as a team event, not a private one. It is a small change but it changes the culture of how the work feels.'
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
      { title: 'BFSI quarterly forecast', impact: 'Q1\'26 locked at $2.21M (+$10.6K from new March devs); Q2\'26 90% case $3.43M, upside $4.07M. Account and SOW-level breakdowns embedded into weekly review with Amar.' },
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
      { title: 'BFSI Master Platform — shipped', impact: 'Live React platform with 6 modules, role-based access (Leadership/Finance/TA/Delivery), Apps Script middleware for live data, branded PDF burn-sheet export. Calibration loops with Amar and Rahul before each module shipped.', link: { url: 'https://bfsi-web-app.netlify.app/', label: 'View platform →' } },
      { title: 'Weekly BFSI forecast cadence', impact: 'Initiated April 15 — every week Amar gets a structured WoW delta with quarterly forecast, weekly change, commentary, and account-level breakdown. Caught the $585K CBRE shift to Emerging Org with a week of lead time.' },
      { title: 'BFSI board deck for Jon and senior leadership', impact: 'Co-built v1 with Amar and Rahul; partnered with Tara Hildabrant and Kal Bowers to brand-align. Sourced account-level wins narrative from Rahul Gupte for Apollo, BlackRock, Goldman Sachs.' },
      { title: 'BFSI dev tagging cleanup in COR sheet', impact: 'Corrected tagging across Apollo, BlackRock, Goldman, CBRE devs (TI Projects vs Bench) for consistent downstream finance reporting.' },
      { title: 'Daniel Harron alignment', impact: 'Initiated conversations to sync the BFSI Platform with the broader TI Platform roadmap — avoid duplicated effort, define integration path.' },
    ]
  },
]

const BENCHMARKS = [
  {
    name: 'Domain Knowledge',
    desc: 'Possesses deep functional expertise and organizational knowledge to identify, explain and drive decisions that impact entire function and influence the company\'s achievement of goals.',
    last: { status: 'wip', text: 'Lacked breadth initially, primarily focused on LLM Evals and Marketing analytics.' },
    now: { status: 'positive', text: 'Operating across Sales Operations, Revenue Forecasting, Finance reconciliation, Talent/Projects classification, and full-stack platform engineering. Carry the BFSI vertical\'s revenue model end-to-end and now act as the bridge between Finance, RevOps, Delivery, and engineering platforms.' },
  },
  {
    name: 'Impact',
    desc: 'Drives strategy and outcomes of the business; translating broad strategies into specific priorities and objectives. Actively plays a role in defining their function\'s multi-quarter strategic impact on Turing\'s roadmap.',
    last: { status: 'negative', text: 'Delivered strong tactical outcomes in Delivery but limited influence on strategic direction.' },
    now: { status: 'positive', text: 'BFSI Platform now part of the conversation with Daniel Harron about a unified TI Platform — shaping a multi-quarter platform roadmap. Weekly forecast cadence with Amar feeds into ELT business reviews. The BFSI board deck I co-built lands with Jon and senior leadership.' },
  },
  {
    name: 'Productivity',
    desc: 'Leads projects that impact the company as a whole and push functions forward. Seen as a multiplier by consistently delivering ingenious solutions. Ability to design and execute a multi-year strategy/roadmap within their function.',
    last: { status: 'wip', text: 'Consistently executed impactful tasks, though multi-year strategic planning was limited.' },
    now: { status: 'positive', text: 'Shipped a production React platform (4,658 lines, live, role-gated, used by senior leadership) effectively in solo IC time using AI pair-programming. One IC delivering what would otherwise need analytics + frontend + backend — the multiplier definition.' },
  },
  {
    name: 'Communication',
    desc: 'Always knows the desired outcome before communicating, and has a clear communication path planned to achieve the outcome. Has stakeholder buy-in before they even know the problem/solution.',
    last: { status: 'wip', text: 'Needed guidance initially with stakeholder alignment and concise communication.' },
    now: { status: 'wip', text: 'Adopted a Bottom-Line-Up-Front (BLUF) writing pattern — every major update now leads with [Topic | Date], a one-line headline, then details. Still iterating on length, but the structure is in place. Stakeholder buy-in pre-built for the BFSI Platform via calibration loops with Amar/Rahul before each module shipped.' },
  },
  {
    name: 'Autonomy',
    desc: 'Drives implementation and development of strategic priorities in coordination with Senior People Leaders. Prioritization may have a company-wide or roadmap function-wide impact.',
    last: { status: 'wip', text: 'Primarily executed predefined tasks; limited independent strategic initiative.' },
    now: { status: 'positive', text: 'Conceived, scoped, built, and shipped the BFSI Master Platform end-to-end without being assigned. Initiated the weekly BFSI forecast cadence with Amar without being asked. Drove the Outbound Reporting Initiative across 5 stakeholders without a project manager. Operating at the autonomy level the benchmark describes.' },
  },
]

const FEEDBACK = [
  {
    item: 'Brevity in written communication, especially with senior stakeholders',
    progress: 'Adopted a Bottom-Line-Up-Front (BLUF) format for all updates: messages now lead with [Topic | Date], a one-line headline summary, then details. Continuing to refine length. My biggest active growth area.'
  },
  {
    item: 'Stakeholder collaboration before building',
    progress: 'Built the BFSI Platform module-by-module with calibration loops at each step. April 22 update to Rahul Bora is a clean example: shipped fixes for slow loading, drill-downs, and recruiting module updates the same day based on his direct feedback.'
  },
  {
    item: 'Adoption over output',
    progress: 'Internalized as the operating principle for the BFSI Platform. Weekly BFSI forecast cadence (initiated April 15) is the adoption vehicle — reporting structure that gets used every week, not a dashboard that sits idle. Initiating co-launch syncs with Daniel Harron rather than building in parallel.'
  },
  {
    item: 'Asking questions from a management PoV when building systems',
    progress: 'Self-flagged BigQuery baseline issues to Olivia/Emily/Connor before relying on them; questioned data lineage on the Vinal Mishra BFSI sheet before consuming it; structured the platform around role-based access from day one rather than retrofitting.'
  },
  {
    item: 'Minimize operational misses, handle errors effectively',
    progress: 'Built mandatory rate-type verification into monthly close workflow after April variance review. Documented step, not memory-based. Same systems thinking applied to platform data layer (sensitive-field stripping at server level).'
  },
]

const FORWARD_ASKS = [
  { title: 'Unified TI Platform partnership', text: 'Co-own the integration of the BFSI Platform with Daniel Harron\'s broader TI Platform — expand the role-based, live-data, branded-export pattern across other verticals (Emerging, Enterprise).' },
  { title: 'Forecast precision as a function-wide standard', text: 'Extend the weekly WoW cadence pattern to other verticals, with the BFSI variance-tracking workflow as the template.' },
  { title: 'AI-native operations as a discipline', text: 'Formalize the pair-programming and self-DM-workspace patterns that made this year\'s volume possible, and bring the rest of the RevOps team into the same operating model.' },
  { title: 'Communication as the last unblock', text: 'Get from "BLUF format adopted" to "length consistently right for senior stakeholders." Concrete, measurable, and the one growth area that matters most for IC6 effectiveness at the scope I\'m now operating at.' },
]

// ============================================================================
// COMPONENTS
// ============================================================================

function StatusChip({ status }) {
  const map = {
    positive: { label: 'Positive', cls: 'status-positive', Icon: CheckCircle2 },
    wip:      { label: 'In Progress', cls: 'status-wip', Icon: Clock },
    negative: { label: 'Was Negative', cls: 'status-negative', Icon: Circle },
  }
  const { label, cls, Icon } = map[status] || map.wip
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-12 font-medium ${cls}`}>
      <Icon size={12} />
      {label}
    </span>
  )
}

function Sidebar({ active, setActive, mobileOpen, setMobileOpen, onDownload }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-gray-0/50 z-40 no-print" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`
        no-print fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-90
        flex flex-col z-50 transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-blue-40 flex items-center justify-center text-white font-semibold text-18 shadow-hero">
                G
              </div>
              <div>
                <div className="font-semibold text-14 text-gray-0 leading-tight">Gaurav Kumar Singh</div>
                <div className="text-12 text-gray-40 leading-tight">Year in Review</div>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-gray-40 hover:text-gray-0 p-1"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {SECTIONS.map((s) => {
            const Icon = s.icon
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`nav-link ${active === s.id ? 'active' : ''}`}
                onClick={() => { setActive(s.id); setMobileOpen(false) }}
              >
                <Icon size={18} />
                {s.label}
              </a>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-90 space-y-3">
          <button
            onClick={onDownload}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-40 hover:bg-blue-30 text-white text-14 font-medium px-4 py-2.5 rounded-md transition-all shadow-hero hover:shadow-cta"
          >
            <Download size={16} />
            Download as PDF
          </button>
          <div className="text-12 text-gray-50 text-center">
            FY 2025/26 · Promotion: IC4 → IC6
          </div>
        </div>
      </aside>
    </>
  )
}

function MobileTopBar({ setMobileOpen }) {
  return (
    <div className="no-print lg:hidden sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-gray-90 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-blue-40 flex items-center justify-center text-white font-semibold text-14">G</div>
        <div className="font-medium text-14 text-gray-0">Year in Review</div>
      </div>
      <button onClick={() => setMobileOpen(true)} className="text-gray-30 p-1" aria-label="Open menu">
        <Menu size={22} />
      </button>
    </div>
  )
}

function ExecSummary() {
  return (
    <section id="summary" className="pt-12 pb-20 lg:pt-16 lg:pb-28 fade-up">
      <div className="max-w-5xl">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-6">
          <span className="bluf-chip">FY 2025 / 26</span>
          <span className="text-13 text-gray-40">Senior Sales Operations Partner · Manager: Michael Wang</span>
        </div>

        {/* Hero headline */}
        <h1 className="text-34 md:text-46 lg:text-56 font-medium text-gray-0 leading-tight tracking-negative-2.4 mb-6">
          From building dashboards<br />
          to <span className="gradient-text">shipping a platform</span><br />
          and owning a vertical.
        </h1>

        <p className="text-18 lg:text-20 text-gray-30 leading-relaxed mb-12 max-w-3xl">
          FY25/26 was the year I expanded scope across three dimensions at once: shipped a production analytics platform for the BFSI vertical, took end-to-end ownership of its revenue forecast, and operationalized cross-channel reporting infrastructure that the business now runs on weekly.
        </p>

        {/* Headline win callout — link to BFSI platform */}
        <a
          href="https://bfsi-web-app.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-deploy-ai-card rounded-lg p-8 lg:p-10 mb-16 text-white border border-gray-20 hover:shadow-blue-glow transition-all group"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-blue-60" />
                <span className="text-12 font-semibold text-blue-60 uppercase tracking-wider">Headline Win</span>
              </div>
              <h2 className="text-24 lg:text-30 font-medium mb-2">BFSI Master Platform</h2>
              <p className="text-14 lg:text-16 text-gray-60 max-w-2xl">
                Live React web app, six modules, role-gated access, Apps Script middleware for live data,
                branded PDF export. Used by Amar Duggal and Rahul Bora; in alignment conversations with the broader TI Platform.
              </p>
            </div>
            <div className="flex items-center gap-2 text-blue-60 font-medium text-14 group-hover:translate-x-1 transition-transform whitespace-nowrap">
              View live platform
              <ArrowUpRight size={18} />
            </div>
          </div>
        </a>

        {/* KPI tiles */}
        <h3 className="text-20 font-medium text-gray-0 mb-6 tracking-negative">By the numbers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {KPI_TILES.map((k, i) => {
            const Icon = k.icon
            return (
              <div key={i} className="kpi-tile">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center bg-blue-95`}>
                    <Icon size={20} className="text-blue-50" />
                  </div>
                </div>
                <div className="text-44 font-medium text-gray-0 leading-none mb-2 tracking-tight">{k.value}</div>
                <div className="text-14 font-medium text-gray-30 mb-2">{k.unit}</div>
                <div className="text-13 text-gray-40 leading-relaxed">{k.sub}</div>
              </div>
            )
          })}
        </div>

        {/* Promotion thesis */}
        <div className="card p-8 lg:p-10">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-blue-50" />
            <span className="text-12 font-semibold text-blue-50 uppercase tracking-wider">The Promotion Ask</span>
          </div>
          <p className="text-16 lg:text-18 text-gray-20 leading-relaxed">
            Last year I asked for the IC4 → IC6 jump on the strength of the Marketing Gem and Salesforce automation work. This year I am asking for the same level on the strength of having shipped the kind of multi-quarter, multi-stakeholder, function-shaping infrastructure that defines IC6 work at Turing.
          </p>
        </div>
      </div>
    </section>
  )
}

function QuestionCard({ q, expanded, onToggle }) {
  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left p-6 lg:p-8 flex items-start gap-4 hover:bg-gray-97 transition-colors no-print"
      >
        <div className="text-46 font-medium text-blue-90 leading-none mt-1 shrink-0">{q.number}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-20 lg:text-24 font-medium text-gray-0 mb-2 tracking-negative">{q.title}</h3>
          <p className="text-13 text-gray-40 leading-relaxed mb-4">{q.subtitle}</p>
          <div className="flex items-start gap-2 bg-blue-95 rounded-md p-3 border border-blue-90">
            <span className="bluf-chip shrink-0 mt-0.5">BLUF</span>
            <p className="text-14 text-gray-20 leading-relaxed">{q.bluf}</p>
          </div>
        </div>
        <div className="shrink-0 mt-2 text-gray-50">
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {/* Print-only header (always shown when printed) */}
      <div className="hidden print-only px-6 pt-6">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-24 font-medium text-blue-50">{q.number}</span>
          <h3 className="text-20 font-medium text-gray-0">{q.title}</h3>
        </div>
        <p className="text-13 text-gray-40 mb-4">{q.subtitle}</p>
        <div className="bg-blue-95 rounded-md p-3 border border-blue-90 mb-4">
          <p className="text-14 text-gray-20"><strong>BLUF:</strong> {q.bluf}</p>
        </div>
      </div>

      {(expanded || false) && (
        <div className="px-6 lg:px-8 pb-8 fade-up">
          <div className="border-t border-gray-90 pt-6 space-y-6">
            {q.sections.map((sec, i) => (
              <div key={i}>
                {sec.heading && (
                  <h4 className="text-16 font-semibold text-gray-0 mb-3 tracking-negative">{sec.heading}</h4>
                )}
                {sec.prose && (
                  <p className="text-15 text-gray-30 leading-relaxed mb-3">{sec.prose}</p>
                )}
                {sec.bullets && (
                  <ul className="space-y-3">
                    {sec.bullets.map((b, j) => (
                      <li key={j} className="text-15 text-gray-30 leading-relaxed pl-5 relative">
                        <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-blue-50 rounded-full"></span>
                        <span className="font-semibold text-gray-0">{b.strong}</span>
                        <span>{b.text}</span>
                        {b.link && (
                          <a href={b.link.url} target="_blank" rel="noopener noreferrer"
                             className="ml-1 inline-flex items-center gap-1 text-blue-50 hover:text-blue-30 font-medium whitespace-nowrap">
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
      <div className="hidden print-only px-6 pb-6">
        <div className="border-t border-gray-90 pt-4 space-y-4">
          {q.sections.map((sec, i) => (
            <div key={i}>
              {sec.heading && <h4 className="text-14 font-semibold text-gray-0 mb-2">{sec.heading}</h4>}
              {sec.prose && <p className="text-13 text-gray-30 mb-2">{sec.prose}</p>}
              {sec.bullets && (
                <ul className="space-y-2">
                  {sec.bullets.map((b, j) => (
                    <li key={j} className="text-13 text-gray-30 pl-4 relative">
                      <span className="absolute left-0 top-1.5 w-1 h-1 bg-blue-50 rounded-full"></span>
                      <strong className="text-gray-0">{b.strong}</strong>{b.text}
                      {b.link && <span className="text-blue-50"> ({b.link.url})</span>}
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
    <section id="questions" className="py-16 lg:py-24 border-t border-gray-90 fade-up">
      <div className="max-w-5xl">
        <div className="mb-10">
          <span className="bluf-chip mb-4 inline-flex">The Three Questions</span>
          <h2 className="text-30 lg:text-46 font-medium text-gray-0 mb-4 tracking-negative">
            What I'm answering, and how.
          </h2>
          <p className="text-16 lg:text-18 text-gray-40 max-w-3xl leading-relaxed">
            Each answer leads with a BLUF (Bottom Line Up Front) summary — the format I adopted this year as a direct response to Michael's brevity coaching. Tap any card to expand.
          </p>
        </div>

        <div className="space-y-5">
          {QUESTIONS.map((q) => (
            <QuestionCard key={q.id} q={q} expanded={expanded[q.id]} onToggle={() => toggle(q.id)} />
          ))}
        </div>
      </div>
    </section>
  )
}

function YearInMotion() {
  const [active, setActive] = useState('q2-26')
  const activeQ = QUARTERS.find((q) => q.id === active)

  return (
    <section id="year" className="py-16 lg:py-24 border-t border-gray-90 fade-up">
      <div className="max-w-5xl">
        <div className="mb-10">
          <span className="bluf-chip mb-4 inline-flex">The Year in Motion</span>
          <h2 className="text-30 lg:text-46 font-medium text-gray-0 mb-4 tracking-negative">
            Foundation → Scale → Ownership → Platform.
          </h2>
          <p className="text-16 lg:text-18 text-gray-40 max-w-3xl leading-relaxed">
            Each quarter built directly on the last. Tap a quarter to see the initiatives shipped.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mb-10 no-print">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-blue-90 -translate-y-1/2"></div>
          <div className="relative flex justify-between">
            {QUARTERS.map((q) => (
              <button
                key={q.id}
                onClick={() => setActive(q.id)}
                className="flex flex-col items-center gap-3 group"
              >
                <div className={`timeline-dot ${active === q.id ? 'active' : 'inactive'}`}></div>
                <div className="text-center">
                  <div className={`text-14 font-semibold transition-colors ${active === q.id ? 'text-blue-30' : 'text-gray-40 group-hover:text-gray-0'}`}>
                    {q.label}
                  </div>
                  <div className="text-11 text-gray-50 hidden md:block">{q.period}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active quarter card */}
        <div className="card p-6 lg:p-10 fade-up no-print" key={active}>
          <div className="flex items-center gap-3 mb-6">
            <span className="bluf-chip">{activeQ.label}</span>
            <span className="text-13 text-gray-40">{activeQ.period}</span>
          </div>
          <h3 className="text-24 lg:text-28 font-medium text-gray-0 mb-8 tracking-negative">{activeQ.headline}</h3>
          <div className="space-y-5">
            {activeQ.initiatives.map((init, i) => (
              <div key={i} className="flex gap-4 pb-5 border-b border-gray-90 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-md bg-blue-95 text-blue-50 flex items-center justify-center font-semibold text-14 shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-15 lg:text-16 text-gray-0 mb-1.5">{init.title}</div>
                  <p className="text-14 text-gray-30 leading-relaxed">{init.impact}</p>
                  {init.link && (
                    <a href={init.link.url} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1 mt-2 text-13 text-blue-50 hover:text-blue-30 font-medium">
                      {init.link.label}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Print-only: show all quarters */}
        <div className="hidden print-only space-y-6">
          {QUARTERS.map((q) => (
            <div key={q.id} className="card p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="bluf-chip">{q.label}</span>
                <span className="text-13 text-gray-40">{q.period}</span>
              </div>
              <h3 className="text-18 font-medium text-gray-0 mb-4">{q.headline}</h3>
              <div className="space-y-3">
                {q.initiatives.map((init, i) => (
                  <div key={i}>
                    <div className="font-semibold text-13 text-gray-0">{init.title}</div>
                    <p className="text-12 text-gray-30">{init.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BenchmarksSection() {
  return (
    <section id="benchmarks" className="py-16 lg:py-24 border-t border-gray-90 fade-up">
      <div className="max-w-6xl">
        <div className="mb-10">
          <span className="bluf-chip mb-4 inline-flex">Benchmarks vs IC6</span>
          <h2 className="text-30 lg:text-46 font-medium text-gray-0 mb-4 tracking-negative">
            Side-by-side: last year vs this year.
          </h2>
          <p className="text-16 lg:text-18 text-gray-40 max-w-3xl leading-relaxed">
            Same rubric I self-assessed against last year. Four of five benchmarks moved to <span className="font-semibold text-gray-0">Positive</span>. Communication remains the active growth area.
          </p>
        </div>

        {/* Summary stat strip */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="card p-5 text-center">
            <div className="text-34 font-medium text-blue-50 leading-none mb-1">4</div>
            <div className="text-12 text-gray-40">Benchmarks at Positive</div>
          </div>
          <div className="card p-5 text-center">
            <div className="text-34 font-medium text-orange leading-none mb-1">1</div>
            <div className="text-12 text-gray-40">Active growth area</div>
          </div>
          <div className="card p-5 text-center">
            <div className="text-34 font-medium text-teal leading-none mb-1">+4</div>
            <div className="text-12 text-gray-40">Statuses improved YoY</div>
          </div>
        </div>

        {/* Benchmark rows */}
        <div className="space-y-5">
          {BENCHMARKS.map((b, i) => (
            <div key={i} className="card p-6 lg:p-8">
              {/* Header row */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 pb-5 border-b border-gray-90">
                <div className="flex-1">
                  <h3 className="text-20 lg:text-24 font-medium text-gray-0 mb-2 tracking-negative">{b.name}</h3>
                  <p className="text-13 text-gray-50 italic leading-relaxed max-w-3xl">{b.desc}</p>
                </div>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Last year */}
                <div className="bg-gray-97 rounded-lg p-5 border border-gray-90">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-11 font-semibold text-gray-50 uppercase tracking-wider">FY24/25</span>
                    <StatusChip status={b.last.status} />
                  </div>
                  <p className="text-14 text-gray-30 leading-relaxed">{b.last.text}</p>
                </div>

                {/* This year */}
                <div className="bg-blue-97 rounded-lg p-5 border-2 border-blue-50 relative">
                  <div className="absolute -top-2.5 left-4 bg-blue-50 text-white text-10 font-semibold px-2 py-0.5 rounded uppercase tracking-wider">This year</div>
                  <div className="flex items-center justify-between mb-3 mt-1">
                    <span className="text-11 font-semibold text-blue-30 uppercase tracking-wider">FY25/26</span>
                    <StatusChip status={b.now.status} />
                  </div>
                  <p className="text-14 text-gray-20 leading-relaxed">{b.now.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Manager Feedback embedded here */}
        <div className="mt-16">
          <h3 className="text-24 lg:text-28 font-medium text-gray-0 mb-3 tracking-negative">Action items from last year</h3>
          <p className="text-15 text-gray-40 mb-6 max-w-3xl">Direct response to the items from FY24/25's review and Michael's running coaching this year.</p>
          <div className="card overflow-hidden">
            {FEEDBACK.map((f, i) => (
              <div key={i} className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-5 lg:p-6 ${i !== FEEDBACK.length - 1 ? 'border-b border-gray-90' : ''}`}>
                <div className="md:col-span-1">
                  <div className="text-11 font-semibold text-gray-50 uppercase tracking-wider mb-1">Action item</div>
                  <div className="text-14 font-medium text-gray-0 leading-snug">{f.item}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-11 font-semibold text-blue-50 uppercase tracking-wider mb-1">Progress</div>
                  <div className="text-14 text-gray-30 leading-relaxed">{f.progress}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ForwardSection() {
  return (
    <section id="ahead" className="py-16 lg:py-24 border-t border-gray-90 fade-up">
      <div className="max-w-5xl">
        <div className="mb-10">
          <span className="bluf-chip mb-4 inline-flex">Looking Ahead</span>
          <h2 className="text-30 lg:text-46 font-medium text-gray-0 mb-4 tracking-negative">
            IC6 scope, formalized.
          </h2>
          <p className="text-16 lg:text-18 text-gray-40 max-w-3xl leading-relaxed">
            The work I shipped this year already operates at IC6 scope — multi-quarter strategic infrastructure, function-wide impact, and demonstrated multiplier effect. The promotion ask is to formalize that scope, not to grant new scope.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {FORWARD_ASKS.map((a, i) => (
            <div key={i} className="card p-6 lg:p-7">
              <div className="w-10 h-10 rounded-md bg-blue-95 text-blue-50 flex items-center justify-center font-semibold text-16 mb-4">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="text-18 font-medium text-gray-0 mb-2 tracking-negative">{a.title}</h3>
              <p className="text-14 text-gray-30 leading-relaxed">{a.text}</p>
            </div>
          ))}
        </div>

        {/* Closing dark hero */}
        <div className="bg-deploy-ai-card rounded-lg p-8 lg:p-12 text-white border border-gray-20">
          <p className="text-18 lg:text-24 font-medium leading-relaxed mb-2 tracking-negative">
            Confident the work this year speaks for itself.
          </p>
          <p className="text-14 lg:text-16 text-gray-60">
            Looking forward to the conversation.
          </p>
          <div className="mt-8 pt-8 border-t border-gray-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-12 text-gray-60 uppercase tracking-wider mb-1">Gaurav Kumar Singh</div>
              <div className="text-16 font-medium">Senior Sales Operations Partner · Turing</div>
            </div>
            <a
              href="https://bfsi-web-app.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-40 hover:bg-blue-30 text-white text-14 font-medium px-5 py-2.5 rounded-md transition-all shadow-hero hover:shadow-cta whitespace-nowrap"
            >
              View BFSI Platform
              <ExternalLink size={14} />
            </a>
          </div>
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

  // Scroll-spy for nav active state
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
    // Lazy-load html2pdf only when needed (keeps initial bundle small)
    const html2pdfModule = await import('html2pdf.js')
    const html2pdf = html2pdfModule.default

    // Expand all question cards before printing — done via a CSS class on body
    document.body.classList.add('printing')

    const element = contentRef.current
    const opt = {
      margin: [10, 10, 10, 10],
      filename: 'Gaurav_Kumar_Singh_Year_in_Review_FY25-26.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    }

    try {
      await html2pdf().set(opt).from(element).save()
    } finally {
      document.body.classList.remove('printing')
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-0">
      <Sidebar
        active={active}
        setActive={setActive}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onDownload={handleDownload}
      />

      <MobileTopBar setMobileOpen={setMobileOpen} />

      <main ref={contentRef} className="main-content lg:ml-72 px-4 sm:px-6 lg:px-12 xl:px-16 max-w-[1400px]">
        <ExecSummary />
        <QuestionsSection />
        <YearInMotion />
        <BenchmarksSection />
        <ForwardSection />

        {/* Footer */}
        <footer className="no-print py-12 border-t border-gray-90 text-center text-12 text-gray-50">
          <div className="mb-2">Built by Gaurav · FY 2025/26 Year in Review</div>
          <div>Visual language adapted from Turing.com design system</div>
        </footer>
      </main>
    </div>
  )
}
