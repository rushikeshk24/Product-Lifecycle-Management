import { useState, useEffect } from 'react';
import api from '../services/api';
import Spinner from '../components/ui/Spinner';

const ACTION_LABELS = {
  user_login: 'User login',
  user_register: 'User register',
  product_create: 'Created',
  product_update: 'Updated',
  product_stage_change: 'Status changed',
  product_version_add: 'Version added',
  product_delete: 'Deleted',
};

const ACTION_ICONS = {
  user_login: '🔐',
  user_register: '👤',
  product_create: '✦',
  product_update: '✎',
  product_stage_change: '→',
  product_version_add: 'v',
  product_delete: '✕',
};

const roleBadgeClass = {
  admin: 'bg-violet-500/20 text-violet-400',
  developer: 'bg-blue-500/20 text-blue-400',
  tester: 'bg-emerald-500/20 text-emerald-400',
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get('/activity-logs', { params: { page: pagination.page, limit: pagination.limit } })
      .then((res) => {
        setLogs(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, limit: 20, total: 0 });
      })
      .catch((err) => {
        setLogs([]);
        setError(err.response?.data?.message || 'Failed to load activity logs');
      })
      .finally(() => setLoading(false));
  }, [pagination.page]);

  if (loading && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner className="w-8 h-8 border-t-indigo-500" />
        <span className="text-zinc-400 text-sm">Loading activity logs…</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-zinc-100 mb-1">Activity logs</h1>
      <p className="text-zinc-400 text-sm mb-8">Recent actions across the system</p>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {logs.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <p className="text-zinc-500 text-sm">No activity yet.</p>
          <p className="text-zinc-600 text-xs mt-1">Actions will appear here as users work with products.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="relative pl-6 border-l border-zinc-700 space-y-0">
              {logs.map((log) => (
                <div key={log._id} className="relative pb-6 last:pb-0">
                  <span className="absolute left-0 -translate-x-[29px] w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm shrink-0">
                    {ACTION_ICONS[log.action] || '•'}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <span className="font-medium text-zinc-200 text-sm">
                      {ACTION_LABELS[log.action] || log.action?.replace(/_/g, ' ')}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {log.userId?.name && (
                        <span className="text-zinc-400">{log.userId.name}</span>
                      )}
                      {log.userId?.role && (
                        <span
                          className={`px-1.5 py-0.5 rounded ${roleBadgeClass[log.userId.role] || 'bg-zinc-600 text-zinc-400'}`}
                        >
                          {log.userId.role}
                        </span>
                      )}
                      {(log.details?.name || log.details?.stage || log.details?.version) && (
                        <span className="text-zinc-500">
                          {log.details?.name && `Product: ${log.details.name}`}
                          {log.details?.stage && ` → ${log.details.stage}`}
                          {log.details?.version && ` v${log.details.version}`}
                        </span>
                      )}
                      <span className="text-zinc-600 ml-auto">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                      </span>
                    </div>
                    {log.comment && (
                      <p className="text-sm text-zinc-400 mt-2 pl-3 border-l-2 border-emerald-500/40 italic">
                        {log.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {pagination.total > pagination.limit && (
            <div className="flex items-center gap-4 mt-6">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="px-3 py-1.5 rounded-lg border border-zinc-600 text-zinc-400 hover:bg-zinc-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-500">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <button
                type="button"
                disabled={pagination.page * pagination.limit >= pagination.total}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="px-3 py-1.5 rounded-lg border border-zinc-600 text-zinc-400 hover:bg-zinc-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
