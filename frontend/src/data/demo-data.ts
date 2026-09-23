export interface RevenueDataPoint {
  month: string;
  revenue: number;
  target: number;
  growth: number;
}

export const REVENUE_DATA: RevenueDataPoint[] = [
  { month: "Jan", revenue: 6.8, target: 6.5, growth: 18 },
  { month: "Feb", revenue: 7.4, target: 7.0, growth: 22 },
  { month: "Mar", revenue: 8.2, target: 7.8, growth: 26 },
  { month: "Apr", revenue: 8.9, target: 8.5, growth: 28 },
  { month: "May", revenue: 9.7, target: 9.2, growth: 30 },
  { month: "Jun", revenue: 10.5, target: 10.0, growth: 31 },
  { month: "Jul", revenue: 11.3, target: 10.8, growth: 33 },
  { month: "Aug", revenue: 12.4, target: 11.5, growth: 35 },
];

export const QUARTERLY_DATA = [
  { quarter: "Q1", value: 4.8, expansion: 1.2 },
  { quarter: "Q2", value: 6.4, expansion: 1.8 },
  { quarter: "Q3", value: 9.1, expansion: 2.7 },
  { quarter: "Q4", value: 12.4, expansion: 4.1 },
];

export const DEMO_QUERIES = [
  {
    id: "rev-growth",
    label: "Analyze Q4 Growth",
    query: "What drove our revenue growth last quarter and what should we double down on?",
    summary: "Revenue reached $12.4M (+32% QoQ). The primary growth engine was a 48% increase in enterprise customer retention and expansion ARR.",
    kpis: [
      { label: "Total ARR", value: "$12.4M", change: "+32%", isPositive: true },
      { label: "Enterprise Growth", value: "+48%", change: "+14% vs Q3", isPositive: true },
      { label: "Net Revenue Retention", value: "114%", change: "+6%", isPositive: true },
      { label: "Payback Period", value: "7.2 mo", change: "-1.8 mo", isPositive: true },
    ],
    recommendation: "Increase investment in enterprise outbound sales. Replicate the mid-market expansion playbook across North American accounts.",
  },
  {
    id: "churn-risk",
    label: "Predict Churn Risk",
    query: "Which customer cohorts show warning signs of churn before the renewal window?",
    summary: "32 mid-market accounts ($1.2M ARR) exhibited a >35% drop in weekly active integrations over the past 30 days.",
    kpis: [
      { label: "At-Risk ARR", value: "$1.2M", change: "32 accounts", isPositive: false },
      { label: "Average Health Score", value: "62/100", change: "-18 pts", isPositive: false },
      { label: "Engagement Drop", value: "-38%", change: "Last 30 days", isPositive: false },
      { label: "Predicted Save Rate", value: "76%", change: "With CSM outreach", isPositive: true },
    ],
    recommendation: "Trigger automated CSM alerts for accounts with declining API activity and offer complimentary pipeline architecture reviews.",
  },
  {
    id: "cac-efficiency",
    label: "Forecast CAC Efficiency",
    query: "Compare CAC payback across inbound, outbound, and partner referral channels.",
    summary: "Partner referrals delivered the fastest payback at 4.2 months, while paid inbound extended to 11.6 months due to ad spend inflation.",
    kpis: [
      { label: "Blended CAC Payback", value: "8.1 mo", change: "-0.9 mo", isPositive: true },
      { label: "Partner Channel CAC", value: "$3,420", change: "4.2 mo payback", isPositive: true },
      { label: "Direct Inbound CAC", value: "$8,950", change: "11.6 mo payback", isPositive: false },
      { label: "Pipeline Velocity", value: "26 days", change: "-5 days", isPositive: true },
    ],
    recommendation: "Shift 25% of top-of-funnel paid search budget into co-marketing partnerships with modern data stack vendors.",
  },
];

