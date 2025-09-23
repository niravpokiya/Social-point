import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/axiosInstance';

const Login = () => {
  const { currentTheme } = useTheme();
  const [form, setForm] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleLogin = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // added payload instead of form.
      const payload = {
        emailOrPhone: form.emailOrPhone,  // or form.email
        password: form.password
      };

      const { data } = await api.post('/api/auth/login', payload);
      if (data?.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/home";
      } else {
        setError("Login failed");
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setError("Invalid email/phone or password");
      } else if (error.response?.status === 400) {
        setError("Please check your credentials");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div 
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.secondary} 100%)`
            }}
          >
            SP
          </div>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: currentTheme.colors.text }}
          >
            Welcome Back
          </h1>
          <p 
            className="text-sm"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            Sign in to your Social-Point account
          </p>
        </div>

        {/* Login Form */}
        <div 
          className="rounded-2xl shadow-2xl p-8"
          style={{ backgroundColor: currentTheme.colors.surface }}
        >
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div 
                className="p-4 rounded-lg border-l-4"
                style={{ 
                  backgroundColor: `${currentTheme.colors.error}20`,
                  borderColor: currentTheme.colors.error,
                  color: currentTheme.colors.error
                }}
              >
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Email or Phone
                </label>
                <input
                  name="emailOrPhone"
                  type="text"
                  placeholder="Enter your email or phone"
                  required
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: currentTheme.colors.background,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text,
                    focusRingColor: currentTheme.colors.primary
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    required
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 pr-12"
                    style={{ 
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text,
                      focusRingColor: currentTheme.colors.primary
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm px-2 py-1 rounded-lg"
                    style={{ backgroundColor: currentTheme.colors.surface, color: currentTheme.colors.textSecondary, border: `1px solid ${currentTheme.colors.border}` }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="rounded border-2 mr-2"
                  style={{ borderColor: currentTheme.colors.border }}
                />
                <span 
                  className="text-sm"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  Remember me
                </span>
              </label>
              <a 
                href="#" 
                className="text-sm font-medium hover:underline"
                style={{ color: currentTheme.colors.primary }}
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ 
                background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.secondary} 100%)`,
                boxShadow: `0 4px 15px ${currentTheme.colors.primary}30`
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p 
              className="text-sm"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-semibold hover:underline"
                style={{ color: currentTheme.colors.primary }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p 
            className="text-xs"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
