import { useAuth } from "../../context/AuthContext";
import { usePollVote } from "../../hooks/usePollVote";

export default function PollDisplay({ postId, poll }) {
  const { user } = useAuth();
  const { votedOptionId, castVote } = usePollVote(postId, user.uid);

  const totalVotes = poll.options.reduce((sum, option) => sum + (option.votes || 0), 0);
  const hasVoted = Boolean(votedOptionId);

  return (
    <div className="mt-3 rounded-xl border border-border p-3">
      <p className="mb-3 text-sm font-medium text-text-primary">{poll.question}</p>

      <div className="flex flex-col gap-2">
        {poll.options.map((option) => {
          const votes = option.votes || 0;
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const isSelected = votedOptionId === option.id;

          if (!hasVoted) {
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => castVote(option.id, poll)}
                className="rounded-lg border border-border px-3 py-2 text-left text-sm text-text-primary hover:border-accent"
              >
                {option.text}
              </button>
            );
          }

          // After voting: show a filled progress bar with the percentage,
          // rather than plain clickable buttons.
          return (
            <div
              key={option.id}
              className="relative overflow-hidden rounded-lg border border-border px-3 py-2 text-sm"
            >
              <div
                className="absolute inset-y-0 left-0 bg-accent/15"
                style={{ width: `${percentage}%` }}
              />
              <div className="relative flex items-center justify-between">
                <span className={isSelected ? "font-semibold text-text-primary" : "text-text-secondary"}>
                  {option.text}
                  {isSelected && " ✓"}
                </span>
                <span className="text-text-muted">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-text-muted">
        {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
      </p>
    </div>
  );
}