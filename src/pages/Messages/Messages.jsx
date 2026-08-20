import { MessageCircle } from "lucide-react";

export default function Messages() {
  return (
    <div className="min-h-screen bg-bg pb-24 lg:pb-0">
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold text-text-primary">Messages</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Your private conversations will live here.
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-8 text-center">
          <MessageCircle size={28} className="mx-auto text-accent" />
          <h2 className="mt-4 text-lg font-semibold text-text-primary">
            No messages yet
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Start a conversation once messaging is built.
          </p>
        </div>
      </main>
    </div>
  );
}