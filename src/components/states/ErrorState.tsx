interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-4 rounded-lg border border-rose-300/25 bg-rose-400/10 p-4 text-rose-50 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-10 shrink-0 rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
      >
        Tentar novamente
      </button>
    </div>
  );
}
