type JsonBlockProps = {
  value: unknown;
};

export function JsonBlock({ value }: JsonBlockProps) {
  return (
    <pre className="overflow-auto rounded-lg border border-border bg-surface-2 p-3 font-mono text-[13px] leading-relaxed">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
