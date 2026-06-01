import { useState, useEffect, useCallback } from 'react';
import { api, Room } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ErrorAlert, SuccessAlert } from '../components/Alert';
import { ConfirmModal } from '../components/ConfirmModal';

export function RoomsPage() {
  const { currentUser } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create form
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [floor, setFloor] = useState('');
  const [amenities, setAmenities] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [editFloor, setEditFloor] = useState('');
  const [editAmenities, setEditAmenities] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const load = useCallback(async () => {
    try {
      setRooms(await api.getRooms());
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
      await api.createRoom({ name, capacity: Number(capacity), floor: Number(floor), amenities, description });
      setSuccess(`Room "${name}" created.`);
      setName('');
      setCapacity('');
      setFloor('');
      setAmenities('');
      setDescription('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (room: Room) => {
    setEditingId(room.id);
    setEditName(room.name);
    setEditCapacity(String(room.capacity));
    setEditFloor(String(room.floor));
    setEditAmenities(room.amenities);
    setEditDescription(room.description);
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id: number) => {
    setError('');
    setSuccess('');
    try {
      await api.updateRoom(id, { name: editName, capacity: Number(editCapacity), floor: Number(editFloor), amenities: editAmenities, description: editDescription });
      setSuccess('Room updated.');
      setEditingId(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
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
      await api.deleteRoom(deleteTarget);
      setSuccess('Room deleted.');
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setDeleteTarget(null);
    }
  };

  const isAdmin = currentUser.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Rooms</h2>
        {loading ? (
          <p className="text-slate-500 text-sm">Loading rooms…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-semibold text-slate-900">{room.name}</h3>
                <div className="mt-2 text-xs text-slate-500 space-y-1">
                  <p>Floor {room.floor} &middot; Capacity: {room.capacity}</p>
                  {room.amenities && <p>Amenities: {room.amenities}</p>}
                  {room.description && <p className="text-slate-400">{room.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Room Management</h2>

      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onClose={() => setSuccess('')} />

      {/* Create room form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
          Create New Room
        </h3>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Room name"
              className="border border-slate-300 rounded-md px-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Capacity</label>
            <input
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
              placeholder="e.g. 10"
              className="border border-slate-300 rounded-md px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Floor</label>
            <input
              type="number"
              min="1"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              required
              placeholder="e.g. 1"
              className="border border-slate-300 rounded-md px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Amenities</label>
            <input
              type="text"
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              placeholder="e.g. Projector, Whiteboard"
              className="border border-slate-300 rounded-md px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details"
              className="border border-slate-300 rounded-md px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-md transition-colors"
          >
            {submitting ? 'Creating…' : 'Create Room'}
          </button>
        </form>
      </div>

      {/* Rooms table */}
      {loading ? (
        <p className="text-slate-500 text-sm">Loading rooms…</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['#', 'Name', 'Capacity', 'Floor', 'Amenities', 'Description', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map((room, i) => {
                const isEditing = editingId === room.id;
                return (
                  <tr key={room.id} className={`hover:bg-slate-50 transition-colors ${isEditing ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="border border-slate-300 rounded px-2 py-1 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="font-medium text-slate-800">{room.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          min="1"
                          value={editCapacity}
                          onChange={(e) => setEditCapacity(e.target.value)}
                          className="border border-slate-300 rounded px-2 py-1 text-sm w-16 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-slate-700">{room.capacity}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          min="1"
                          value={editFloor}
                          onChange={(e) => setEditFloor(e.target.value)}
                          className="border border-slate-300 rounded px-2 py-1 text-sm w-16 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-slate-700">{room.floor}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editAmenities}
                          onChange={(e) => setEditAmenities(e.target.value)}
                          className="border border-slate-300 rounded px-2 py-1 text-sm w-36 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-slate-600 text-xs">{room.amenities}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="border border-slate-300 rounded px-2 py-1 text-sm w-36 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-slate-500 text-xs">{room.description}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUpdate(room.id)}
                            className="text-xs text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2 py-1 rounded transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(room)}
                            className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(room.id)}
                            className="text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
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
        title="Delete Room"
        message="Delete this room? All associated bookings will also be removed."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
