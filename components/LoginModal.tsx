import { useState } from 'react';
import { cn } from '@/lib/utils';

// Assuming this utility is available from the project setup

// Demo credentials - In production, these should be validated against a secure backend API
// (e.g., via fetch to '/api/login' with hashed passwords, JWT tokens, etc.)
// Never hardcode in client-side code for real apps!
const VALID_CREDENTIALS = {
  username: 'portal', // Custom email as username
  password: 'portal', // Custom password
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback to proceed to avatar page on successful login
}

export const LoginModal = ({ isOpen, onClose, onSuccess }: LoginModalProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a delay for realism (in prod, this would be an API call)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      onSuccess(); // Proceed to avatar page
      onClose(); // Optionally close modal after success
    } else {
      setError('Invalid username or password. Please try again.');
    }

    setIsLoading(false);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay with blur effect */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
        onClick={handleOverlayClick}
      >
        {/* Glassmorphism Popup */}
        <div
          className={cn(
            'animate-in fade-in-0 zoom-in-95 relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl duration-300 dark:border-black/20 dark:bg-black/20',
            'before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-purple-500/5 before:to-violet-500/5'
          )}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 text-white/70 transition-colors duration-200 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            {/* Title */}
            <h2 className="bg-gradient-to-r from-purple-300 to-violet-300 bg-clip-text text-center text-3xl font-bold text-transparent">
              Sign In
            </h2>

            {/* Error Message */}
            {error && (
              <div className="animate-pulse rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Username/Email Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Email or Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="peer h-14 w-full rounded-2xl border border-white/20 bg-white/10 px-4 pr-4 pl-12 text-base font-medium text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:border-purple-400 focus:outline-none dark:border-black/20 dark:bg-black/10"
              />
              <svg
                className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-white/50 transition-colors peer-focus:text-purple-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="peer h-14 w-full rounded-2xl border border-white/20 bg-white/10 px-4 pr-12 pl-12 text-base font-medium text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:border-purple-400 focus:outline-none dark:border-black/20 dark:bg-black/10"
              />
              <svg
                className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-white/50 transition-colors peer-focus:text-purple-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v2m0 0v2m0-2h2m-2 0H10"
                />
              </svg>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-white/50 transition-colors duration-200 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      showPassword
                        ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878a3 3 0 004.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
                        : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    }
                  />
                </svg>
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'h-14 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/25 active:scale-100 active:shadow-purple-600/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
                isLoading && 'animate-pulse'
              )}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      {/* Global styles for consistency with welcome.tsx */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        * {
          font-family: 'Inter', sans-serif !important;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </>
  );
};
