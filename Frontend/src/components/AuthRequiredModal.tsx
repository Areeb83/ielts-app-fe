import { LogIn, UserPlus, X } from 'lucide-react';

interface AuthRequiredModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export function AuthRequiredModal({ open, onClose, onLogin, onRegister }: AuthRequiredModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-7 h-7 text-orange-500" />
        </div>

        {/* Text */}
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
          Sign in required
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          You need to sign in to take a test. Your scores will be saved and you can track your progress.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            onClick={onRegister}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
