/* The only place that knows the server exists. */

export interface StepCard {
  slug: string;
  order: number;
  title: string;
  kicker: string;
  part: string;
  minutes: number;
  color: string;
  summary: string;
  parts: PartChip[];
}

export interface PartChip {
  id: string;
  label: string;
  hasExercise: boolean;
  checkCount: number;
}

export interface AfterAction {
  action: "stop-app";
  label?: string;
  note?: string;
}

export interface PartFull extends PartChip {
  headline: string;
  body: string;
  exercise: Exercise | null;
  checks: CheckCard[];
  after: AfterAction | null;
}

/** One step of a staged run, and the log pattern that means it is finished. */
export interface Stage {
  title: string;
  note?: string;
  at?: string;
}

export interface Task {
  kind:
    | "console"
    | "command"
    | "intent"
    | "provision"
    | "deploy"
    | "app"
    | "files"
    | "terminal"
    | "widget"
    | "project"
    | "billing"
    | "placeholder"
    | "reflect"
    | "edit"
    | "draw";
  id: string;
  title: string;
  url?: string;
  command?: string;
  file?: string;
  prompt?: string;
  explain?: string;
  note?: string;
  image?: string;
  editable?: boolean;
  checklist?: string[];
  stamps?: string[];
  goal?: string;
  background?: boolean;
  appTitle?: string;
  linkTo?: string;
  linkLabel?: string;
  start?: string;
  open?: string;
  hint?: string;
  example?: string;
  stages?: Stage[];
  expect?: string[];
  widget?: string;
  assist?: "budget" | "services" | "delete-project";
}

export interface Exercise {
  title: string;
  intro?: string;
  tasks: Task[];
}

export interface CheckCard {
  id: string;
  label: string;
  hint: string;
}

export interface StepFull extends StepCard {
  partDetail: PartFull[];
}

export interface CheckResult {
  id: string;
  label: string;
  passed: boolean;
  command: string;
  detail: string;
  hint: string;
  refused: boolean;
}

export interface FileNode {
  name: string;
  path: string;
  kind: "dir" | "file";
  size?: number;
  readable?: boolean;
  children?: FileNode[] | null;
}

export interface ShellReply {
  cwd: string;
  prompt: string;
  output: string;
  started: boolean;
  cleared: boolean;
}

export interface ProjectStatus {
  signedIn: boolean;
  account: string;
  project: string;
  active: string;
  recorded: string;
  name: string;
  ok?: boolean;
  detail?: string;
}

export interface BillingStatus {
  project: string;
  enabled: boolean;
  account: string;
  accountName: string;
  available: { display: string; id: string }[];
  candidate: { display: string; id: string; why: string } | null;
  ok?: boolean;
  detail?: string;
}

export interface BudgetStatus {
  project: string;
  account: string;
  accountName?: string;
  budgets: string[];
  count: number;
  ready: boolean;
  ok?: boolean;
  detail?: string;
}

export interface ServicesStatus {
  services: { name: string; why: string; enabled: boolean }[];
  missing: string[];
  ok: boolean;
  detail?: string;
}

export interface AppStatus {
  running: boolean;
  managed: boolean;
  port: number;
  url: string;
  log: string | null;
  detail?: string;
}

export interface Env {
  account: string;
  project: string;
  region: string;
  hasGcloud: boolean;
  signedIn: boolean;
  hasProject: boolean;
}

export interface CoursePayload {
  course: {
    title: string;
    subtitle?: string;
    tagline?: string;
    thesis?: string;
    credit?: string;
    parts?: { id: string; title: string; color: string }[];
  };
  steps: StepCard[];
  totalMinutes: number;
}

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) throw new Error(`${response.status} ${path}`);
  return response.json() as Promise<T>;
}

export const api = {
  course: () => json<CoursePayload>("/api/course"),
  step: (slug: string) => json<StepFull>(`/api/steps/${slug}`),
  env: (refresh = false) => json<Env>(`/api/env${refresh ? "?refresh=true" : ""}`),
  check: (slug: string, part = "") =>
    json<{ results: CheckResult[]; passed: boolean; env: Env }>(
      `/api/check/${slug}${part ? `?part=${encodeURIComponent(part)}` : ""}`,
      { method: "POST" },
    ),
  startRun: (slug: string, taskId: string) =>
    json<{ token: string }>(`/api/run/${slug}/${taskId}`, { method: "POST" }),
  submitIntent: (slug: string, taskId: string, utterance: string) =>
    json<{ ok: boolean; by: string; feedback: string; token: string | null; command: string | null }>(
      `/api/intent/${slug}/${taskId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utterance }),
      },
    ),
  fileTree: (start = "", depth = 3) =>
    json<{ root: string; display: string; entries: FileNode[] }>(
      `/api/files/tree?start=${encodeURIComponent(start)}&depth=${depth}`,
    ),
  fileRead: (path: string) =>
    json<{ path: string; language?: string; lines?: string[]; error?: string }>(
      `/api/files/read?path=${encodeURIComponent(path)}`,
    ),
  shell: (line: string, cwd: string) =>
    json<ShellReply>("/api/shell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ line, cwd }),
    }),
  projectStatus: () => json<ProjectStatus>("/api/project"),
  projectCreate: () => json<ProjectStatus>("/api/project/create", { method: "POST" }),

  projectDelete: (project: string) =>
    json<{ ok: boolean; detail: string; project?: string }>("/api/project/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project }),
    }),
  projectConfirm: () => json<ProjectStatus>("/api/project/confirm", { method: "POST" }),
  billingStatus: () => json<BillingStatus>("/api/billing"),
  billingLink: () => json<BillingStatus>("/api/billing/link", { method: "POST" }),
  servicesStatus: () => json<ServicesStatus>("/api/services"),
  servicesEnable: () => json<ServicesStatus>("/api/services/enable", { method: "POST" }),
  budgetStatus: () => json<BudgetStatus>("/api/budget"),
  budgetCreate: () => json<BudgetStatus>("/api/budget/create", { method: "POST" }),
  appStatus: () => json<AppStatus>("/api/app/status"),
  appStart: () => json<AppStatus>("/api/app/start", { method: "POST" }),
  appStop: () => json<AppStatus>("/api/app/stop", { method: "POST" }),
  appLog: () => json<{ log: string }>("/api/app/log"),
  appReset: () =>
    json<{ ok: boolean; detail: string }>("/api/app/reset", { method: "POST" }),
  serviceUrl: () =>
    json<{ url: string; service: string; region: string }>("/api/service"),

  runStatus: (token: string) =>
    json<{ token: string; state: string; code: number | null; log: string }>(
      `/api/run/${token}`,
    ),
};

type RunEvent =
  | { type: "run.start"; token: string; command: string }
  | { type: "run.line"; token: string; line: string }
  | { type: "run.done"; token: string; code: number };

/** One EventSource for the whole page, shared by every run panel. */
let source: EventSource | null = null;
const listeners = new Set<(event: RunEvent) => void>();

export function onRunEvent(listener: (event: RunEvent) => void): () => void {
  listeners.add(listener);
  if (!source) {
    source = new EventSource("/api/events");
    source.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as RunEvent;
        listeners.forEach((fn) => fn(event));
      } catch {
        /* keepalive padding and comments arrive here; ignore them */
      }
    };
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && source) {
      source.close();
      source = null;
    }
  };
}
