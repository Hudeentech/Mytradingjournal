import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://mytradingjournal-api.vercel.app/api';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const validateForm = () => {
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsRegistering(true);

    if (!validateForm()) {
      setIsRegistering(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full min-h-screen flex flex-col md:flex-row">
        {/* Left Side - Image/Branding (Desktop Only) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">MyTradingJournal</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Start Your Journey.<br />Track Every Trade.
            </h1>
            <p className="text-gray-200 text-lg max-w-sm">
              Create an account today and join thousands of traders optimizing their performance.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-300 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt={`User ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-gray-200">Join 10k+ active traders</p>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="md:hidden flex items-center gap-3 mb-8 justify-center">
              <div className="w-10 h-10 bg-black rounded-xl shadow-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">MyTradingJournal</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
              Create an account
            </h2>
            <p className="text-gray-500 mb-8">
              Sign up to start tracking your trading success story.
            </p>

            <form className="flex flex-col gap-5" onSubmit={handleRegister}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="username">Username</label>
                <input
                  id="username"
                  className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/50 focus:border-gray-900 focus:bg-white transition-all text-gray-900"
                  type="text"
                  placeholder="Create your Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  disabled={isRegistering}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/50 focus:border-gray-900 focus:bg-white transition-all text-gray-900 pr-10"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create your Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={isRegistering}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {error && <div className="text-red-600 text-sm text-left p-3 mt-1 animate-fade-in border-l-4 border-red-500 bg-red-50 rounded-r-lg font-medium">{error}</div>}
              {success && <div className="text-green-700 text-sm text-center p-3 mt-1 bg-green-50 rounded-lg border border-green-200 font-medium">{success}</div>}

              <button
                type="submit"
                className="w-full bg-black text-white font-semibold flex justify-center items-center py-3.5 rounded-xl shadow-sm hover:shadow-gray-200/50 hover:bg-gray-800 hover:-translate-y-0.5 focus:scale-[0.98] transition-all disabled:opacity-70 mt-2"
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isRegistering ? 'Registering ...' : 'Register Account'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-sm font-medium text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-black hover:text-gray-800 hover:underline transition-colors font-semibold">Sign in here</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
