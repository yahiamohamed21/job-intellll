/* eslint-disable react-refresh/only-export-components */
import React from "react";

/** Formats a raw second count into MM:SS display string. */
export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

/**
 * Lightweight syntax tokeniser — no external deps.
 * Returns an array of { type, value } tokens for common languages.
 * Types: keyword | string | comment | number | operator | punctuation | plain
 */
export const tokenise = (code) => {
  const rules = {
    comment: /\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*/g,
    string: /`[\s\S]*?`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
    number: /\b\d+(\.\d+)?(f|L|d|u|ul)?\b/g,
    keyword: /\b(abstract|as|async|await|base|bool|break|byte|case|catch|char|class|const|continue|decimal|default|delegate|delete|do|double|dynamic|elif|else|enum|event|explicit|extends|extern|false|final|finally|float|for|foreach|from|func|get|goto|if|implicit|import|in|int|interface|internal|is|lambda|let|long|match|mod|module|namespace|new|null|object|operator|out|override|package|params|print|private|protected|public|readonly|ref|return|sealed|select|set|short|sizeof|static|string|struct|super|switch|this|throw|true|try|type|typeof|uint|ulong|unchecked|unsafe|using|val|var|virtual|void|volatile|when|where|while|with|yield)\b/g,
    operator: /[+\-*/%=!<>&|^~?:]+/g,
    punctuation: /[{}[\]();,.]/g,
  };

  // Collect all matches with their positions
  const tokens = [];
  const used = new Uint8Array(code.length);

  for (const [type, re] of Object.entries(rules)) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(code)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      let overlap = false;
      for (let i = start; i < end; i++) { if (used[i]) { overlap = true; break; } }
      if (!overlap) {
        tokens.push({ type, value: m[0], start, end });
        for (let i = start; i < end; i++) used[i] = 1;
      }
    }
  }

  tokens.sort((a, b) => a.start - b.start);

  // Fill gaps with plain tokens
  const result = [];
  let pos = 0;
  for (const tok of tokens) {
    if (tok.start > pos) result.push({ type: "plain", value: code.slice(pos, tok.start) });
    result.push(tok);
    pos = tok.end;
  }
  if (pos < code.length) result.push({ type: "plain", value: code.slice(pos) });
  return result;
};

export const TOKEN_COLORS = {
  keyword: "text-blue-400",
  string: "text-emerald-400",
  comment: "text-slate-500 italic",
  number: "text-amber-400",
  operator: "text-red-400",
  punctuation: "text-slate-400",
  plain: "text-slate-200",
};

/**
 * Dark IDE-style code block with language badge and copy button.
 */
export const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const tokens = tokenise(code);

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-700/80 shadow-lg text-left not-italic" dir="ltr">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          {language && (
            <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
              {language}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          title="Copy"
        >
          <span className="material-symbols-outlined text-[14px]">
            {copied ? "check" : "content_copy"}
          </span>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* ── Code body ── */}
      <pre className="bg-[#0d1117] px-5 py-4 overflow-x-auto text-[0.8rem] font-mono leading-6 whitespace-pre [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent pb-5">
        {tokens.map((tok, i) => (
          <span key={i} className={TOKEN_COLORS[tok.type] ?? "text-slate-200"}>
            {tok.value}
          </span>
        ))}
      </pre>
    </div>
  );
};

/**
 * Renders a string that may contain:
 *   ∙ Fenced code blocks:  ```lang\n...\n```
 *   ∙ Inline code:         `code`
 * Returns an array of React nodes safe to drop inside any element.
 */
export const renderRichText = (text) => {
  if (!text) return null;

  // 1. Split on fenced blocks first
  const fenceRe = /```(\w*)\n?([\s\S]*?)```/g;
  const parts = [];
  let last = 0;
  let m;

  while ((m = fenceRe.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: "text", content: text.slice(last, m.index) });
    parts.push({ type: "block", lang: m[1] || "", code: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", content: text.slice(last) });
  if (parts.length === 0) parts.push({ type: "text", content: text });

  // Force all question text to appear ABOVE all code blocks
  const reorderedParts = [
    ...parts.filter(p => p.type === "text"),
    ...parts.filter(p => p.type === "block")
  ];

  return reorderedParts.map((part, i) => {
    if (part.type === "block") {
      return <CodeBlock key={i} code={part.code} language={part.lang} />;
    }

    // 2. Within text parts, split on inline `code`
    const inlineRe = /`([^`\n]+)`/g;
    const chunks = [];
    let p = 0;
    let n;
    while ((n = inlineRe.exec(part.content)) !== null) {
      if (n.index > p) chunks.push(<span key={`t${p}`}>{part.content.slice(p, n.index)}</span>);
      chunks.push(
        <code
          key={`c${n.index}`}
          className="px-1.5 py-[1px] rounded-md bg-black/5 dark:bg-white/10 font-mono text-[0.85em] text-slate-800 dark:text-slate-200 break-words box-decoration-clone not-italic"
        >
          {n[1]}
        </code>,
      );
      p = n.index + n[0].length;
    }
    if (p < part.content.length) chunks.push(<span key={`t${p}`}>{part.content.slice(p)}</span>);

    return <React.Fragment key={i}>{chunks}</React.Fragment>;
  });
};

/**
 * Strips markdown code markers — used in truncated one-line previews
 * (accordion headers) where a code block would break the layout.
 */
export const stripMarkdown = (text) => {
  if (!text) return "";
  return text
    .replace(/```[\w]*\n?[\s\S]*?```/g, "[code snippet]")
    .replace(/`([^`\n]+)`/g, "$1");
};
