import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CONTEXT_DIR = path.join(REPO_ROOT, "integrations/openclaw/state");
const CONTEXT_FILE = path.join(CONTEXT_DIR, "github-review-context.json");

const MAX_DIFF_CHARS = 14_000;
const MAX_FILE_SNIPPET_CHARS = 4_000;
const MAX_FILES = 10;

export type GithubChangedFile = {
  path: string;
  status: string;
  additions?: number;
  deletions?: number;
};

export type GithubFileSnippet = {
  path: string;
  content: string;
};

export type GithubReviewContext = {
  generatedAt: string;
  repository: string;
  event: string;
  action: string | null;
  title: string;
  url: string | null;
  ref: string | null;
  baseSha: string | null;
  headSha: string | null;
  changedFiles: GithubChangedFile[];
  diffStat: string;
  diffSnippet: string;
  fileSnippets: GithubFileSnippet[];
  source: "github-api" | "local-git" | "payload-only";
};

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n\n… [truncated ${text.length - max} chars]`;
}

function getGithubToken() {
  return process.env.GITHUB_TOKEN?.trim() || process.env.GH_TOKEN?.trim() || "";
}

function parseRepoFullName(fullName: string) {
  const [owner, repo] = fullName.split("/");
  return { owner, repo };
}

async function githubFetch(url: string, accept?: string) {
  const token = getGithubToken();
  const headers: Record<string, string> = {
    Accept: accept ?? "application/vnd.github+json",
    "User-Agent": "mor-finance-webhook",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${url}`);
  }
  return res;
}

async function fetchPullRequestContext(
  owner: string,
  repo: string,
  prNumber: number,
  meta: { event: string; action: string | null; title: string; url: string | null },
): Promise<GithubReviewContext> {
  const filesRes = await githubFetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100`,
  );
  const files = (await filesRes.json()) as Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string;
  }>;

  const changedFiles: GithubChangedFile[] = files.slice(0, MAX_FILES).map((file) => ({
    path: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
  }));

  let diffSnippet = "";
  try {
    const diffRes = await githubFetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      "application/vnd.github.v3.diff",
    );
    diffSnippet = truncate(await diffRes.text(), MAX_DIFF_CHARS);
  } catch {
    diffSnippet = files
      .filter((f) => f.patch)
      .map((f) => `--- ${f.filename}\n${f.patch}`)
      .join("\n\n");
    diffSnippet = truncate(diffSnippet, MAX_DIFF_CHARS);
  }

  const fileSnippets: GithubFileSnippet[] = [];
  for (const file of files.slice(0, 6)) {
    if (file.patch) {
      fileSnippets.push({
        path: file.filename,
        content: truncate(file.patch, MAX_FILE_SNIPPET_CHARS),
      });
    }
  }

  const diffStat = changedFiles
    .map((f) => `${f.path} (+${f.additions ?? 0}/-${f.deletions ?? 0})`)
    .join("\n");

  return {
    generatedAt: new Date().toISOString(),
    repository: `${owner}/${repo}`,
    event: meta.event,
    action: meta.action,
    title: meta.title,
    url: meta.url,
    ref: null,
    baseSha: null,
    headSha: null,
    changedFiles,
    diffStat,
    diffSnippet,
    fileSnippets,
    source: "github-api",
  };
}

function localGitDiff(before: string, after: string) {
  const cwd = process.env.MOR_REPO?.trim() || REPO_ROOT;
  try {
    const stat = execSync(`git diff --stat ${before} ${after}`, {
      cwd,
      encoding: "utf8",
      timeout: 10_000,
    }).trim();
    const diff = execSync(`git diff ${before} ${after}`, {
      cwd,
      encoding: "utf8",
      timeout: 10_000,
    }).trim();
    const nameOnly = execSync(`git diff --name-status ${before} ${after}`, {
      cwd,
      encoding: "utf8",
      timeout: 10_000,
    })
      .trim()
      .split("\n")
      .filter(Boolean);

    const changedFiles: GithubChangedFile[] = nameOnly.slice(0, MAX_FILES).map((line) => {
      const [status, ...rest] = line.split("\t");
      return { path: rest.join("\t"), status: status ?? "M" };
    });

    return { diffStat: stat, diffSnippet: truncate(diff, MAX_DIFF_CHARS), changedFiles };
  } catch {
    return null;
  }
}

function readLocalFileSnippets(paths: string[]) {
  const cwd = process.env.MOR_REPO?.trim() || REPO_ROOT;
  const snippets: GithubFileSnippet[] = [];
  for (const rel of paths.slice(0, 6)) {
    const abs = path.join(cwd, rel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue;
    try {
      snippets.push({
        path: rel,
        content: truncate(fs.readFileSync(abs, "utf8"), MAX_FILE_SNIPPET_CHARS),
      });
    } catch {
      // skip unreadable
    }
  }
  return snippets;
}

export async function buildGithubReviewContext(
  event: string,
  payload: Record<string, unknown>,
): Promise<GithubReviewContext | null> {
  const repo = (payload.repository as { full_name?: string } | undefined)?.full_name ?? "";
  const action = typeof payload.action === "string" ? payload.action : null;

  if (payload.pull_request) {
    const pr = payload.pull_request as {
      number: number;
      title: string;
      html_url: string;
      base?: { sha?: string };
      head?: { sha?: string };
    };
    const { owner, repo: repoName } = parseRepoFullName(repo);
    if (!owner || !repoName) return null;

    try {
      const ctx = await fetchPullRequestContext(owner, repoName, pr.number, {
        event,
        action,
        title: `PR #${pr.number}: ${pr.title}`,
        url: pr.html_url,
      });
      ctx.baseSha = pr.base?.sha ?? null;
      ctx.headSha = pr.head?.sha ?? null;
      return ctx;
    } catch (err) {
      console.warn("GitHub PR context fetch failed:", err);
    }
  }

  if (payload.commits && Array.isArray(payload.commits)) {
    const before = String(payload.before ?? "");
    const after = String(payload.after ?? "");
    const ref = String(payload.ref ?? "");
    const compare = (payload.compare as string | undefined) ?? null;
    const branch = ref.replace(/^refs\/heads\//, "");
    const commits = payload.commits as Array<{ id: string; message: string }>;
    const title = `Push to ${branch} (${commits.length} commit${commits.length === 1 ? "" : "s"})`;

    if (before && after && before !== "0000000000000000000000000000000000000000") {
      const local = localGitDiff(before, after);
      if (local) {
        return {
          generatedAt: new Date().toISOString(),
          repository: repo,
          event,
          action,
          title,
          url: compare,
          ref: branch,
          baseSha: before,
          headSha: after,
          changedFiles: local.changedFiles,
          diffStat: local.diffStat,
          diffSnippet: local.diffSnippet,
          fileSnippets: readLocalFileSnippets(local.changedFiles.map((f) => f.path)),
          source: "local-git",
        };
      }
    }

    const changedFiles: GithubChangedFile[] = commits.slice(0, MAX_FILES).map((c) => ({
      path: c.id.slice(0, 7),
      status: "commit",
    }));

    return {
      generatedAt: new Date().toISOString(),
      repository: repo,
      event,
      action,
      title,
      url: compare,
      ref: branch,
      baseSha: before || null,
      headSha: after || null,
      changedFiles,
      diffStat: commits.map((c) => `${c.id.slice(0, 7)} ${c.message.split("\n")[0]}`).join("\n"),
      diffSnippet: "",
      fileSnippets: [],
      source: "payload-only",
    };
  }

  return null;
}

