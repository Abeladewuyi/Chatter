import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Search } from "lucide-react";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import UserCard from "../../components/UserCard/UserCard";

export default function Explore() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setAllUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const query = searchText.trim().toLowerCase();

  const results = allUsers.filter((u) => {
    if (u.id === user.uid) return false;
    if (!query) return true;
    return (
      u.username?.toLowerCase().includes(query) ||
      u.displayName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-semibold text-text-primary">Explore</h1>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by username or name"
          className="w-full rounded-lg border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm text-text-primary outline-none focus:border-accent"
        />
      </div>

      {loading && <p className="text-sm text-text-secondary">Loading users...</p>}

      {!loading && results.length === 0 && (
        <p className="text-sm text-text-secondary">
          {query ? "No users match that search." : "No other users yet."}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {results.map((profile) => (
          <UserCard key={profile.id} profile={profile} />
        ))}
      </div>
    </div>
  );
}