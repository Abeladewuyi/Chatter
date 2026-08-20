import { Search } from "lucide-react";

export default function Explore() {
  return (
    <div className="min-h-screen bg-bg pb-24 lg:pb-0">
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold text-text-primary">Explore</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Find people and discover conversations.
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-8 text-center">
          <Search size={28} className="mx-auto text-accent" />
          <h2 className="mt-4 text-lg font-semibold text-text-primary">
            Discover people
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            User search will appear here when we build following.
          </p>
        </div>
      </main>
    </div>
  );
}