export function saveGithubReviewContext(context: GithubReviewContext) {
  fs.mkdirSync(CONTEXT_DIR, { recursive: true });
  fs.writeFileSync(CONTEXT_FILE, JSON.stringify(context, null, 2), "utf8");
  return CONTEXT_FILE;
}

export function loadGithubReviewContext(): GithubReviewContext | null {
  if (!fs.existsSync(CONTEXT_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(CONTEXT_FILE, "utf8")) as GithubReviewContext;
  } catch {
    return null;
  }
}

export function formatGithubReviewContextForAgents(context: GithubReviewContext) {
  const parts = [
    "## GitHub code review context",
    `Repository: ${context.repository}`,
    `Event: ${context.event}${context.action ? ` (${context.action})` : ""}`,
    `Title: ${context.title}`,
    context.url ? `URL: ${context.url}` : "",
    context.ref ? `Branch: ${context.ref}` : "",
    context.baseSha && context.headSha
      ? `Commits: ${context.baseSha.slice(0, 7)}…${context.headSha.slice(0, 7)}`
      : "",
    `Source: ${context.source}`,
    "",
    "### Changed files",
    context.diffStat || "(none)",
    "",
    "### Unified diff (truncated)",
    context.diffSnippet ? `\`\`\`diff\n${context.diffSnippet}\n\`\`\`` : "(diff unavailable — add GITHUB_TOKEN)",
  ];

  if (context.fileSnippets.length > 0) {
    parts.push("", "### File snippets");
    for (const file of context.fileSnippets) {
      parts.push(`#### ${file.path}`, "```", file.content, "```");
    }
  }

  parts.push(
    "",
    "Review the actual code above. Cite file paths and specific issues. Do not review metadata only.",
  );

  return parts.filter(Boolean).join("\n");
}

export function getGithubReviewContextPath() {
  return CONTEXT_FILE;
}
