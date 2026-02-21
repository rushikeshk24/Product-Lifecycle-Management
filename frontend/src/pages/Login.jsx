import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
        <h1 className="text-xl font-bold text-zinc-100">Sign in</h1>
        <p className="text-zinc-500 text-sm mt-1 mb-6">Product Lifecycle Management</p>
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500">
          Don't have an account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300">Register</Link>
        </p>
      </div>
    </div>
  );
}
