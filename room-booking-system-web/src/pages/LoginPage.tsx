import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, User } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/RoleBadge';
import { ErrorAlert } from '../components/Alert';

export function LoginPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const { setAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/bookings', { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    api.getUsers()
      .then((data) => setUsers(data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (user: User) => {
    setError('');
    setPassword('');
    setSelectedUser(user);
  };

  const handleCancelPassword = () => {
    setSelectedUser(null);
    setPassword('');
    setError('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required');
      return;
    }
    setVerifying(true);
    setError('');
    try {
      const { token, user } = await api.verifyPassword(selectedUser!.id, password);
      setAuthenticated(user, token);
      navigate('/bookings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setVerifying(false);
    }
  };

  const currentYear = new Date().getFullYear();

  /* ---------- User list view ---------- */
  if (!selectedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Meeting Room Booking</h1>
            <p className="text-slate-500 text-sm mb-6">Select your account to continue</p>

            <ErrorAlert message={error} onClose={() => setError('')} />

            {loading ? (
              <p className="text-slate-500 text-sm">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-slate-500 text-sm">
                No users found. Make sure the backend is running with seed data.
              </p>
            ) : (
              <ul className="space-y-2">
                {users.map((user) => (
                  <li key={user.id}>
                    <button
                      onClick={() => handleSelect(user)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition text-left"
                    >
                      <span className="font-medium text-slate-800">{user.name}</span>
                      <RoleBadge role={user.role} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-xs text-slate-400 text-center mt-6">
            &copy; {currentYear} Meeting Room Booking System
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Password popup ---------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Meeting Room Booking</h1>
          <p className="text-slate-500 text-sm mb-6">Enter your password to continue</p>

          <ErrorAlert message={error} onClose={() => setError('')} />

          <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-sm font-medium text-slate-800">{selectedUser.name}</p>
            <RoleBadge role={selectedUser.role} />
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelPassword}
                className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={verifying || !password}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                {verifying ? 'Verifying...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
        <p className="text-xs text-slate-400 text-center mt-6">
          &copy; {currentYear} Meeting Room Booking System
        </p>
      </div>
    </div>
  );
}
