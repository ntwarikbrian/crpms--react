import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/endpoints';
import AlertBox from '../components/AlertBox';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('❌ Username and password are required');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(formData.username, formData.password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLoginSuccess && onLoginSuccess(response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || '❌ Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -mt-48 -mr-48"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -mb-48 -ml-48"></div>

      <LoadingSpinner isLoading={loading} message="Authenticating..." />

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Icon Section */}
        <div className="text-center mb-10 animate-slideDown">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-xl border border-slate-100 mb-6 group hover:scale-110 transition-transform duration-300">
            <span className="text-4xl group-hover:rotate-12 transition-transform duration-300">🚗</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-3 text-slate-500 font-medium">
            CRPMS • <span className="text-blue-500">Fleet Management</span>
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/70 backdrop-blur-2xl py-10 px-6 sm:px-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white rounded-[32px] animate-slideUp">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <AlertBox message={error} type="error" onClose={() => setError('')} />
            )}

            <div className="space-y-4">
              <div className="input-box">
                <label htmlFor="username" className="form-label text-slate-500 mb-1 ml-1">
                  System ID / Username
                </label>
                <div className="relative group">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter username"
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="input-box">
                <label htmlFor="password" className="form-label text-slate-500 mb-1 ml-1">
                  Access Key / Password
                </label>
                <div className="relative group">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input pr-12"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.976 9.976 0 012.146-3.581m2.93-2.384A10.062 10.062 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-1.563 3.029m-5.714-2.13a3 3 0 11-4.243-4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="relative flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="sr-only peer"
                />
                <div className="w-5 h-5 bg-slate-100 border border-slate-200 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-200"></div>
                <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 left-[3px] top-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2 text-sm font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">Keep me signed in</span>
              </label>

              <button type="button" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Recover Access
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:shadow-2xl hover:shadow-slate-300 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Verifying Credentials...' : 'Sign Into Dashboard'}
            </button>
          </form>

          {/* Footer inside card */}
          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm font-medium">
              New to the system?
              <button
                onClick={() => navigate('/register')}
                className="ml-2 text-blue-600 font-bold hover:underline"
              >
                Create Administrator Account
              </button>
            </p>
          </div>
        </div>

        {/* Footer outside card */}
        <div className="mt-12 text-center text-slate-400">
          <p className="text-[10px] uppercase font-bold tracking-[0.2em]">
            Internal Use Only • Secure RSA-2048 Connection
          </p>
        </div>
      </div>
    </div>
  );
}
