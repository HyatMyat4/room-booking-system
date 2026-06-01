import { useState, useEffect, useCallback } from 'react';
import { api, User } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/RoleBadge';
import { ErrorAlert, SuccessAlert } from '../components/Alert';
import { ConfirmModal } from '../components/ConfirmModal';

const ROLES = ['admin', 'owner', 'user'];

export function UsersPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setUsers(await api.getUsers());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!currentUser) return null;

  if (currentUser.role !== 'admin') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          Access denied — Admin only.
        </div>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSubmitting(true);
    try {
      await api.createUser({ name: newName, password: newPassword, role: newRole });
      setSuccess('User created.');
      setNewName('');
      setNewPassword('');
      setNewRole('user');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError(''); setSuccess('');
    try {
      await api.deleteUser(deleteTarget);
      setSuccess('User deleted.');
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setDeleteTarget(null);
    }
  };

  const handleRoleChange = async (id: number, role: string) => {
    setError(''); setSuccess('');
    try {
      await api.updateUserRole(id, role);
      setSuccess('Role updated.');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">User Management</h2>

      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onClose={() => setSuccess('')} />

      {/* Create user form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
          Create New User
        </h3>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              placeholder="Full name"
              className="border border-slate-300 rounded-md px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Min 6 characters"
              className="border border-slate-300 rounded-md px-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-md transition-colors"
          >
            {submitting ? 'Creating…' : 'Create User'}
          </button>
        </form>
      </div>

      {/* Users table */}
      {loading ? (
        <p className="text-slate-500 text-sm">Loading users…</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['#', 'Name', 'Current Role', 'Change Role', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u, i) => {
                const isMe = u.id === currentUser.id;
                return (
                  <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${isMe ? 'bg-amber-50' : ''}`}>
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {u.name}
                      {isMe && <span className="ml-1 text-xs text-slate-400">(you)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={isMe}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="border border-slate-300 rounded px-2 py-1 text-xs disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={isMe}
                        className="text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete User"
        message="Delete this user? Their bookings will also be removed."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
