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
      if (!cancelled) setConversationId(id);
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
          doc(db, "conversations", conversationId, "messages", message.id),
          { delivered: true, read: true }
        )
      )
    ).catch((error) => {
      console.error("Could not mark messages as read:", error);
    });
  }, [conversationId, messages, myUid]);

  useEffect(() => {
    if (!menuOpen) return;

    function closeMenu(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenu);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
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

  function handleBack() {
    navigate("/messages");
  }

  function handleBlock() {
    setMenuOpen(false);

    const confirmed = window.confirm(
      `Block ${otherProfile?.displayName || "this user"}?`
    );

    if (confirmed) {
      // We will connect this to the permanent block feature next.
      navigate("/messages");
    }
  }

  function handleReport() {
    setMenuOpen(false);

    const confirmed = window.confirm(
      `Report ${otherProfile?.displayName || "this user"}?`
    );

    if (confirmed) {
      // We will connect this to the permanent report feature next.
      navigate("/messages");
    }
  }

  const displayName = otherProfile?.displayName || "Chatter member";
  const jobTitle = otherProfile?.jobTitle || "Chatter member";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-bg pb-20 lg:pb-0">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
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

      <main className="flex-1 overflow-y-auto px-4 py-6">
        {loading && (
          <p className="text-center text-sm text-text-secondary">
            Loading messages...
          </p>
        )}

        {!loading && messages.length === 0 && (
          <section className="mx-auto flex max-w-xs flex-col items-center py-10 text-center">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-2xl font-semibold text-accent">
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

            <h1 className="mt-4 text-lg font-semibold text-text-primary">
              {displayName}
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              {jobTitle}
            </p>

            <p className="mt-5 text-sm text-text-muted">
              Start a conversation with {displayName}.
            </p>
          </section>
        )}

        <div className="space-y-3">
          {messages.map((message) => {
            const isMine = message.senderId === myUid;

            return (
              <div
                key={message.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${
                    isMine
                      ? "rounded-br-md bg-accent text-white"
                      : "rounded-bl-md border border-border bg-surface text-text-primary"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>

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

                    {isMine && <MessageStatus message={message} />}
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
            disabled={sending || !text.trim()}
            aria-label="Send message"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white hover:bg-accent-hover disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}