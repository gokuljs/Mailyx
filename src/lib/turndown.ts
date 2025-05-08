import TurndownService from "turndown";

export const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  strongDelimiter: "**",
  bulletListMarker: "-",
  linkStyle: "inlined",
});

// Remove link tags but keep content
turndown.addRule("linkRemover", {
  filter: "a",
  replacement: (content) => content,
});

// Remove style tags completely
turndown.addRule("styleRemover", {
  filter: "style",
  replacement: () => "",
});

// Remove script tags completely
turndown.addRule("scriptRemover", {
  filter: "script",
  replacement: () => "",
});

// Remove image tags but keep alt text
turndown.addRule("imageRemover", {
  filter: "img",
  replacement: (content, node) => {
    const element = node as HTMLElement;
    const alt = element.getAttribute("alt");
    return alt ? alt : "";
  },
});

// Remove hidden elements
turndown.addRule("hiddenElementRemover", {
  filter: (node) => {
    const element = node as HTMLElement;
    const style = element.getAttribute("style");
    return Boolean(
      style &&
        (style.includes("display: none") ||
          style.includes("visibility: hidden")),
    );
  },
  replacement: () => "",
});

// Clean and normalize text
export function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/\n\s*\n/g, "\n\n") // Normalize multiple line breaks
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with spaces
    .trim(); // Trim whitespace
}

// Process email for search indexing
export function processEmailText(htmlContent: string): string {
  const markdown = turndown.turndown(htmlContent || "");
  return normalizeText(markdown);
}
