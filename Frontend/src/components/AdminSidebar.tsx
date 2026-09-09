import { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { Users, PenLine, Bug, LayoutDashboard, LogOut } from 'lucide-react';
import { userAtom } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Writing Submissions', path: '/admin/submissions', icon: PenLine },
  { label: 'Bugs Reported', path: '/admin/reports', icon: Bug },
];

export function AdminSidebar() {
  const { pathname } = useLocation();
  const user = useAtomValue(userAtom);
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = () => { if (menuTimeout.current) clearTimeout(menuTimeout.current); setMenuOpen(true); };
  const closeMenu = () => { menuTimeout.current = setTimeout(() => setMenuOpen(false), 150); };

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-200">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Avatar + Menu */}
      {user && (
        <div className="relative px-3 py-4 border-t border-gray-200" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <Avatar className="w-8 h-8">
              {user.avatar ? <AvatarImage src={user.avatar} /> : null}
              <AvatarFallback className="bg-orange-500 text-white text-xs font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>

          {menuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-1 bg-white rounded-md border shadow-md p-1 z-50">
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-gray-700 rounded-sm hover:bg-gray-100 transition-colors"
              >
                My Profile
              </Link>
              <div className="h-px bg-gray-200 my-1" />
              <button
                onClick={() => { setMenuOpen(false); logout(); }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 rounded-sm hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
