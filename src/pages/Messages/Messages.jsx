import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Send, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useConversations } from "../../hooks/useConversations";
import { useMessages } from "../../hooks/useMessages";
import { ensureConversation, sendMessage } from "../../firebase/messages";

function ConversationRow({ conversation, myUid }) {
  const otherUid = conversation.participants.find((id) => id !== myUid);
  const { profile } = useUserProfile(otherUid);

  if (!profile) return null;

  return (
    <Link
      to={`/messages/${otherUid}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 hover:border-accent"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-accent">
        {profile.photoURL ? (
          <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
        ) : (
          profile.displayName?.charAt(0).toUpperCase() || "?"
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary">{profile.displayName}</p>
        <p className="truncate text-xs text-text-muted">
          {conversation.lastMessage || "Say hello!"}
        </p>
      </div>
    </Link>
  );
}

function ConversationList({ myUid }) {
  const { conversations, loading } = useConversations(myUid);

  if (loading) return <p className="text-sm text-text-secondary">Loading conversations...</p>;

  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center text-text-secondary">
        No conversations yet. Visit someone's profile and hit Message to start one.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {conversations.map((c) => (
        <ConversationRow key={c.id} conversation={c} myUid={myUid} />
      ))}
    </div>
  );
}

function formatTime(timestamp) {
  if (!timestamp) return "";
  return timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ChatWindow({ myUid, otherUid }) {
  const { profile: otherProfile } = useUserProfile(otherUid);
  const [conversationId, setConversationId] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ensureConversation(myUid, otherUid).then((id) => {
      if (!cancelled) setConversationId(id);
    });
    return () => {
      cancelled = true;
    };
  }, [myUid, otherUid]);

  const { messages, loading } = useMessages(conversationId);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || !conversationId) return;

    setSending(true);
    try {
      await sendMessage(conversationId, myUid, otherUid, text.trim());
      setText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
        <Link to="/messages" className="text-text-secondary hover:text-accent">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-accent">
          {otherProfile?.photoURL ? (
            <img src={otherProfile.photoURL} alt="" className="h-full w-full object-cover" />
          ) : (
            otherProfile?.displayName?.charAt(0).toUpperCase() || "?"
          )}
        </div>
        <p className="text-sm font-medium text-text-primary">
          {otherProfile?.displayName || "..."}
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {loading && <p className="text-sm text-text-secondary">Loading messages...</p>}

        {!loading && messages.length === 0 && (
          <p className="text-sm text-text-muted">No messages yet. Say hello!</p>
        )}

        {messages.map((message) => {
          const isMine = message.senderId === myUid;
          return (
            <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                  isMine ? "bg-accent text-white" : "bg-surface-2 text-text-primary"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                <p className={`mt-1 text-xs ${isMine ? "text-white/70" : "text-text-muted"}`}>
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 border-t border-border pt-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-white hover:bg-accent-hover disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

export default function Messages() {
  const { user } = useAuth();
  const { uid: otherUid } = useParams();

  return (
    <div className="mx-auto max-w-2xl p-6">
      {!otherUid ? (
        <>
          <h1 className="mb-4 text-xl font-semibold text-text-primary">Messages</h1>
          <ConversationList myUid={user.uid} />
        </>
      ) : (
        <ChatWindow myUid={user.uid} otherUid={otherUid} />
      )}
    </div>
  );
}