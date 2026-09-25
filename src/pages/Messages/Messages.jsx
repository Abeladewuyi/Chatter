import { useEffect, useRef, useState } from "react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Check,
  CheckCheck,
  MoreVertical,
  Phone,
  PlusSquare,
  Send,
  Search as SearchIcon,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useConversations } from "../../hooks/useConversations";
import { useMessages } from "../../hooks/useMessages";
import {
  ensureConversation,
  sendMessage,
} from "../../firebase/messages";

async function markConversationAsRead(conversationId, myUid) {
  if (!conversationId) return;

  const messagesSnapshot = await getDocs(
    collection(db, "conversations", conversationId, "messages")
  );

  const unreadIncomingMessages = messagesSnapshot.docs.filter(
    (messageDocument) => {
      const message = messageDocument.data();

      return message.senderId !== myUid && message.read !== true;
    }
  );

  if (unreadIncomingMessages.length === 0) return;

  await Promise.all(
    unreadIncomingMessages.map((messageDocument) =>
      updateDoc(
        doc(
          db,
          "conversations",
          conversationId,
          "messages",
          messageDocument.id
        ),
        {
          delivered: true,
          read: true,
        }
      )
    )
  );
}

async function markConversationAsUnread(
  conversationId,
  messages,
  myUid
) {
  const incomingMessages = messages.filter(
    (message) => message.senderId !== myUid
  );

  if (incomingMessages.length === 0) return;

  const mostRecentMessage =
    incomingMessages[incomingMessages.length - 1];

  await updateDoc(
    doc(
      db,
      "conversations",
      conversationId,
      "messages",
      mostRecentMessage.id
    ),
    {
      read: false,
    }
  );
}

function UnreadCountBadge({ count }) {
  if (count === 0) return null;

  return (
    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-on-accent">
      {count > 9 ? "9+" : count}
    </span>
  );
}

