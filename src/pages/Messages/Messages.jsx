import { useEffect, useRef, useState } from "react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { Link, useParams } from "react-router-dom";
import { Send, ArrowLeft, PlusSquare, Search as SearchIcon, MoreVertical } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useConversations } from "../../hooks/useConversations";
import { useMessages } from "../../hooks/useMessages";
import { ensureConversation, sendMessage } from "../../firebase/messages";

async function markConversationAsRead(conversationId, myUid) {
  if (!conversationId) return;

  const messagesSnap = await getDocs(collection(db, "conversations", conversationId, "messages"));
  const unreadIncomingMessages = messagesSnap.docs.filter((messageDoc) => {
    const message = messageDoc.data();
    return message.senderId !== myUid && message.read !== true;
  });

  if (unreadIncomingMessages.length === 0) return;

  await Promise.all(
    unreadIncomingMessages.map((messageDoc) =>
      updateDoc(doc(db, "conversations", conversationId, "messages", messageDoc.id), { read: true })
    )
  );
}

/**
 * "Mark as unread" doesn't need to flip every message back to unread —
 * that's not how any messaging app actually works. Flipping just the most
 * recent incoming message is enough to make the conversation show up as
 * unread again (matches Gmail/WhatsApp-style "mark as unread" behavior).
 */
async function markConversationAsUnread(conversationId, messages, myUid) {
  const incoming = messages.filter((m) => m.senderId !== myUid);
  if (incoming.length === 0) return;

  const mostRecent = incoming[incoming.length - 1];
  await updateDoc(
    doc(db, "conversations", conversationId, "messages", mostRecent.id),
    { read: false }
  );
}

function ConversationRow({ conversation, myUid, searchQuery }) {
  const otherUid = conversation.participants.find((id) => id !== myUid);
  const { profile } = useUserProfile(otherUid);
  const { messages } = useMessages(conversation.id);
  const hasUnreadMessages = messages.some(
    (message) => message.senderId !== myUid && message.read !== true
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the menu if you click anywhere else on the page.
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  if (!profile) return null;

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    const name = (profile.displayName || "").toLowerCase();
    const last = (conversation.lastMessage || "").toLowerCase();
    if (!name.includes(q) && !last.includes(q)) return null;
  }

  async function handleToggleReadStatus() {
    setMenuOpen(false);
    if (hasUnreadMessages) {
      await markConversationAsRead(conversation.id, myUid);
    } else {
      await markConversationAsUnread(conversation.id, messages, myUid);
    }
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-xl py-5 px-3 transition-colors hover:bg-accent/5 ${
        hasUnreadMessages ? "bg-accent/5" : "bg-transparent"
      }`}
    >
      <Link
        to={`/messages/${otherUid}`}
        onClick={() => markConversationAsRead(conversation.id, myUid)}
        className="flex min-w-0 flex-1 items-center gap-4"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-accent ring-1 ring-white">
          {profile.photoURL ? (
            <img src={profile.photoURL} alt="" className="h-full w-full object-cover" />
          ) : (
            profile.displayName?.charAt(0).toUpperCase() || "?"
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-medium text-text-primary">{profile.displayName}</p>
              <p
                className={`truncate text-sm ${
                  hasUnreadMessages ? "font-medium text-text-primary" : "text-text-muted"
                }`}
              >
                {conversation.lastMessage || "Say hello!"}
              </p>
            </div>
            <div className="shrink-0 pl-2">
              <p className="text-xs text-text-muted">{formatRelativeTimestamp(conversation.lastMessageAt)}</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Unread dot — a quick at-a-glance signal, separate from the menu */}
      {hasUnreadMessages && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}

      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="p-2 text-text-muted hover:text-text-primary"
          aria-label="Conversation options"
        >
          <MoreVertical size={18} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
            <button
              onClick={handleToggleReadStatus}
              className="block w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-surface-2"
            >
              {hasUnreadMessages ? "Mark as read" : "Mark as unread"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatRelativeTimestamp(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 52) return `${diffWeeks}w`;
  const diffYears = Math.floor(diffWeeks / 52);
  return `${diffYears}y`;
}

function ConversationList({ myUid, searchQuery }) {
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
        <ConversationRow key={c.id} conversation={c} myUid={myUid} searchQuery={searchQuery} />
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

  useEffect(() => {
    if (!conversationId || !messages.length) return;

    const unreadIncomingMessages = messages.filter(
      (message) => message.senderId !== myUid && message.read !== true
    );

    if (unreadIncomingMessages.length === 0) return;

    Promise.all(
      unreadIncomingMessages.map((message) =>
        updateDoc(doc(db, "conversations", conversationId, "messages", message.id), { read: true })
      )
    ).catch((err) => console.error("Failed to mark messages as read:", err));
  }, [conversationId, messages, myUid]);

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
    <div className="relative flex h-[calc(100vh-3rem)] flex-col pt-10">
      <div className="absolute left-0 top-0 z-10 flex w-full items-center gap-3 border-b border-border bg-bg pb-3 pt-2">
        <Link to="/messages" className="ml-0 text-text-secondary hover:text-accent">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-accent ring-1 ring-white">
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

      <div className="flex-1 space-y-2 overflow-y-auto">
        {loading && <p className="text-sm text-text-secondary">Loading messages...</p>}

        {!loading && messages.length === 0 && (
          <p className="text-sm text-text-muted">No messages yet. Say hello!</p>
        )}

        {messages.map((message) => {
          const isMine = message.senderId === myUid;
          return (
            <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs rounded-2xl px-3 py-1.5 text-sm ${
                  // Fixed: bg-accent is WHITE in this monochrome theme, so
                  // "text-white" on it would be invisible. text-on-accent
                  // flips correctly with the theme (black in dark mode,
                  // white in light mode). The received bubble now uses a
                  // clearly distinct surface tone plus a border so it
                  // doesn't blend into the page background.
                  isMine
                    ? "bg-accent text-on-accent"
                    : "border border-border bg-surface-2 text-text-primary"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                <p
                  className={`mt-1 text-xs ${
                    isMine ? "text-on-accent/70" : "text-text-muted"
                  }`}
                >
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
          className="flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-on-accent hover:bg-accent-hover disabled:opacity-50"
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
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="mx-auto max-w-2xl p-6">
      {!otherUid ? (
        <>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                aria-label="Go back"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-text-secondary transition hover:text-text-primary"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-semibold text-text-primary">Messages</h1>
            </div>
            <Link
              to="/messages/new"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-on-accent hover:opacity-95 focus:outline-none focus:ring-0"
            >
              <PlusSquare size={22} />
            </Link>
          </div>

          <div className="mb-6 mt-10">
            <div className="relative">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages"
                className="h-14 w-full rounded-xl border-0 bg-surface-2 px-12 py-5 text-lg text-text-primary outline-none focus:ring-0"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <SearchIcon size={20} />
              </div>
            </div>
          </div>

          <ConversationList myUid={user.uid} searchQuery={searchQuery} />
        </>
      ) : (
        <ChatWindow myUid={user.uid} otherUid={otherUid} />
      )}
    </div>
  );
}