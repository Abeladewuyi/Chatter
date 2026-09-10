import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PostCard from "../../components/PostCard/PostCard";
import { usePost } from "../../hooks/usePost";

export default function Post() {
  const { postId } = useParams();
  const { post, loading } = usePost(postId);

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-5 sm:px-6">
      <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft size={18} />
        Back to home
      </Link>
      {loading && <p className="py-8 text-center text-sm text-text-secondary">Loading post...</p>}
      {!loading && !post && <p className="py-8 text-center text-sm text-text-secondary">Post not found.</p>}
      {post && <PostCard post={post} showComments />}
    </main>
  );
}