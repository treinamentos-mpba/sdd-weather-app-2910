import { useId } from 'react';

interface EmptyStateProps {
  title: string;
  hint: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  const headingId = useId();

  return (
    <section
      role="status"
      aria-labelledby={headingId}
      className="rounded-lg border border-white/10 bg-white/5 p-5 text-white/85 backdrop-blur-md"
    >
      <h2 id={headingId} className="text-base font-semibold text-white">
        {title}
      </h2>
      <p className="mt-1 text-sm text-white/70">{hint}</p>
    </section>
  );
}
