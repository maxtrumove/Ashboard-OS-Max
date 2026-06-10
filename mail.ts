import type { PuppetNode } from "./store";

const VAR_RE = /\{\{\s*([\w.-]+)\s*\}\}/g;

/** Collect distinct {{variable}} names referenced across all node string values. */
export function extractVariables(nodes: PuppetNode[]): string[] {
  const found = new Set<string>();
  for (const node of nodes) {
    for (const value of Object.values(node.data.values)) {
      if (typeof value !== "string") continue;
      let m: RegExpExecArray | null;
      VAR_RE.lastIndex = 0;
      while ((m = VAR_RE.exec(value))) found.add(m[1]);
    }
  }
  return [...found].sort();
}
