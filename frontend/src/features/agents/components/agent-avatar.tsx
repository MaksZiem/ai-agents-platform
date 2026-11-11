type AgentAvatarProps = {
  name: string;
};

export function AgentAvatar({ name }: AgentAvatarProps) {
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-sm font-semibold text-fg-muted"
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
