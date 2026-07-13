import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { ChevronDown, Home, BookOpen, DollarSign, User, Menu, X, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { isAuthenticatedAtom, userAtom } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const user = useAtomValue(userAtom);
  const { logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const testOptions = [
    { name: 'Listening Tests', path: '/listening', icon: '👂' },
    { name: 'Reading Tests', path: '/reading', icon: '📖' },
    { name: 'Writing Tests', path: '/writing', icon: '✍️' },
    { name: 'Speaking Tests', path: '/speaking', icon: '🗣️' },
  ];

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              IELTS<span className="text-orange-500">Practice</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Home */}
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/')
                  ? 'text-orange-500 bg-orange-50'
                  : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </Link>

            {/* IELTS Online Test Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:text-orange-500 hover:bg-orange-50 transition-colors outline-none font-medium">
                <BookOpen className="w-4 h-4" />
                <span>IELTS Online Test</span>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <div className="px-2 py-1.5 text-sm font-semibold text-gray-900">
                  Practice by Skill
                </div>
                <DropdownMenuSeparator />
                {testOptions.map((option) => (
                  <DropdownMenuItem key={option.path} asChild>
                    <Link
                      to={option.path}
                      className={`flex items-center gap-3 cursor-pointer ${
                        isActive(option.path) ? 'bg-orange-50 text-orange-500' : ''
                      }`}
                    >
                      <span className="text-lg">{option.icon}</span>
                      <span>{option.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Pricing */}
            <Link
              to="/pricing"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/pricing')
                  ? 'text-orange-500 bg-orange-50'
                  : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">Pricing</span>
            </Link>

            {/* Auth Section */}
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar className="w-9 h-9 cursor-pointer border-2 border-transparent hover:border-orange-500 transition-colors">
                  {isAuthenticated && user ? (
                    <>
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} />
                      ) : null}
                      <AvatarFallback className="bg-orange-500 text-white text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback className="bg-gray-200 text-gray-500">
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/profile">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/progress">My Progress</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/login" className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        <span>Login</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/register" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Sign Up</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <div className="px-4 py-4 space-y-3">
              {/* Home */}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/')
                    ? 'text-orange-500 bg-orange-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>

              {/* Test Options */}
              <div className="space-y-2">
                <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  IELTS Online Test
                </div>
                {testOptions.map((option) => (
                  <Link
                    key={option.path}
                    to={option.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(option.path)
                        ? 'text-orange-500 bg-orange-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span>{option.name}</span>
                  </Link>
                ))}
              </div>

              {/* Pricing */}
              <Link
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/pricing')
                    ? 'text-orange-500 bg-orange-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Pricing</span>
              </Link>

              {/* Auth Section */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2">
                      <Avatar className="w-10 h-10">
                        {user.avatar ? <AvatarImage src={user.avatar} /> : null}
                        <AvatarFallback className="bg-orange-500 text-white text-sm font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      My Profile
                    </Link>
                    <Link to="/progress" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      My Progress
                    </Link>
                    <button className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Login</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span>Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
