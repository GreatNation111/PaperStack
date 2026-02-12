import { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface SignUpProps {
  onBack: () => void;
  onSignIn: () => void;
  onComplete: (name: string) => void;
}

export function SignUp({ onBack, onSignIn, onComplete }: SignUpProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: fullName });
      await setDoc(doc(db, 'users', user.uid), {
        name: fullName,
        email: email,
        departmentId: 'General',
        level: '100L',
        role: 'student',
        bookmarks: [],
        readNotifications: [],
        recentCourses: [],
        createdAt: serverTimestamp(),
      });
      onComplete(fullName);
    } catch (err: any) {
      console.error(err);
      setError('Registration failed. Email might be in use.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Set persistence first
      await setPersistence(auth, browserLocalPersistence);
      // Then open popup immediately
      const result = await signInWithPopup(auth, provider);

      const user = result.user;
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || 'Student',
        email: user.email,
        departmentId: 'General',
        level: '100L',
        role: 'student',
        bookmarks: [],
        readNotifications: [],
        recentCourses: [],
        createdAt: serverTimestamp(),
      }, { merge: true });
      onComplete(user.displayName || 'Student');
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in cancelled.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup blocked. Please allow popups for this site.');
      } else {
        setError('Google sign-in failed.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A2540]/[0.97] flex flex-col overflow-hidden">
      {/* Header Bar - Compacted */}
      {/* Header Bar - Neutral space */}
      <div className="bg-[#0A2540]/[0.97] px-6 pt-6 pb-6 flex flex-col shrink-0">
        <div className="flex justify-between items-start">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-white/70 text-sm">Join PaperStack today.</p>
      </div>

      {/* Form Container - Neutral */}
      <div className="flex-1 bg-white rounded-t-[32px] overflow-hidden flex flex-col px-6 pt-6 pb-4">
        <form onSubmit={handleSignUp} className="space-y-3 flex-1 flex flex-col">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" strokeWidth={1.5} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full h-12 pl-10 pr-4 bg-card border border-border rounded-xl text-foreground placeholder:text-secondary outline-none focus:border-primary transition-all text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" strokeWidth={1.5} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu.ng"
                className="w-full h-12 pl-10 pr-4 bg-card border border-border rounded-xl text-foreground placeholder:text-secondary outline-none focus:border-primary transition-all text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" strokeWidth={1.5} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pl-10 pr-12 bg-card border border-border rounded-xl text-foreground placeholder:text-secondary outline-none focus:border-primary transition-all text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <Eye className="w-4 h-4" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all mt-2 flex items-center justify-center text-sm"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>

          <div className="relative my-4 shrink-0">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-background px-2 text-secondary">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-[52px] bg-card border border-border text-foreground rounded-xl font-semibold hover:bg-accent/5 transition-all flex items-center justify-center gap-3 text-sm shrink-0"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>

          <div className="mt-auto flex justify-center gap-1 text-sm pt-2">
            <span className="text-secondary">Already have an account?</span>
            <button onClick={onSignIn} className="text-primary font-semibold hover:underline">
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
