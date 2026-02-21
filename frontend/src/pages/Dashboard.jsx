import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/ui/Spinner';

const STAGE_LABELS = {
  design: 'In Design',
  development: 'In Development',
  testing: 'In Testing',
  released: 'Released',
};

const CARD_COLORS = {
  total: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30',
  design: 'from-zinc-500/20 to-zinc-600/10 border-zinc-500/30',
  development: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  testing: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  released: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    Promise.all([
      api.get('/products/stats'),
      api.get('/products?limit=5'),
    ])
      .then(([statsRes, recentRes]) => {
        setStats(statsRes.data.data || { total: 0, design: 0, development: 0, testing: 0, released: 0 });
        setRecent(recentRes.data.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner className="w-8 h-8 border-t-indigo-500" />
        <span className="text-zinc-400 text-sm">Loading dashboard…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl">
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
          {error}
        </div>
      </div>
    );
  }

  const statCards = [
    { key: 'total', label: 'Total Products', value: stats?.total ?? 0 },
    { key: 'design', label: STAGE_LABELS.design, value: stats?.design ?? 0 },
    { key: 'development', label: STAGE_LABELS.development, value: stats?.development ?? 0 },
    { key: 'testing', label: STAGE_LABELS.testing, value: stats?.testing ?? 0 },
    { key: 'released', label: STAGE_LABELS.released, value: stats?.released ?? 0 },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-zinc-100 mb-1">Dashboard</h1>
      <p className="text-zinc-400 text-sm mb-8">Product lifecycle overview</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {statCards.map(({ key, label, value }) => (
          <div
            key={key}
            className={`rounded-xl border bg-gradient-to-br p-5 transition-all hover:shadow-lg hover:scale-[1.02] ${CARD_COLORS[key]}`}
          >
            <p className="text-2xl font-bold text-zinc-100 tabular-nums">{value}</p>
            <p className="text-sm text-zinc-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Recent products</h2>
          <Link
            to="/products"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="py-12 text-center rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30">
            <p className="text-zinc-500 text-sm">No products yet.</p>
            <Link to="/products/new" className="inline-block mt-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium">
              Create your first product
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {recent.map((p) => (
              <li key={p._id}>
                <Link
                  to={`/products/${p._id}`}
                  className="flex items-center gap-4 py-3 text-zinc-200 hover:text-indigo-400 hover:bg-zinc-800/50 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <span className="font-medium flex-1">{p.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-400">
                    {STAGE_LABELS[p.currentStage] || p.currentStage}
                  </span>
                  <span className="text-xs text-zinc-500">v{p.currentVersion}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
