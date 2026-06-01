import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './RoleBadge';

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-6">
        <span className="font-bold text-base text-white">Meeting Room Booking</span>
        <NavLink to="/bookings" className={linkClass}>Bookings</NavLink>
        <NavLink to="/rooms" className={linkClass}>Rooms</NavLink>
        {(currentUser.role === 'owner' || currentUser.role === 'admin') && (
          <NavLink to="/summary" className={linkClass}>Summary</NavLink>
        )}
        {currentUser.role === 'admin' && (
          <NavLink to="/users" className={linkClass}>Users</NavLink>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-300">{currentUser.name}</span>
        <RoleBadge role={currentUser.role} />
        <button
          onClick={handleLogout}
          className="ml-2 text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
