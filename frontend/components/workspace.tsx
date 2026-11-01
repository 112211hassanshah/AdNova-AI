"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleHelp,
  Database,
  FlaskConical,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Plus,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { getWorkspace, type WorkspaceState } from "@/lib/api";
import { api, json, message, sourceLabel } from "@/lib/data";
import { DataStudio } from "./data-studio";
import { AnalyticsScreen } from "./analytics-screen";
import { BigDataLab } from "./big-data-lab";
import { MLStudio } from "./ml-studio";
import { BudgetOptimizer } from "./budget-optimizer";
import { AIAssistant } from "./ai-assistant";
import { Commerce } from "./commerce";

const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/" },
  {
    id: "data-studio",
    label: "Data Studio",
    icon: Database,
    href: "/data-studio",
  },
  { id: "campaigns", label: "Campaigns", icon: BarChart3, href: "/campaigns" },
  { id: "commerce", label: "Commerce", icon: ShoppingBag, href: "/commerce" },
  {
    id: "ml-studio",
    label: "ML Studio",
    icon: BrainCircuit,
    href: "/ml-studio",
  },
  {
    id: "budget-optimizer",
    label: "Budget Optimizer",
    icon: SlidersHorizontal,
    href: "/budget-optimizer",
  },
  {
    id: "big-data-lab",
    label: "Big Data Lab",
    icon: FlaskConical,
    href: "/big-data-lab",
  },
  {
    id: "ai-assistant",
    label: "AI Assistant",
    icon: Sparkles,
    href: "/ai-assistant",
  },
];
const descriptions: Record<string, string> = {
  overview: "A clearer picture. A better next move.",
  "data-studio": "Good decisions start with well-understood data.",
  campaigns: "Understand where your advertising is working.",
  "ml-studio": "Learn from history. Check before you trust.",
  "budget-optimizer": "Give every rupee a considered next step.",
  "big-data-lab": "Same data. Same question. Three processing engines.",
  "ai-assistant": "Understand the report. Keep the evidence in view.",
  commerce: "See store sales and advertising evidence side by side.",
  help: "A little context for confident decisions.",
};

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">
        <TrendingUp size={21} strokeWidth={2.2} />
      </span>
      adwise<span className="brand-dot">.</span>
    </div>
  );
}
function Sidebar({
  section,
  onNavigate,
}: {
  section: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Brand />
      <p className="eyebrow nav-label">WORKSPACE</p>
      <nav aria-label="Main navigation">
        {navigation.map((item) => (
          <Link
            onClick={onNavigate}
            aria-current={section === item.id ? "page" : undefined}
            className={`nav-link ${section === item.id ? "active" : ""}`}
            href={item.href}
            key={item.id}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="future-nav">
        <p className="eyebrow">LATER IN THE JOURNEY</p>
        <span>
          <LockKeyhole size={15} /> Connections · Future
        </span>
      </div>
      <div className="sidebar-bottom">
        <div className="local-note">
          <ShieldCheck size={19} />
          <strong>Your local workspace</strong>
          <p>No account or API keys needed for the university demo.</p>
        </div>
        <Link
          onClick={onNavigate}
          href="/help"
          className={`nav-link ${section === "help" ? "active" : ""}`}
          aria-current={section === "help" ? "page" : undefined}
        >
          <CircleHelp size={18} />
          Help & about
        </Link>
        <div className="project-tag">
          <span className="small-dot" /> Project 2{" "}
          <span>Independent build</span>
        </div>
      </div>
    </>
  );
}

export function Workspace({ section }: { section: string }) {
  const [state, setState] = useState<WorkspaceState | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const refresh = useCallback(async () => {
    setState(await getWorkspace());
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    getWorkspace(controller.signal)
      .then((value) => {
        setState(value);
        setError("");
      })
      .catch((reason) => {
        if (!controller.signal.aborted)
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not reach the backend service. Retry to reconnect.",
          );
      });
    return () => controller.abort();
  }, [retry]);
  const title =
    section === "commerce"
      ? "Commerce & Attribution"
      : section === "help"
        ? "Help & about"
        : navigation.find((item) => item.id === section)?.label || "Overview";
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="app-shell">
        <aside className="sidebar">
          <Sidebar section={section} />
        </aside>
        <div className="workspace">
          <div className="topbar">
            <div className="breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <strong>{title}</strong>
            </div>
            <span className="local-pill" aria-label="Single-user workspace">
              <span className="small-dot" />
              <span>
                Single user<span className="mode-detail"> · workspace</span>
              </span>
            </span>
            <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
              <Dialog.Trigger
                className="icon-button mobile-menu"
                aria-label="Open navigation"
              >
                <Menu size={21} />
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="drawer-overlay" />
                <Dialog.Content className="nav-drawer">
                  <Dialog.Title className="sr-only">
                    Workspace navigation
                  </Dialog.Title>
                  <Dialog.Description className="sr-only">
                    Choose a page in your advertising workspace.
                  </Dialog.Description>
                  <Dialog.Close
                    className="icon-button drawer-close"
                    aria-label="Close navigation"
                  >
                    <X size={21} />
                  </Dialog.Close>
                  <Sidebar
                    section={section}
                    onNavigate={() => setMenuOpen(false)}
                  />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
          <main id="main-content" tabIndex={-1} ref={mainRef}>
            <header className="page-header">
              <div>
                <p className="eyebrow">YOUR ADVERTISING, IN FOCUS</p>
                <h1>
                  {title === "Overview"
                    ? "Let’s make your budget count."
                    : title}
                </h1>
                <p>{descriptions[section]}</p>
              </div>
              <Link href="/data-studio" className="button primary">
                <Plus size={17} />
                Add data
              </Link>
            </header>
            <div className="context-bar">
              <span className="source-badge">
                <Database size={14} />
                {section === "commerce"
                  ? "Separate commerce CSV workspace"
                  : section === "big-data-lab"
                    ? "Synthetic experiment data"
                    : state?.selected_dataset
                      ? sourceLabel(state.selected_dataset)
                      : "No dataset selected"}
              </span>
              <span>PKR</span>
              <span>
                {section === "commerce"
                  ? "Choose orders and ad evidence below"
                  : section === "big-data-lab"
                    ? "Independent of campaign selection"
                    : state?.selected_dataset
                      ? `${state.selected_dataset.date_start} to ${state.selected_dataset.date_end}`
                      : "No reporting period yet"}
              </span>
              <Link href="/help">
                What’s available <ArrowUpRight size={13} />
              </Link>
            </div>
            {state?.hosting_notice && (
              <div className="notice" role="status">
                <p>{state.hosting_notice}</p>
              </div>
            )}
            {section === "help" && <Help />}
            {error ? (
              <div className="notice error" role="alert">
                <div>
                  <strong>We couldn’t reach your backend.</strong>
                  <p>{error}</p>
                </div>
                <button
                  className="button secondary"
                  onClick={() => {
                    setError("");
                    setState(null);
                    setRetry((value) => value + 1);
                  }}
                >
                  <RefreshCw size={16} />
                  Retry connection
                </button>
              </div>
            ) : section === "help" ? null : !state ? (
              <div className="loading-state" role="status">
                <span className="loading-dot" />
                Checking your workspace…
              </div>
            ) : (
              <>
                {section !== "help" &&
                  section !== "big-data-lab" &&
                  section !== "ai-assistant" &&
                  section !== "commerce" && (
                    <Journey
                      hasData={!!state.selected_dataset}
                      section={section}
                    />
                  )}
                {!!state.datasets.length &&
                  section !== "big-data-lab" &&
                  section !== "commerce" && (
                    <DatasetSwitcher state={state} refresh={refresh} />
                  )}
                {section === "overview" ? (
                  state.selected_dataset ? (
                    <AnalyticsScreen
                      key={state.selected_dataset.id}
                      dataset={state.selected_dataset}
                      modelStatus={state.model_status}
                    />
                  ) : (
                    <Overview state={state} />
                  )
                ) : section === "data-studio" ? (
                  <DataStudio state={state} refresh={refresh} />
                ) : section === "campaigns" && state.selected_dataset ? (
                  <AnalyticsScreen
                    key={state.selected_dataset.id}
                    dataset={state.selected_dataset}
                    modelStatus={state.model_status}
                    campaigns
                  />
                ) : section === "big-data-lab" ? (
                  <BigDataLab />
                ) : section === "ml-studio" ? (
                  <MLStudio
                    key={state.selected_dataset_id || "empty"}
                    dataset={state.selected_dataset}
                    refreshWorkspace={refresh}
                  />
                ) : section === "budget-optimizer" ? (
                  <BudgetOptimizer
                    key={state.selected_dataset_id || "empty"}
                    dataset={state.selected_dataset}
                  />
                ) : section === "commerce" ? (
                  <Commerce ads={state.datasets} refreshWorkspace={refresh} />
                ) : section === "ai-assistant" ? (
                  <AIAssistant
                    key={state.selected_dataset_id || "empty"}
                    dataset={state.selected_dataset}
                  />
                ) : (
                  <Upcoming section={section} state={state} />
                )}
              </>
            )}
            <footer className="page-footer">
              <span>Built for thoughtful decisions.</span>
              <span>Recommendations only · no live ad budgets are changed</span>
            </footer>
          </main>
        </div>
      </div>
      <div className="outside-caption">
        ADWISE / ADVERTISING BUDGET OPTIMIZER{" "}
        <span>Local business pilot · Phase 6</span>
      </div>
    </>
  );
}

function DatasetSwitcher({
  state,
  refresh,
}: {
  state: WorkspaceState;
  refresh: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="dataset-switcher">
      <label>
        Selected campaign dataset
        <select
          aria-label="Selected campaign dataset"
          value={state.selected_dataset_id || ""}
          disabled={busy}
          onChange={async (event) => {
            setBusy(true);
            setError("");
            try {
              await api(
                "/workspace/dataset",
                json({ dataset_id: event.target.value || null }, "PUT"),
              );
              await refresh();
            } catch (reason) {
              setError(message(reason));
            } finally {
              setBusy(false);
            }
          }}
        >
          <option value="">No dataset selected</option>
          {state.datasets.map((dataset) => (
            <option key={dataset.id} value={dataset.id}>
              {dataset.name} · {sourceLabel(dataset)}
            </option>
          ))}
        </select>
      </label>
      {busy && <span role="status">Selecting dataset…</span>}
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
function Journey({ hasData, section }: { hasData: boolean; section: string }) {
  const current =
    section === "data-studio" || !hasData
      ? 0
      : section === "ml-studio"
        ? 2
        : section === "budget-optimizer"
          ? 3
          : 1;
  return (
    <div className="journey-guide">
      <ol className="journey" aria-label="Your path to a budget plan">
        {[
          ["Add data", "/data-studio"],
          ["Review performance", "/campaigns"],
          ["Check model", "/ml-studio"],
          ["Plan budget", "/budget-optimizer"],
        ].map(([step, href], i) => (
          <li key={step} aria-current={i === current ? "step" : undefined}>
            <Link href={href} aria-current={i === current ? "step" : undefined}>
              <span className="step-number">
                {hasData && i === 0 ? <Check size={13} /> : i + 1}
              </span>
              <span>{step}</span>
            </Link>
            {i < 3 && <ChevronRight className="step-arrow" size={15} />}
          </li>
        ))}
      </ol>
      <p className="journey-help">
        Model training is optional for allocation-only plans.{" "}
        <Link href="/help#start-guide">
          New here? Start guide <ArrowUpRight size={13} />
        </Link>
      </p>
    </div>
  );
}

function Overview({ state }: { state: WorkspaceState }) {
  return (
    <div className="bento-grid">
      <section className="card start-guide" aria-labelledby="start-title">
        <div>
          <span className="eyebrow">START HERE</span>
          <h2 id="start-title">Your first plan starts with a report.</h2>
          <p>
            No file yet? Explore the full workflow with labelled sample data.
          </p>
        </div>
        <div className="start-paths">
          <Link href="/data-studio" className="start-path">
            <Sparkles size={19} />
            <span>
              <strong>Try the demo</strong>
              <small>No CSV or API key needed</small>
            </span>
            <ArrowRight size={16} />
          </Link>
          <Link href="/data-studio#add-campaign-data" className="start-path">
            <Database size={19} />
            <span>
              <strong>Use a campaign report</strong>
              <small>Preview and validate your CSV</small>
            </span>
            <ArrowRight size={16} />
          </Link>
          <Link href="/help#no-data" className="start-path">
            <CircleHelp size={19} />
            <span>
              <strong>No campaign history?</strong>
              <small>See what you can do today</small>
            </span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <div className="metrics-row">
        {[
          { name: "Your ad spend", unit: "PKR", icon: Wallet },
          { name: "Attributed revenue", unit: "PKR", icon: TrendingUp },
          { name: "Return on ad spend", unit: "ROAS", icon: BarChart3 },
        ].map((metric) => (
          <section className="card metric" key={metric.name}>
            <div className="card-heading">
              <h2>{metric.name}</h2>
              <metric.icon size={18} />
            </div>
            <div className="metric-value">
              — <span>{metric.unit}</span>
            </div>
            <p>Available after adding data</p>
          </section>
        ))}
      </div>
      <section className="card spotlight dark performance-card">
        <div className="card-heading">
          <h2>
            <BarChart3 size={18} /> Performance, in perspective
          </h2>
          <span className="dark-pill">No data yet</span>
        </div>
        <div className="performance-empty">
          <div className="empty-icon">
            <BarChart3 size={35} strokeWidth={1.3} />
          </div>
          <h3>A clear view starts here.</h3>
          <p>
            Your spend and attributed revenue will appear together once you add
            a campaign dataset.
          </p>
          <Link className="text-link light-link" href="/data-studio">
            Go to Data Studio <ArrowRight size={17} />
          </Link>
        </div>
        <div className="dark-footnote">
          <ShieldCheck size={15} />
          No illustrative numbers. Your charts will use your selected dataset.
        </div>
      </section>
      <section className="card spotlight lime next-card">
        <div className="card-heading">
          <span className="eyebrow">YOUR NEXT STEP</span>
          <span className="round-icon">
            <ArrowUpRight size={21} />
          </span>
        </div>
        <div>
          <h2>
            A good plan <br />
            starts with data.
          </h2>
          <p>Start with sample data or bring your own campaign report.</p>
        </div>
        <Link className="button primary" href="/data-studio">
          Explore data options <ArrowRight size={17} />
        </Link>
        <span className="card-caption">
          Demo generation & CSV import available
        </span>
      </section>
      <section className="card source-card">
        <div className="card-heading">
          <h2>Your workspace, at a glance</h2>
          <ShieldCheck size={19} />
        </div>
        <div className="trust-row">
          <span>Campaign datasets</span>
          <strong>{state.dataset_count}</strong>
        </div>
        <div className="trust-row">
          <span>Revenue model</span>
          <strong>Not trained</strong>
        </div>
        <div className="trust-row">
          <span>Live connections</span>
          <strong>{state.connected_providers.length} connected</strong>
        </div>
        <p>
          Data source, coverage and model validation will stay visible as you
          progress.
        </p>
      </section>
      <section className="card planning-card">
        <div className="card-heading">
          <h2>A plan you can understand</h2>
          <SlidersHorizontal size={19} />
        </div>
        <p>
          Review performance, then explore Budget Optimizer. Model training is
          optional; forecasts require separate evidence checks.
        </p>
        <div className="budget-example">
          <span>Your available budget</span>
          <strong>You choose the amount</strong>
          <small>
            Enter a PKR amount in Budget Optimizer after adding data.
          </small>
        </div>
        <Link href="/budget-optimizer" className="text-link">
          Open Budget Optimizer <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}

const upcoming: Record<
  string,
  { capability: string; heading: string; body: string; checks: string[] }
> = {
  campaigns: {
    capability: "analytics",
    heading: "Your campaigns need a dataset first.",
    body: "Compare weighted performance by platform, campaign and audience after importing or generating validated campaign data.",
    checks: [
      "Spend, revenue, CTR, CPC, CPA and ROAS",
      "Shared date and audience filters",
      "Clear missing-data and attribution coverage",
    ],
  },
  "ml-studio": {
    capability: "training",
    heading: "No model has been trained.",
    body: "A revenue model must learn from a selected dataset and pass time-based evaluation before it can support a budget recommendation.",
    checks: [
      "A selected dataset with spend and attributed revenue",
      "Chronological training and holdout evaluation",
      "Baseline comparison, error metrics and model provenance",
    ],
  },
  "budget-optimizer": {
    capability: "optimization",
    heading: "A recommendation starts with evidence.",
    body: "Your future budget plan will distribute an editable PKR budget within platform minimums and caps, with estimated outcomes and visible assumptions.",
    checks: [
      "Validated campaign spend and revenue",
      "A usable evaluated model or explicitly labelled baseline",
      "Feasible budget, minimums, caps and PKR increments",
    ],
  },
  "big-data-lab": {
    capability: "benchmarking",
    heading: "Real experiments. Measured results.",
    body: "The Big Data Lab is for the university experiment. A merchant does not need millions of records to understand their advertising.",
    checks: [
      "Equivalent Pandas, local MapReduce and PySpark workloads",
      "10K, 100K, 1M and 10M synthetic row scales",
      "Recorded timings, correctness, environment and failures",
    ],
  },
};
function Upcoming({
  section,
  state,
}: {
  section: string;
  state: WorkspaceState;
}) {
  const content = upcoming[section];
  const capability = state.capabilities.find(
    (item) => item.id === content.capability,
  );
  return (
    <div className="upcoming-grid">
      <section className="card upcoming-main">
        <span className="source-badge">
          <LockKeyhole size={14} />
          {capability?.phase === 1
            ? "Add a dataset to begin"
            : `Available in Phase ${capability?.phase}`}{" "}
        </span>
        <h2>{content.heading}</h2>
        <p>{content.body}</p>
        <Link href="/data-studio" className="button primary">
          Explore data options <ArrowRight size={17} />
        </Link>
        <p className="availability-note">{capability?.reason}</p>
      </section>
      <section className="card">
        <h2>What this step will need</h2>
        <ul className="requirements">
          {content.checks.map((check) => (
            <li key={check}>
              <span className="requirement-dot" />
              {check}
            </li>
          ))}
        </ul>
        <p className="availability-note">
          This page explains the prerequisites. Add data first; model training
          is available in ML Studio; Budget Optimizer checks each plan
          separately.
        </p>
      </section>
    </div>
  );
}

function Help() {
  return (
    <div className="help-grid">
      <section className="card help-wide help-start" id="start-guide">
        <span className="eyebrow">GETTING STARTED</span>
        <h2>From first visit to a considered plan.</h2>
        <p>
          Follow the links below. You can return to any step using the journey
          bar or the navigation menu on mobile.
        </p>
        <ol className="help-steps">
          <li>
            <Link href="/data-studio">
              <strong>
                Add data <ArrowUpRight size={15} />
              </strong>
            </Link>
            <p>
              Generate a synthetic demo, or choose “Bring an advertising CSV”.
              Review mappings and validation before saving.
            </p>
          </li>
          <li>
            <Link href="/campaigns">
              <strong>
                Review performance <ArrowUpRight size={15} />
              </strong>
            </Link>
            <p>
              Check the source, dates, missing fields and platform totals.
              Filters here affect analytics, not model training or budget plans.
            </p>
          </li>
          <li>
            <Link href="/ml-studio">
              <strong>
                Check the model <ArrowUpRight size={15} />
              </strong>
            </Link>
            <p>
              Optional: train on this report and compare errors against the
              baseline. A completed fit can still fail acceptance.
            </p>
          </li>
          <li>
            <Link href="/budget-optimizer">
              <strong>
                Plan a budget <ArrowUpRight size={15} />
              </strong>
            </Link>
            <p>
              Enter your PKR amount, dates and platform limits. Automatic mode
              uses supported forecasts or gives an allocation with no revenue
              estimate.
            </p>
          </li>
        </ol>
      </section>
      <section className="card help-wide help-decisions" id="no-data">
        <h2>Which path fits your situation?</h2>
        <details open>
          <summary>I have no CSV, or I have never run a campaign.</summary>
          <p>
            If you have existing campaigns, download a campaign report as CSV
            from your authorized Meta, Google or TikTok reporting tools. Include
            dates, platform/channel, campaign and spend; include attributed
            revenue when available. Keep reporting definitions consistent.
          </p>
          <p>
            If you have no campaign history, use the synthetic demo to learn the
            workflow. It cannot tell you which platform will work for your
            business. This app cannot make an evidence-based first-campaign
            recommendation or infer your sales from your business name. Collect
            a measured campaign history before relying on forecasts.
          </p>
          <Link className="text-link" href="/data-studio">
            Explore demo and import options <ArrowRight size={16} />
          </Link>
        </details>
        <details>
          <summary>I have a real campaign report. Can I use this?</summary>
          <p>
            Yes, for local analytics and advisory planning after validation.
            Import daily or weekly observations, check currency and attribution
            definitions, then inspect coverage. Missing revenue still permits
            spend analytics and evidence-limited allocation; it does not permit
            a revenue forecast.
          </p>
          <p>
            Revenue training needs at least 300 mature rows across 30 reporting
            dates, enough spend variation and chronological/platform coverage.
            Weekly rows need 30 distinct reporting weeks. Passing those
            prerequisites only enables a fit; acceptance and forecast support
            are separate checks. Real merchant predictive accuracy remains
            unverified.
          </p>
        </details>
        <details>
          <summary>Are the model and allocations fair?</summary>
          <p>
            The same recorded error policy applies to each dataset, with
            additional platform coverage/error checks. Comparisons use the same
            budget and constraints. This does not certify fairness: larger
            revenue values can dominate error metrics, historical attribution
            can be biased, and demographic fairness has not been audited.
          </p>
          <p>
            Allocations maximize the declared adjusted response or a labelled
            historical priority, not equal platform shares. Zero allocations are
            allowed; exact ties use a deterministic platform-name order. Use
            your own caps and floors, review platform-level errors and run
            controlled real-world evaluations before trusting a reallocation.
          </p>
        </details>
        <details>
          <summary>How does NVIDIA help?</summary>
          <p>
            Python calculates analytics, fits the revenue model and allocates
            budgets locally. NVIDIA only turns a previewed qualitative summary
            of performance, model evaluation or a saved budget into an
            explanation after your approval. Exact financial values and raw rows
            stay local.
          </p>
          <p>
            It does not train the revenue model, verify attribution, improve
            model accuracy or change spending. The workspace works without it.
            AI text may be wrong; check the local evidence. Commerce reports are
            not part of this explanation flow.
          </p>
          <Link className="text-link" href="/ai-assistant">
            Open AI Assistant <ArrowRight size={16} />
          </Link>
        </details>
        <details>
          <summary>
            I only have store orders, or a forecast is unavailable.
          </summary>
          <p>
            Commerce can describe store sales from Shopify/generic CSVs. Orders
            alone do not provide ad spend or prove channel attribution. Costs
            and matching evidence are needed for contribution calculations and
            profit planning.
          </p>
          <p>
            If a forecast is unavailable, inspect its reasons. You can review
            analytics or use allocation-only planning with existing campaign
            observations. No estimated revenue means no supported forecast; it
            does not mean zero future sales.
          </p>
          <Link className="text-link" href="/commerce">
            Review commerce evidence <ArrowRight size={16} />
          </Link>
        </details>
      </section>
      <section className="card">
        <h2>A workspace built in useful steps.</h2>
        <p>
          Adwise is Project 2: an independent advertising budget optimizer. The
          university demo includes reproducible synthetic campaigns, guided CSV
          import, saved datasets, weighted analytics, measured Big Data
          experiments and actual model training and advisory budget planning.
        </p>
        <div className="help-status">
          <ShieldCheck size={22} />
          <div>
            <strong>Local, single-user development</strong>
            <p>
              This is a local, single-user workspace. It has no authentication,
              live advertiser connections or campaign execution. Uploaded rows
              stay local. Optional NVIDIA explanations send only a summary you
              review and approve.
            </p>
          </div>
        </div>
        <h3>What comes next</h3>
        <p>
          Commerce accepts Shopify or generic order CSVs and optional costs.
          Compare store sales with advertiser exports, review attribution and
          plan for contribution profit when evidence passes the checks.
          Read-only account connections and a hosted multi-user service remain
          future work. The university demo works with synthetic data and local
          files.
        </p>
      </section>
      <section className="card">
        <h2>A few useful definitions</h2>
        {[
          [
            "ROAS · return on ad spend",
            "Attributed revenue divided by ad spend. It describes revenue efficiency, not profit or causal uplift.",
          ],
          [
            "CTR · click-through rate",
            "Total clicks divided by total impressions, multiplied by 100. Ratios are calculated from totals, not averaged percentages.",
          ],
          [
            "CPC and CPA",
            "Cost per click is spend divided by clicks. Cost per acquisition is spend divided by conversions. A zero denominator returns Not available.",
          ],
          [
            "Synthetic demo data",
            "Reproducible simulated campaigns for learning and testing. Their results do not demonstrate real business performance.",
          ],
          [
            "Attributed revenue",
            "Revenue reported as associated with advertising. Different platforms may claim overlapping sales; their values are not unique store revenue.",
          ],
          [
            "Budget recommendations",
            "Advisory estimates to review and export. The application never changes live advertising budgets.",
          ],
        ].map(([term, definition]) => (
          <details key={term}>
            <summary>{term}</summary>
            <p>{definition}</p>
          </details>
        ))}
      </section>
      <section className="card help-wide">
        <h2>Honest data, throughout the journey.</h2>
        <div className="principles">
          <p>
            <strong>Separate origins.</strong> Demo data, advertiser reports and
            store orders retain distinct provenance.
          </p>
          <p>
            <strong>Visible limitations.</strong> Missing revenue, weak
            attribution or an unvalidated model will block unsupported
            recommendations.
          </p>
          <p>
            <strong>Your files stay local.</strong> Saved campaign rows live
            under data/ and stay out of Git. Delete or export datasets in Data
            Studio. Sanitized upload previews expire after 24 hours or are
            removed after import. AI Assistant can send approved summaries to
            NVIDIA; raw rows stay here. This is not an encrypted hosted service.
          </p>
        </div>
        <Link className="text-link" href="/data-studio">
          Back to your first step <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
