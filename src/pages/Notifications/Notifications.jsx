import { Bell } from "lucide-react";

export default function Notifications() {
  return (
    <div className="min-h-screen bg-bg pb-24 lg:pb-0">
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold text-text-primary">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Stay up to date with your activity.
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-8 text-center">
          <Bell size={28} className="mx-auto text-accent" />
          <h2 className="mt-4 text-lg font-semibold text-text-primary">
            You’re all caught up
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            New likes, comments, and follows will appear here.
          </p>
        </div>
      </main>
    </div>
  );
}