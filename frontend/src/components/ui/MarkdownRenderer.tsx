"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Parses inline markdown: **bold**, *italic*, `code`, [link](url), and email addresses
function renderInline(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match:
  // 1. Inline code: `...`
  // 2. Bold: **...** or __...__
  // 3. Links: [text](url)
  // 4. Emails: something@domain.com
  // 5. Italic: *...* or _..._
  const tokenRegex = /(`[^`]+`|\*\*[^*]+?\*\*|__[^_]+?__|\[[^\]]+?\]\([^)]+?\)|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b|\*[^*]+?\*|_[^_]+?_)/g;

  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchStr = match[0];

    // Push preceding plain text
    if (matchStart > lastIdx) {
      nodes.push(text.substring(lastIdx, matchStart));
    }

    const key = `inline-${matchStart}-${matchStr.substring(0, 5)}`;

    if (matchStr.startsWith("`") && matchStr.endsWith("`")) {
      // Inline code
      const codeText = matchStr.slice(1, -1);
      nodes.push(
        <code
          key={key}
          className="px-1.5 py-0.5 rounded-md bg-[#F5F2EB] text-orange-700 font-mono text-[13px] border border-[#E3DED4]"
        >
          {codeText}
        </code>
      );
    } else if (
      (matchStr.startsWith("**") && matchStr.endsWith("**")) ||
      (matchStr.startsWith("__") && matchStr.endsWith("__"))
    ) {
      // Bold text
      const boldText = matchStr.slice(2, -2);
      nodes.push(
        <strong key={key} className="font-bold text-[#1C1A17]">
          {boldText}
        </strong>
      );
    } else if (
      (matchStr.startsWith("*") && matchStr.endsWith("*")) ||
      (matchStr.startsWith("_") && matchStr.endsWith("_"))
    ) {
      // Italic text
      const italicText = matchStr.slice(1, -1);
      nodes.push(
        <em key={key} className="italic text-[#2D2A26]">
          {italicText}
        </em>
      );
    } else if (matchStr.startsWith("[") && matchStr.includes("](")) {
      // Markdown link [text](url)
      const linkMatch = matchStr.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        nodes.push(
          <a
            key={key}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-orange-600 font-semibold hover:underline"
          >
            {label}
          </a>
        );
      } else {
        nodes.push(matchStr);
      }
    } else if (matchStr.includes("@")) {
      // Email link
      nodes.push(
        <a
          key={key}
          href={`mailto:${matchStr}`}
          className="text-orange-600 font-semibold hover:underline"
        >
          {matchStr}
        </a>
      );
    } else {
      nodes.push(matchStr);
    }

    lastIdx = matchStart + matchStr.length;
  }

  // Push remainder
  if (lastIdx < text.length) {
    nodes.push(text.substring(lastIdx));
  }

  return nodes;
}

type Block =
  | { type: "h1" | "h2" | "h3" | "h4"; text: string }
  | { type: "hr" }
  | { type: "blockquote"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: { num: string; text: string }[] }
  | { type: "p"; text: string };

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  // Split into raw lines
  const rawLines = content.split("\n");
  const blocks: Block[] = [];
  let currentList: { type: "ul"; items: string[] } | null = null;
  let currentNumList: { type: "ol"; items: { num: string; text: string }[] } | null = null;
  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const pText = currentParagraphLines.join(" ").trim();
      if (pText) {
        blocks.push({ type: "p", text: pText });
      }
      currentParagraphLines = [];
    }
  };

  const flushLists = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
    if (currentNumList) {
      blocks.push(currentNumList);
      currentNumList = null;
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Blank line
    if (!trimmed) {
      flushParagraph();
      flushLists();
      continue;
    }

    // Horizontal Rule (--- or *** or ___)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      flushLists();
      blocks.push({ type: "hr" });
      continue;
    }

    // Headings
    if (trimmed.startsWith("# ") || trimmed.startsWith("## ") || trimmed.startsWith("### ") || trimmed.startsWith("#### ")) {
      flushParagraph();
      flushLists();
      if (trimmed.startsWith("# ")) {
        blocks.push({ type: "h1", text: trimmed.slice(2).trim() });
      } else if (trimmed.startsWith("## ")) {
        blocks.push({ type: "h2", text: trimmed.slice(3).trim() });
      } else if (trimmed.startsWith("### ")) {
        blocks.push({ type: "h3", text: trimmed.slice(4).trim() });
      } else {
        blocks.push({ type: "h4", text: trimmed.slice(5).trim() });
      }
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushLists();
      blocks.push({ type: "blockquote", text: trimmed.slice(2).trim() });
      continue;
    }

    // Bullet List (- item or * item)
    const bulletMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph();
      if (currentNumList) flushLists();
      if (!currentList) {
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // Numbered List (1. item, 2. item)
    const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
    if (numMatch) {
      flushParagraph();
      if (currentList) flushLists();
      if (!currentNumList) {
        currentNumList = { type: "ol", items: [] };
      }
      currentNumList.items.push({ num: numMatch[1], text: numMatch[2] });
      continue;
    }

    // Regular line inside a paragraph
    flushLists();
    currentParagraphLines.push(trimmed);
  }

  flushParagraph();
  flushLists();

  return (
    <div className={`space-y-3.5 text-[#1C1A17] ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "h1":
            return (
              <h1
                key={idx}
                className="text-lg sm:text-xl font-extrabold text-[#1C1A17] pt-2 pb-1 border-b border-[#E3DED4]"
              >
                {renderInline(block.text)}
              </h1>
            );
          case "h2":
            return (
              <h2
                key={idx}
                className="text-base sm:text-lg font-bold text-[#1C1A17] pt-3 pb-0.5 tracking-tight flex items-center gap-2"
              >
                <span className="w-1.5 h-4 rounded-full bg-orange-500 shrink-0" />
                {renderInline(block.text)}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={idx}
                className="text-[15px] sm:text-base font-bold text-[#1C1A17] pt-2 pb-0.5"
              >
                {renderInline(block.text)}
              </h3>
            );
          case "h4":
            return (
              <h4
                key={idx}
                className="text-sm font-bold text-[#1C1A17] pt-1"
              >
                {renderInline(block.text)}
              </h4>
            );
          case "hr":
            return <hr key={idx} className="border-t border-[#E3DED4] my-4" />;
          case "blockquote":
            return (
              <blockquote
                key={idx}
                className="border-l-3 border-orange-500 bg-orange-50/50 px-4 py-2 rounded-r-xl text-sm italic text-[#4A4640]"
              >
                {renderInline(block.text)}
              </blockquote>
            );
          case "ul":
            return (
              <ul key={idx} className="space-y-2 pl-1 my-2">
                {block.items.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="flex items-start gap-2.5 text-[14px] sm:text-[14.5px] leading-relaxed text-[#2D2A26]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                    <span className="flex-1">{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={idx} className="space-y-2.5 pl-1 my-2">
                {block.items.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="flex items-start gap-2.5 text-[14px] sm:text-[14.5px] leading-relaxed text-[#2D2A26]"
                  >
                    <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1 rounded-md bg-orange-100/80 text-orange-800 text-[11px] font-extrabold shrink-0 mt-0.5 border border-orange-200/50">
                      {item.num}
                    </span>
                    <span className="flex-1">{renderInline(item.text)}</span>
                  </li>
                ))}
              </ol>
            );
          case "p":
            return (
              <p
                key={idx}
                className="text-[14px] sm:text-[14.5px] leading-relaxed text-[#2D2A26]"
              >
                {renderInline(block.text)}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
