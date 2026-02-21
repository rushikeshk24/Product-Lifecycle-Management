import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'developer', label: 'Developer' },
  { value: 'tester', label: 'Tester' },
  { value: 'admin', label: 'Admin' },
];

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('developer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
        <h1 className="text-xl font-bold text-zinc-100">Create account</h1>
        <p className="text-zinc-500 text-sm mt-1 mb-6">Product Lifecycle Management</p>
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-zinc-400">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 px-3 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            autoComplete="name"
          />
          <label className="block text-sm font-medium text-zinc-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 px-3 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            autoComplete="email"
          />
          <label className="block text-sm font-medium text-zinc-400">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 px-3 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            minLength={6}
            autoComplete="new-password"
          />
          <label className="block text-sm font-medium text-zinc-400">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
