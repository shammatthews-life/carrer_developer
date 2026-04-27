import React, { useState, useEffect } from 'react';
import { User as UserIcon, LogOut, RefreshCcw } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AuthProps {
  onUserChange?: (user: FirebaseUser | null) => void;
  className?: string;
}

const Auth: React.FC<AuthProps> = ({ onUserChange, className = '' }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      onUserChange?.(firebaseUser);
    });
    return () => unsubscribe();
  }, [onUserChange]);

  const handleLogin = async () => {
    setIsAuthLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        // Ignore
      } else {
        alert(`Login failed: ${error.message}`);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {user ? (
        <div className="flex items-center gap-4 pl-4 border-l border-white/10 min-w-0">
          <div className="text-right hidden sm:block min-w-[100px]">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">Welcome back</p>
            <p className="text-xs font-black truncate">{user.displayName}</p>
          </div>
          <img 
            src={user.photoURL || ''} 
            alt="" 
            className="w-10 h-10 rounded-full border-2 border-blue-500/20 shadow-lg shadow-blue-500/10" 
          />
          <button 
            onClick={handleLogout}
            className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      ) : (
        <button 
          onClick={handleLogin}
          disabled={isAuthLoading}
          className="px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-black/10 flex items-center gap-2 disabled:opacity-50 bg-white text-black hover:bg-gray-200"
        >
          {isAuthLoading ? (
            <RefreshCcw size={14} className="animate-spin" />
          ) : (
            <UserIcon size={14} />
          )}
          {isAuthLoading ? 'Connecting...' : 'Sign In'}
        </button>
      )}
    </div>
  );
};

export default Auth;

