import Link from "next/link";

type StatTone = "default" | "accent" | "warning";

const TONE_CLASSES: Record<StatTone, string> = {
  default: "text-fg",
  accent: "text-accent",
  warning: "text-warning",
};

type StatCardProps = {
  label: string;
  value: number;
  href?: string;
  tone?: StatTone;
};

export function StatCard({ label, value, href, tone = "default" }: StatCardProps) {
  const baseClasses =
    "flex flex-col gap-1 rounded-lg border border-border bg-surface px-3 py-2.5";

  const content = (
    <>
      <span className="text-xs text-fg-muted">{label}</span>
      <span
        className={`font-mono text-lg font-medium tabular-nums ${TONE_CLASSES[tone]}`}
      >
        {value.toLocaleString("en-US")}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClasses} transition-colors hover:border-border-strong hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
      >
        {content}
      </Link>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}
