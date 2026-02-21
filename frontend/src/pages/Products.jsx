import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/ui/Spinner';

const STAGE_LABELS = {
  design: 'Design',
  development: 'Development',
  testing: 'Testing',
  released: 'Released',
};

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [stageFilter, setStageFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canCreate = ['admin', 'developer'].includes(user?.role);

  const fetchProducts = (page = 1) => {
    setLoading(true);
    setError('');
    const params = { page, limit: pagination.limit };
    if (stageFilter) params.stage = stageFilter;
    if (search.trim()) params.search = search.trim();
    api
      .get('/products', { params })
      .then((res) => {
        setProducts(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0 });
      })
      .catch((err) => {
        setProducts([]);
        setError(err.response?.data?.message || 'Failed to load products');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts(pagination.page);
  }, [stageFilter, pagination.page]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Products</h1>
        {canCreate && (
          <Link
            to="/products/new"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            New product
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-xs rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 px-3 py-2 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-medium transition-colors"
          >
            Search
          </button>
        </form>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All stages</option>
          {Object.entries(STAGE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <Spinner className="w-8 h-8 border-t-indigo-500" />
          <span className="text-zinc-400 text-sm">Loading products…</span>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <p className="text-zinc-500 text-sm">No products found.</p>
          {canCreate && (
            <Link
              to="/products/new"
              className="inline-block mt-3 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
            >
              Create your first product
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider py-3 px-4">
                    Name
                  </th>
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider py-3 px-4">
                    Stage
                  </th>
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider py-3 px-4">
                    Version
                  </th>
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider py-3 px-4">
                    Updated
                  </th>
                  <th className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider py-3 px-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link
                        to={`/products/${p._id}`}
                        className="font-medium text-zinc-200 hover:text-indigo-400 transition-colors"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-400">
                        {STAGE_LABELS[p.currentStage]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-400">v{p.currentVersion}</td>
                    <td className="py-3 px-4 text-sm text-zinc-500">
                      {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {canCreate && (
                        <Link
                          to={`/products/${p._id}/edit`}
                          className="text-sm text-indigo-400 hover:text-indigo-300"
                        >
                          Edit
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.total > pagination.limit && (
            <div className="flex items-center gap-4 mt-6">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchProducts(pagination.page - 1)}
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
                onClick={() => fetchProducts(pagination.page + 1)}
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
