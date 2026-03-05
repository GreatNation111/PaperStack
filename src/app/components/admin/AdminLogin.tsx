import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Eye, EyeOff, Layers } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/app/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AdminLoginProps {
  onComplete: () => void;
}

export function AdminLogin({ onComplete }: AdminLoginProps) {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already admin
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // Sign in with email and password
      await signInWithEmailAndPassword(auth, email, password);

      // AuthContext will check if user is admin automatically
      // If they are, the RequireAdmin guard will let them through

      onComplete();
    } catch (err: any) {
      console.error('Admin login error:', err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/user-not-found') {
        setError('Admin account not found.');
      } else {
        setError('Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4F46E5]/10 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-[#4F46E5]" strokeWidth={1.5} />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Layers className="w-5 h-5 text-[#E5E5E5]" strokeWidth={1.5} />
            <h1 className="text-2xl font-semibold text-[#E5E5E5]">PaperStack Admin</h1>
          </div>
          <p className="text-sm text-[#AAA]">Secure access to content moderation</p>
        </div>

        {/* Form */}
        <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-2xl p-8 shadow-2xl">
          <div className="space-y-5">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#EF4444]/10 border border-[#EF4444]/50 rounded-lg p-3"
              >
                <p className="text-sm text-[#EF4444]">{error}</p>
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#DDD] mb-2">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="admin@paperstack.edu.ng"
                className="w-full h-12 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#DDD] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AAA] hover:text-[#DDD] transition-colors disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-5 h-5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            {/* 2FA Toggle - Hidden for MVP */}
            {/* <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#AAA]">Two-factor authentication</span>
              <button
                type="button"
                onClick={() => setUse2FA(!use2FA)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  use2FA ? 'bg-[#4F46E5]' : 'bg-[#333]'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    use2FA ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div> */}

            {/* 2FA Code - Hidden for MVP */}
            {/* {use2FA && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium text-[#DDD] mb-2">
                  Authentication Code
                </label>
                <input
                  type="text"
                  value={code2FA}
                  onChange={(e) => setCode2FA(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full h-12 px-4 bg-[#0F1115] border border-[#333] rounded-xl text-[#E5E5E5] placeholder:text-[#666] focus:outline-none focus:border-[#4F46E5] transition-colors text-center tracking-widest text-xl"
                />
              </motion.div>
            )} */}

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full h-12 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In to Admin Panel'}
            </button>

            {/* Help Text */}
            <p className="text-xs text-center text-[#666] mt-4">
              Authorized personnel only. All access is logged and monitored.
            </p>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="mt-6 text-center text-xs text-[#666]">
          <button
            type="button"
            onClick={async () => {
              if (!email) {
                setError('Please enter your admin email above first.');
                return;
              }
              try {
                const { sendPasswordResetEmail } = await import('firebase/auth');
                await sendPasswordResetEmail(auth, email);
                setError('');
                alert('Password reset link sent to your email! (Check spam folder if not seen)');
              } catch (err: any) {
                console.error(err);
                if (err.code === 'auth/user-not-found') setError('No admin account found with this email.');
                else setError('Failed to send reset email. Please try again.');
              }
            }}
            className="text-[#4F46E5] hover:underline transition-colors"
          >
            Forgot password? Click here to reset it.
          </button>
        </div>
      </motion.div>
    </div>
  );
}
