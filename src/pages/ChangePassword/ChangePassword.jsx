import { useNavigate } from "react-router-dom";
export default function ChangePassword(){
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Change Password</h2>
      </header>

      <p className="text-sm text-text-secondary">This page is a placeholder. Implement password change flow here.</p>

      <div className="mt-6">
        <button onClick={() => navigate(-1)} className="rounded-md px-4 py-2 bg-surface text-text-primary">Back</button>
      </div>
    </div>
  );
}
