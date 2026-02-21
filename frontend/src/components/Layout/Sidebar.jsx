import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/products', label: 'Products' },
  { to: '/activity-logs', label: 'Activity Logs', adminOnly: true },
];

export default function Sidebar() {
  const { user } = useAuth();
  const filtered = links.filter((l) => !l.adminOnly || user?.role === 'admin');

  return (
    <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2 font-semibold text-lg">
        <span className="text-indigo-400">◉</span>
        <span>PLM</span>
      </div>
      <nav className="p-2 flex flex-col gap-0.5">
        {filtered.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-400 border-r-2 border-indigo-500'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
