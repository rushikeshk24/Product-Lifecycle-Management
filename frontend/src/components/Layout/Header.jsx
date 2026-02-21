import { useAuth } from '../../context/AuthContext';

const roleColors = {
  admin: 'bg-violet-500/20 text-violet-400 border-violet-500/40',
  developer: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  tester: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
};

export default function Header() {
  const { user, logout } = useAuth();
  const roleClass = roleColors[user?.role] || 'bg-zinc-600/20 text-zinc-400';

  return (
    <header className="h-14 border-b border-zinc-800 flex items-center justify-end px-6 bg-zinc-900/50">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-200">{user?.name}</span>
        <span
          className={`text-xs font-medium uppercase px-2 py-0.5 rounded border ${roleClass}`}
        >
          {user?.role}
        </span>
        <button
          type="button"
          onClick={logout}
          className="text-sm px-3 py-1.5 rounded-lg border border-zinc-600 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