export const INTEGRATIONS_LIST = [
  { name: "Snowflake", category: "Warehouse", icon: "Database", status: "Live Sync", popular: true },
  { name: "PostgreSQL", category: "Warehouse", icon: "Server", status: "Sub-second", popular: true },
  { name: "Google BigQuery", category: "Warehouse", icon: "Cloud", status: "Native", popular: true },
  { name: "Salesforce", category: "CRM", icon: "Building2", status: "Bi-directional", popular: true },
  { name: "HubSpot", category: "CRM", icon: "Users", status: "Auto-mapped", popular: true },
  { name: "Google Sheets", category: "Spreadsheets", icon: "Table2", status: "Real-time", popular: true },
  { name: "Stripe", category: "Payments", icon: "CreditCard", status: "Webhook sync", popular: true },
  { name: "Databricks", category: "Warehouse", icon: "Cpu", status: "Delta Lake", popular: true },
  { name: "ClickHouse", category: "Warehouse", icon: "Zap", status: "Ultra-fast", popular: false },
  { name: "Amazon Redshift", category: "Warehouse", icon: "HardDrive", status: "Native", popular: false },
  { name: "Notion", category: "Productivity", icon: "FileText", status: "Live Embed", popular: false },
  { name: "Slack", category: "Productivity", icon: "MessageSquare", status: "Daily Briefings", popular: true },
  { name: "Segment", category: "Analytics", icon: "GitFork", status: "Stream", popular: false },
  { name: "Mixpanel", category: "Analytics", icon: "BarChart3", status: "Events", popular: false },
  { name: "Airtable", category: "Spreadsheets", icon: "Layers", status: "Synced", popular: false },
  { name: "CSV / Excel", category: "Spreadsheets", icon: "FileSpreadsheet", status: "Instant Drag & Drop", popular: true },
];

export const PRICING_TIERS = [
  {
    name: "Starter",
    description: "For early-stage startups and small teams who want instant answers without a dedicated data hire.",
    monthlyPrice: 49,
    annualPrice: 39,
    features: [
      "Up to 3 connected data sources",
      "500 AI queries / month",
      "Interactive charts & automated summaries",
      "Google Sheets & CSV connectors",
      "Daily email digest",
      "Community & email support",
    ],
    cta: "Start 14-Day Free Trial",
    popular: false,
  },
  {
    name: "Pro / Growth",
    badge: "Most Popular",
    description: "For fast-scaling companies requiring cross-source federation, automated anomaly alerts, and Slack delivery.",
    monthlyPrice: 199,
    annualPrice: 159,
    features: [
      "Unlimited data sources (SQL, CRM, Stripe, Sheets)",
      "Unlimited natural language AI queries",
      "Multi-source automatic schema joins",
      "Proactive anomaly & churn detection",
      "Interactive Slack bot with multi-turn query",
      "Scheduled team reports & Notion sync",
      "Priority 1-hour support & shared Slack channel",
    ],
    cta: "Start 14-Day Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For security-conscious organizations requiring custom VPC deployment, granular row-level access, and dedicated SLAs.",
    monthlyPrice: null, // Custom
    annualPrice: null,
    features: [
      "Dedicated VPC / On-premise deployment",
      "Zero LLM data retention guarantee (HIPAA / SOC2)",
      "Granular Row-Level & Column-Level RBAC",
      "Custom warehouse connectors & proprietary schemas",
      "Dedicated AI Data Engineer & Solutions Architect",
      "99.99% uptime SLA & 24/7 phone escalation",
    ],
    cta: "Talk to Enterprise Sales",
    popular: false,
  },
];

export const FAQS = [
  {
    question: "Does Inside store or train AI models on our company data?",
    answer:
      "Never. Inside operates on a strict zero-data-retention policy. We synthesize queries and execute them directly on your warehouse using transient execution. Your raw data never touches third-party LLM model weights or training pipelines.",
  },
  {
    question: "Can Inside write to or accidentally corrupt our production databases?",
    answer:
      "No. Inside operates with read-only credentials. We explicitly do not request or support write, update, drop, or alter permissions on your connected warehouses and databases.",
  },
  {
    question: "How does Inside handle complex schemas and customized metric definitions?",
    answer:
      "Inside builds an adaptive semantic catalog upon connection. It maps your foreign keys, indexes, and custom calculated fields (e.g. Net ARR, Active Churn). You can review, adjust, or lock your canonical business definitions in the settings.",
  },
  {
    question: "How is Inside different from traditional BI tools like Looker, Tableau, or Metabase?",
    answer:
      "Traditional BI requires weeks of dashboard building and constant SQL backlog maintenance. Inside is conversational, self-building, and proactive: it generates live dashboards on the fly, surfaces anomalies before you ask, and explains root causes in plain English.",
  },
  {
    question: "How long does setup take?",
    answer:
      "Under 60 seconds. You can connect a Google Sheet, upload a CSV, or authenticate with Snowflake/PostgreSQL using standard credentials. Inside indexes metadata immediately so you can run queries right away.",
  },
  {
    question: "What happens if a query generated by AI is ambiguous?",
    answer:
      "Inside never guesses on critical financial or operational metrics. If an inquiry has multiple interpretations (e.g. 'active users' by 7-day vs 30-day window), it presents a clarifying drill-down and displays the exact SQL generated for complete transparency.",
  },
];
