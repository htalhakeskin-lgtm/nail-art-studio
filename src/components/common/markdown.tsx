import type { Route } from "next";
import Link from "next/link";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders trusted Markdown from the repository or the panel (legal texts, service bodies) as
 * React elements. Raw HTML in the source is dropped (skipHtml), so no HTML string ever reaches
 * the DOM and <SafeHtml> is not needed (plan K-16).
 */
const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-medium tracking-tight text-foreground md:text-5xl">{children}</h1>
  ),
  h2: ({ children }) => <h2 className="mt-12 text-2xl font-medium md:text-3xl">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 text-xl font-medium">{children}</h3>,
  p: ({ children }) => <p className="mt-4">{children}</p>,
  ul: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-5">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="mt-4 border-l-4 border-accent pl-4 italic">{children}</blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-surface-muted px-1 py-0.5 text-[0.9em] break-all">{children}</code>
  ),
  a: ({ href = "", children }) =>
    href.startsWith("/") ? (
      <Link
        href={href as Route}
        className="text-brand underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        {children}
      </Link>
    ) : (
      <a
        href={href}
        rel="noopener noreferrer"
        className="text-brand underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        {children}
      </a>
    ),
  // Tables scroll inside their own box; the page itself never scrolls sideways (07-mobil).
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border bg-surface-muted px-3 py-2 font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="border-b border-border px-3 py-2 align-top">{children}</td>,
};

export function MarkdownContent({ children }: { children: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
      {children}
    </Markdown>
  );
}
