import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://mytradingjournal-api.vercel.app/api';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const validateForm = () => {
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-indigo-200">
      <div className="p-8 rounded-2xl w-full max-w-md flex flex-col gap-6 bg-gradient-to-r from-blue-500 to-indigo-900 bg-clip-text">
        <h1 className="text-3xl mb-4 font-medium text-left text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 select-none">
          Continue Your Trading Journey
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            className="p-3 rounded-lg border-2 border-indigo-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            name="username"
            placeholder="Enter your Username"
            value={formData.username}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
          <div className="relative">
            <input
              className="p-3 rounded-lg border-2 border-indigo-300 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full pr-10"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          {error && (
            <div
              className="text-red-500 text-sm text-left pl-2 mt-1 animate-fade-in border-l-4 border-red-400 bg-red-50/80 rounded"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold py-3 rounded-lg shadow hover:scale-105 transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="text-center text-sm mt-4">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">Register</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;