import { User } from '../api/client';

const styles: Record<User['role'], string> = {
  admin: 'bg-red-100 text-red-800',
  owner: 'bg-blue-100 text-blue-800',
  user:  'bg-green-100 text-green-800',
};

export function RoleBadge({ role }: { role: User['role'] }) {
  const cls = styles[role] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${cls}`}>
      {role}
    </span>
  );
}
