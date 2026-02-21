import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';

const STAGE_LABELS = {
  design: 'Design',
  development: 'Development',
  testing: 'Testing',
  released: 'Released',
};

const STAGE_ORDER = ['design', 'development', 'testing', 'released'];

function getNextStage(current) {
  const i = STAGE_ORDER.indexOf(current);
  return i >= 0 && i < STAGE_ORDER.length - 1 ? STAGE_ORDER[i + 1] : null;
}

const ACTION_LABELS = {
  product_create: 'Created',
  product_update: 'Updated',
  product_stage_change: 'Status changed',
  product_version_add: 'Version added',
  product_delete: 'Deleted',
};

const ACTION_ICONS = {
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

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionError, setTransitionError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [testerComment, setTesterComment] = useState('');

  const canEdit = ['admin', 'developer'].includes(user?.role);
  const canDelete = user?.role === 'admin';
  const nextStage = product ? getNextStage(product.currentStage) : null;
  const canMoveToDevelopment = product?.currentStage === 'design' && user?.role === 'developer';
  const canMoveToTesting = product?.currentStage === 'development' && user?.role === 'tester';
  const canRelease = product?.currentStage === 'testing' && user?.role === 'admin';
  const showTransitionButton = canMoveToDevelopment || canMoveToTesting || canRelease;
  const needsCommentModal = canMoveToTesting;

  const fetchLogs = () => {
    if (!id) return;
    api.get(`/activity-logs/entity/${id}`).then((res) => setLogs(res.data.data || [])).catch(() => {});
  };

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchLogs();
  }, [id]);

  const handleDelete = () => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(true);
    api
      .delete(`/products/${id}`)
      .then(() => navigate('/products'))
      .catch(() => setDeleting(false))
      .finally(() => setDeleting(false));
  };

  const performTransition = (comment) => {
    if (!nextStage) return;
    setTransitionError('');
    setTransitioning(true);
    const body = { currentStage: nextStage, stageNotes: 'Workflow transition' };
    if (comment !== undefined && comment !== null) body.comment = comment;
    api
      .put(`/products/${id}`, body)
      .then((res) => {
        setProduct(res.data.data);
        fetchLogs();
        setModalOpen(false);
        setTesterComment('');
      })
      .catch((err) => setTransitionError(err.response?.data?.message || 'Transition failed'))
      .finally(() => setTransitioning(false));
  };

  const handleStageTransition = () => {
    if (needsCommentModal) {
      setTransitionError('');
      setModalOpen(true);
      return;
    }
    performTransition();
  };

  const handleModalSubmit = () => {
    performTransition(testerComment.trim() || undefined);
  };

  const getTransitionButtonLabel = () => {
    if (canMoveToDevelopment) return 'Move to Development';
    if (canMoveToTesting) return 'Move to Testing';
    if (canRelease) return 'Release Product';
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-4">
        <Spinner className="w-8 h-8 border-t-indigo-500" />
        <span className="text-zinc-400 text-sm">Loading…</span>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="rounded-lg bg-zinc-800/50 border border-zinc-700 text-zinc-400 px-4 py-8 text-center">
        Product not found. <Link to="/products">Back to products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <Link to="/products" className="text-sm text-indigo-400 hover:text-indigo-300 mb-2 inline-block">
            ← Products
          </Link>
          <h1 className="text-2xl font-bold text-zinc-100">{product.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-700 text-zinc-300">
              {STAGE_LABELS[product.currentStage]}
            </span>
            <span className="text-sm text-zinc-500">v{product.currentVersion}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {showTransitionButton && (
            <button
              type="button"
              onClick={handleStageTransition}
              disabled={transitioning}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {transitioning ? 'Updating…' : getTransitionButtonLabel()}
            </button>
          )}
          {canEdit && (
            <Link
              to={`/products/${id}/edit`}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              Edit
            </Link>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors disabled:opacity-60"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>
      </div>

      {transitionError && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
          {transitionError}
        </div>
      )}

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">Lifecycle status</h2>
        <div className="flex flex-wrap items-center gap-2">
          {STAGE_ORDER.map((stage, i) => (
            <span key={stage} className="flex items-center gap-2">
              <span
                className={
                  product.currentStage === stage
                    ? 'px-3 py-1 rounded-lg bg-indigo-500 text-white text-sm font-medium'
                    : 'px-3 py-1 rounded-lg bg-zinc-700 text-zinc-400 text-sm'
                }
              >
                {STAGE_LABELS[stage]}
              </span>
              {i < STAGE_ORDER.length - 1 && (
                <span className="text-zinc-500 text-sm">→</span>
              )}
            </span>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Design → Development (Developer) → Testing (Tester) → Released (Admin)
        </p>
      </section>

      {product.description && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-2">Description</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">{product.description}</p>
        </section>
      )}

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Version history</h2>
        <ul className="divide-y divide-zinc-800">
          {(product.versions || []).slice().reverse().map((v, i) => (
            <li key={i} className="flex flex-wrap items-center gap-3 py-3 text-sm">
              <span className="font-medium text-zinc-200">v{v.version}</span>
              <span className="px-2 py-0.5 rounded bg-zinc-700 text-zinc-400 text-xs">
                {STAGE_LABELS[v.stage]}
              </span>
              {v.notes && <span className="text-zinc-500">{v.notes}</span>}
              {v.changedBy?.name && (
                <span className="text-zinc-500">{v.changedBy.name}</span>
              )}
              <span className="text-zinc-600 text-xs ml-auto">
                {v.createdAt ? new Date(v.createdAt).toLocaleString() : ''}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Activity timeline</h2>
        {logs.length === 0 ? (
          <p className="text-zinc-500 text-sm py-4">No activity yet.</p>
        ) : (
          <div className="relative pl-6 border-l border-zinc-700 space-y-0">
            {logs.map((log, idx) => (
              <div key={log._id} className="relative pb-6 last:pb-0">
                <span className="absolute left-0 -translate-x-[29px] w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-400 font-medium">
                  {ACTION_ICONS[log.action] || '•'}
                </span>
                <div className="flex flex-col gap-1">
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
                    <span className="text-zinc-500">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  {log.comment && (
                    <p className="text-sm text-zinc-400 mt-1 pl-3 border-l-2 border-emerald-500/40 italic">
                      {log.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={modalOpen}
        onClose={() => !transitioning && (setModalOpen(false), setTesterComment(''), setTransitionError(''))}
        title="Move to Testing"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Add an optional comment for the team (e.g. test notes, approval notes). Admin will see this before releasing.
          </p>
          <textarea
            value={testerComment}
            onChange={(e) => setTesterComment(e.target.value)}
            placeholder="Comment (optional)"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 px-3 py-2 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => !transitioning && (setModalOpen(false), setTesterComment(''))}
              className="px-3 py-1.5 rounded-lg border border-zinc-600 text-zinc-400 hover:bg-zinc-800 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleModalSubmit}
              disabled={transitioning}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium disabled:opacity-60"
            >
              {transitioning ? 'Updating…' : 'Move to Testing'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
