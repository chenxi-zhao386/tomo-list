import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { useStore } from '../store';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export function Auth() {
  const { user, setAccessToken } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setAccessToken(null);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-xs text-indigo-100 hidden sm:block">
          {user.email}
        </div>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="p-1.5 bg-indigo-500 hover:bg-indigo-400 rounded-md transition-colors text-white"
          title="Sign Out"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <button
        onClick={handleLogin}
        disabled={loading}
        className="flex items-center space-x-2 px-3 py-1.5 bg-white text-indigo-600 font-medium text-sm rounded-md shadow-sm hover:bg-indigo-50 transition-colors"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
        <span>Sign In</span>
      </button>
      {error && <div className="absolute top-16 right-4 bg-red-100 text-red-600 text-xs p-2 rounded shadow-md z-50">{error}</div>}
    </div>
  );
}
