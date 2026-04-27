import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  RefreshCcw, 
  Sparkles,
  User as UserIcon
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../firebase';

interface SignInProps {
  theme: 'light' | 'dark';
}

export default function SignIn({ theme }: SignInProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google login failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md p-10 rounded-[3rem] border ${
          theme === 'dark' 
            ? 'bg-[#11141a] border-white/5 shadow-2xl' 
            : 'bg-white border-black/5 shadow-xl'
        } space-y-8`}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/20">
              <Sparkles size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-black tracking-tight">
            {isLogin ? 'Welcome Back' : 'Join CareerTrainer'}
          </h2>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
            {isLogin 
              ? 'Enter your details to continue your journey.' 
              : 'Create an account to start your personalized career path.'}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Email Address</p>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" size={18} />
              <input 
                type="email"
                required
                placeholder="you@example.com"
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Password</p>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" size={18} />
              <input 
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? <RefreshCcw className="animate-spin" size={20} /> : <ArrowRight size={20} />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="relative flex items-center gap-4 py-2">
          <div className="flex-grow h-[1px] bg-white/5" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-20">or continue with</p>
          <div className="flex-grow h-[1px] bg-white/5" />
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all border ${
            theme === 'dark' 
              ? 'bg-white/5 border-white/10 hover:bg-white/10' 
              : 'bg-black/5 border-black/10 hover:bg-black/10'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
          </svg>
          Google
        </button>

        <p className="text-center text-xs font-bold">
          <span className="opacity-40">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>
          {' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:underline"
          >
            {isLogin ? 'Create one now' : 'Sign in instead'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
