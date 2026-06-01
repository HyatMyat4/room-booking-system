import { useState, useEffect, useCallback } from 'react';
import { api, Booking, User, Room } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ErrorAlert, SuccessAlert } from '../components/Alert';
import { ConfirmModal } from '../components/ConfirmModal';

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function BookingsPage() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, User>>({});
  const [roomsList, setRoomsList] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roomId, setRoomId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [bks, users, rooms] = await Promise.all([
        api.getBookings(),
        api.getUsers(),
        api.getRooms(),
      ]);
      setBookings(bks);
      const map: Record<number, User> = {};
      users.forEach((u) => { map[u.id] = u; });
      setUsersMap(map);
      setRoomsList(rooms);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!currentUser) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await api.createBooking({ roomId: Number(roomId), startTime, endTime });
      setSuccess('Booking created successfully.');
      setRoomId('');
      setStartTime('');
      setEndTime('');
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
    setError('');
    setSuccess('');
    try {
      await api.deleteBooking(deleteTarget);
      setSuccess('Booking deleted.');
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setDeleteTarget(null);
    }
  };

  const canDelete = (booking: Booking) =>
    currentUser.role === 'admin' ||
    currentUser.role === 'owner' ||
    booking.userId === currentUser.id;

  const roomMap: Record<number, Room> = {};
  roomsList.forEach((r) => { roomMap[r.id] = r; });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Bookings</h2>

      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onClose={() => setSuccess('')} />

      {/* Create booking */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
          Create New Booking
        </h3>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Room</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
              className="border border-slate-300 rounded-md px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a room --</option>
              {roomsList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (Floor {r.floor} &middot; Cap. {r.capacity})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-md transition-colors"
          >
            {submitting ? 'Booking…' : 'Book Room'}
          </button>
        </form>
      </div>

      {/* Bookings table */}
      {loading ? (
        <p className="text-slate-500 text-sm">Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <p className="text-slate-500 text-sm">No bookings yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['#', 'Room', 'Booked By', 'Start Time', 'End Time', 'Created At', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b, i) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {roomMap[b.roomId]?.name ?? `Room #${b.roomId}`}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {usersMap[b.userId]?.name ?? b.userId}
                    {b.userId === currentUser.id && (
                      <span className="ml-1 text-xs text-slate-400">(you)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{fmt(b.startTime)}</td>
                  <td className="px-4 py-3 text-slate-700">{fmt(b.endTime)}</td>
                  <td className="px-4 py-3 text-slate-500">{fmt(b.createdAt)}</td>
                  <td className="px-4 py-3">
                    {canDelete(b) ? (
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1 rounded transition-colors"
                      >
                        Delete
                      </button>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete Booking"
        message="Are you sure you want to delete this booking?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