function ConversationRow({ conversation, myUid, searchQuery }) {
  const otherUid = conversation.participants.find(
    (id) => id !== myUid
  );

  const { profile } = useUserProfile(otherUid);
  const { messages } = useMessages(conversation.id);

  const unreadMessages = messages.filter(
    (message) =>
      message.senderId !== myUid && message.read !== true
  );

  const hasUnreadMessages = unreadMessages.length > 0;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const incomingUndeliveredMessages = messages.filter(
      (message) =>
        message.senderId !== myUid && message.delivered !== true
    );

    if (incomingUndeliveredMessages.length === 0) return;

    Promise.all(
      incomingUndeliveredMessages.map((message) =>
        updateDoc(
          doc(
            db,
            "conversations",
            conversation.id,
            "messages",
            message.id
          ),
          {
            delivered: true,
          }
        )
      )
    ).catch((error) => {
      console.error("Could not mark message as delivered:", error);
    });
  }, [conversation.id, messages, myUid]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  if (!profile) return null;

  if (searchQuery) {
    const searchText = searchQuery.toLowerCase();
    const name = (profile.displayName || "").toLowerCase();
    const lastMessage = (
      conversation.lastMessage || ""
    ).toLowerCase();

    if (
      !name.includes(searchText) &&
      !lastMessage.includes(searchText)
    ) {
      return null;
    }
  }

  async function handleToggleReadStatus() {
    setMenuOpen(false);

    if (hasUnreadMessages) {
      await markConversationAsRead(conversation.id, myUid);
    } else {
      await markConversationAsUnread(
        conversation.id,
        messages,
        myUid
      );
    }
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-5 transition-colors hover:bg-accent/5 ${
        hasUnreadMessages ? "bg-accent/5" : "bg-transparent"
      }`}
    >
      <Link
        to={`/messages/${otherUid}`}
        onClick={() =>
          markConversationAsRead(conversation.id, myUid)
        }
        className="flex min-w-0 flex-1 items-center gap-4"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-accent">
          {profile.photoURL ? (
            <img
              src={profile.photoURL}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            profile.displayName?.charAt(0).toUpperCase() || "?"
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-medium text-text-primary">
                {profile.displayName}
              </p>

              <p
                className={`truncate text-sm ${
                  hasUnreadMessages
                    ? "font-medium text-text-primary"
                    : "text-text-muted"
                }`}
              >
                {conversation.lastMessage || "Say hello!"}
              </p>
            </div>

            <p className="shrink-0 pl-2 text-xs text-text-muted">
              {formatRelativeTimestamp(
                conversation.lastMessageAt
              )}
            </p>
          </div>
        </div>
      </Link>

      <UnreadCountBadge count={unreadMessages.length} />

      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="p-2 text-text-muted hover:text-text-primary"
          aria-label="Conversation options"
        >
          <MoreVertical size={18} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
            <button
              type="button"
              onClick={handleToggleReadStatus}
              className="block w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-surface-2"
            >
              {hasUnreadMessages
                ? "Mark as read"
                : "Mark as unread"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatRelativeTimestamp(timestamp) {
  if (!timestamp) return "";

  const date = timestamp.toDate
    ? timestamp.toDate()
    : new Date(timestamp);

  const difference = Date.now() - date.getTime();
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);

  if (weeks < 52) return `${weeks}w`;

  return `${Math.floor(weeks / 52)}y`;
}

function ConversationList({ myUid, searchQuery }) {
  const { conversations, loading } = useConversations(myUid);

  if (loading) {
    return (
      <p className="text-sm text-text-secondary">
        Loading conversations...
      </p>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center text-text-secondary">
        No conversations yet. Visit someone’s profile and tap
        Message to start one.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {conversations.map((conversation) => (
        <ConversationRow
          key={conversation.id}
          conversation={conversation}
          myUid={myUid}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
}

function formatTime(timestamp) {
  if (!timestamp) return "";

  return timestamp.toDate().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageStatus({ message }) {
  if (!message.delivered) {
    return <Check size={15} className="text-white/80" />;
  }

  return (
    <CheckCheck
      size={16}
      className={
        message.read ? "text-sky-400" : "text-white/90"
      }
    />
  );
}

function ChatWindow({ myUid, otherUid }) {
  const navigate = useNavigate();
  const { profile: otherProfile } = useUserProfile(otherUid);

  const [conversationId, setConversationId] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    ensureConversation(myUid, otherUid).then((id) => {
      if (!cancelled) {
        setConversationId(id);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [myUid, otherUid]);

  const { messages, loading } = useMessages(conversationId);

  useEffect(() => {
    if (!conversationId || messages.length === 0) return;

    const unreadIncomingMessages = messages.filter(
      (message) =>
        message.senderId !== myUid && message.read !== true
    );

    if (unreadIncomingMessages.length === 0) return;

    Promise.all(
      unreadIncomingMessages.map((message) =>
        updateDoc(
          doc(
            db,
            "conversations",
            conversationId,
            "messages",
            message.id
          ),
          {
            delivered: true,
            read: true,
          }
        )
      )
    ).catch((error) => {
      console.error("Could not mark messages as read:", error);
    });
  }, [conversationId, messages, myUid]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!text.trim() || !conversationId) return;

    setSending(true);

    try {
      await sendMessage(conversationId, myUid, otherUid, text.trim());
      setText("");
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  }

  function handleBlock() {
    setMenuOpen(false);

    if (
      window.confirm(
        `Block ${otherProfile?.displayName || "this user"}?`
      )
    ) {
      alert("Block action will be connected to Firestore next.");
    }
  }

  function handleReport() {
    setMenuOpen(false);

    if (
      window.confirm(
        `Report ${otherProfile?.displayName || "this user"}?`
      )
    ) {
      alert("Report submitted.");
    }
  }

  const displayName =
    otherProfile?.displayName || "Chatter member";

  const jobTitle = otherProfile?.jobTitle?.trim();

  const initial = displayName.charAt(0).toUpperCase();

  const canSend = text.trim().length > 0 && !sending;

  return (
    <div className="flex min-h-screen flex-col bg-bg pb-20 lg:pb-0">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/messages")}
            aria-label="Back to messages"
            className="text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft size={21} />
          </button>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-accent">
            {otherProfile?.photoURL ? (
              <img
                src={otherProfile.photoURL}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              initial
            )}
          </div>

          <p className="truncate text-sm font-semibold text-text-primary">
            {displayName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            title="Calls are coming later"
            aria-label="Calls are coming later"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted opacity-50"
          >
            <Phone size={19} />
          </button>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Conversation options"
              className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2 hover:text-text-primary"
            >
              <MoreVertical size={20} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
                <button
                  type="button"
                  onClick={handleBlock}
                  className="block w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-surface-2"
                >
                  Block user
                </button>

                <button
                  type="button"
                  onClick={handleReport}
                  className="block w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-surface-2"
                >
                  Report user
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-3">
        {loading && (
          <p className="text-center text-sm text-text-secondary">
            Loading messages...
          </p>
        )}

        {/* Small contact section, close to the chat header */}
        {!loading && (
          <section className="mx-auto mb-5 flex max-w-xs flex-col items-center border-b border-border pb-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-base font-semibold text-accent">
              {otherProfile?.photoURL ? (
                <img
                  src={otherProfile.photoURL}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
            </div>

            <h1 className="mt-2 text-sm font-semibold text-text-primary">
              {displayName}
            </h1>

            {jobTitle && (
              <p className="mt-0.5 text-xs text-text-secondary">
                {jobTitle}
              </p>
            )}

            {/* This text exists only before the first message */}
            {messages.length === 0 && (
              <p className="mt-3 text-xs text-text-muted">
                Start a conversation with {displayName}.
              </p>
            )}
          </section>
        )}

        <div className="space-y-3 pb-5">
          {messages.map((message) => {
            const isMine = message.senderId === myUid;

            return (
              <div
                key={message.id}
                className={`flex ${
                  isMine ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${
                    isMine
                      ? "rounded-br-md bg-accent text-white"
                      : "rounded-bl-md border border-border bg-surface text-text-primary"
                  }`}
                >
                  <p className="whitespace-pre-wrap">
                    {message.text}
                  </p>

                  <div
                    className={`mt-1 flex items-center gap-1 ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span
                      className={`text-[11px] ${
                        isMine ? "text-white/70" : "text-text-muted"
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </span>

                    {isMine && (
                      <MessageStatus message={message} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <form
        onSubmit={handleSubmit}
        className="border-t border-border bg-surface px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={1000}
            placeholder="Write a message..."
            className="flex-1 rounded-full border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent"
          />

          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              canSend
                ? "bg-accent text-white hover:bg-accent-hover"
                : "cursor-not-allowed bg-surface-2 text-text-muted"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
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

              <h1 className="text-2xl font-semibold text-text-primary">
                Messages
              </h1>
            </div>

            <Link
              to="/messages/new"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-on-accent hover:opacity-95"
            >
              <PlusSquare size={22} />
            </Link>
          </div>

          <div className="mb-6 mt-10">
            <div className="relative">
              <input
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search messages"
                className="h-14 w-full rounded-xl border-0 bg-surface-2 px-12 py-5 text-lg text-text-primary outline-none"
              />

              <SearchIcon
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
            </div>
          </div>

          <ConversationList
            myUid={user.uid}
            searchQuery={searchQuery}
          />
        </>
      ) : (
        <ChatWindow myUid={user.uid} otherUid={otherUid} />
      )}
    </div>
  );
}