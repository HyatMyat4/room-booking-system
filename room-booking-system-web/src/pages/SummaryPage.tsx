import { useState, useEffect } from 'react';
import { api, Summary } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ErrorAlert } from '../components/Alert';

function fmt(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function SummaryPage() {
  const { currentUser } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role !== 'admin' && currentUser.role !== 'owner') {
      setError('Access denied — Owner or Admin only.');
      setLoading(false);
      return;
    }
    api.getSummary()
      .then((data) => setSummary(data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <div className="px-4 py-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Usage Summary</h2>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {summary && (
        <div className="space-y-10">
          {/* Bookings per user */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
              Bookings per User
            </h3>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto max-w-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Bookings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.stats?.map((s) => (
                    <tr key={s.userId} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{s.userName}</td>
                      <td className="px-4 py-3 text-slate-700">{s.totalBookings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bookings per room */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
              Bookings per Room
            </h3>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto max-w-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Room</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Bookings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.roomStats?.map((s) => (
                    <tr key={s.roomId} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{s.roomName}</td>
                      <td className="px-4 py-3 text-slate-700">{s.totalBookings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grouped by user */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
              Bookings Grouped by User
            </h3>
            <div className="space-y-4">
              {summary.grouped?.map((group) => (
                <div key={group.userId} className="bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{group.userName}</span>
                    <span className="text-xs text-slate-400">
                      {group.bookings.length} booking{group.bookings.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {group.bookings.length === 0 ? (
                    <p className="px-5 py-3 text-slate-400 text-sm">No bookings.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          {['Room', 'Start Time', 'End Time', 'Created At'].map((h) => (
                            <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {group.bookings.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 text-slate-700">{b.roomName}</td>
                            <td className="px-4 py-2.5 text-slate-700">{fmt(b.startTime)}</td>
                            <td className="px-4 py-2.5 text-slate-700">{fmt(b.endTime)}</td>
                            <td className="px-4 py-2.5 text-slate-500">{fmt(b.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
