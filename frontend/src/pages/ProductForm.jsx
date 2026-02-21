import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/ui/Spinner';

const STAGE_LABELS = {
  design: 'Design',
  development: 'Development',
  testing: 'Testing',
  released: 'Released',
};

const STAGES = [
  { value: 'design', label: 'Design' },
  { value: 'development', label: 'Development' },
  { value: 'testing', label: 'Testing' },
  { value: 'released', label: 'Released' },
];

const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);
  if (isEdit && user?.role === 'tester') {
    return <Navigate to={`/products/${id}`} replace />;
  }
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currentStage, setCurrentStage] = useState('design');
  const [currentVersion, setCurrentVersion] = useState('0.0.0');
  const [versionNotes, setVersionNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/products/${id}`)
      .then((res) => {
        const p = res.data.data;
        setName(p.name);
        setDescription(p.description || '');
        setCurrentStage(p.currentStage || 'design');
        setCurrentVersion(p.currentVersion || '0.0.0');
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setFetchLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!SEMVER_REGEX.test(currentVersion)) {
      setError('Version must be semver (e.g. 1.0.0)');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, {
          name,
          description,
          currentVersion,
          versionNotes: versionNotes || undefined,
        });
        navigate(`/products/${id}`);
      } else {
        const { data } = await api.post('/products', {
          name,
          description,
          currentStage,
          currentVersion,
        });
        navigate(`/products/${data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner className="w-8 h-8 border-t-indigo-500" />
        <span className="text-zinc-400 text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <Link
        to={isEdit ? `/products/${id}` : '/products'}
        className="text-sm text-indigo-400 hover:text-indigo-300 mb-4 inline-block"
      >
        ← {isEdit ? 'Product' : 'Products'}
      </Link>
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">
        {isEdit ? 'Edit product' : 'New product'}
      </h1>
      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 px-3 py-2 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            placeholder="Product name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 px-3 py-2 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
            rows={4}
            placeholder="Brief description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Current stage</label>
          {isEdit ? (
            <div className="space-y-1">
              <span className="inline-block px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm">
                {STAGE_LABELS[currentStage]}
              </span>
              <p className="text-xs text-zinc-500">
                Stage changes use the workflow buttons on the product detail page.
              </p>
            </div>
          ) : (
            <select
              value={currentStage}
              onChange={(e) => setCurrentStage(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Version (semver e.g. 1.0.0) *</label>
          <input
            type="text"
            value={currentVersion}
            onChange={(e) => setCurrentVersion(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 px-3 py-2 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            placeholder="0.0.0"
          />
        </div>
        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Version notes (optional)</label>
            <input
              type="text"
              value={versionNotes}
              onChange={(e) => setVersionNotes(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 px-3 py-2 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="What changed in this version"
            />
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
          </button>
          <Link
            to={isEdit ? `/products/${id}` : '/products'}
            className="px-4 py-2 rounded-lg border border-zinc-600 text-zinc-400 hover:bg-zinc-800 text-sm transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
