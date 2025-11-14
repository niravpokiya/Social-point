import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/axiosInstance';

const Register = () => {
  const { currentTheme } = useTheme();
  const [form, setForm] = useState({
    name: '',
    username: '',
    emailOrPhone: '',
    password: '',
    confirmPassword: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!form.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (form.username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }
    if (!form.emailOrPhone.trim()) {
      setError("Email or phone is required");
      return false;
    }
    if (!form.password) {
      setError("Password is required");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      const { data } = await api.post('/api/auth/register', {
        name: form.name,
        username: form.username,
        emailOrPhone: form.emailOrPhone,
        password: form.password,
        bio: form.bio
      });
      
      if (data?.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/home";
      } else {
        setError("Registration failed");
      }
    } catch (error) {
      setError(error?.response?.data?.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && form.name && form.username) {
      setStep(2);
    } else if (step === 1) {
      setError("Please fill in your name and username");
    }
  };

  const prevStep = () => {
    setStep(1);
    setError('');
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
            Join Social-Point
          </h1>
          <p 
            className="text-sm"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            Create your account and start connecting
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 1 ? 'text-white' : 'text-gray-400'
              }`}
              style={{ 
                backgroundColor: step >= 1 ? currentTheme.colors.primary : currentTheme.colors.border
              }}
            >
              1
            </div>
            <div 
              className={`flex-1 h-1 rounded-full ${
                step >= 2 ? '' : 'opacity-30'
              }`}
              style={{ backgroundColor: currentTheme.colors.primary }}
            ></div>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 2 ? 'text-white' : 'text-gray-400'
              }`}
              style={{ 
                backgroundColor: step >= 2 ? currentTheme.colors.primary : currentTheme.colors.border
              }}
            >
              2
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div 
          className="rounded-2xl shadow-2xl p-8"
          style={{ backgroundColor: currentTheme.colors.surface }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Full Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
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
                    Username
                  </label>
                  <input
                    name="username"
                    type="text"
                    placeholder="Choose a unique username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text,
                      focusRingColor: currentTheme.colors.primary
                    }}
                  />
                  <p 
                    className="text-xs mt-1"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    This will be your unique identifier on Social-Point
                  </p>
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105"
                  style={{ 
                    background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.secondary} 100%)`,
                    boxShadow: `0 4px 15px ${currentTheme.colors.primary}30`
                  }}
                >
                  Continue
                </button>
              </div>
            ) : (
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
                    placeholder="Enter your email or phone number"
                    value={form.emailOrPhone}
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
                  <input
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={form.password}
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
                    Confirm Password
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
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
                    Bio (Optional)
                  </label>
                  <textarea
                    name="bio"
                    placeholder="Tell us about yourself..."
                    value={form.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none"
                    style={{ 
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text,
                      focusRingColor: currentTheme.colors.primary
                    }}
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-4 rounded-xl font-semibold transition-all duration-200 border-2"
                    style={{ 
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{ 
                      background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.secondary} 100%)`,
                      boxShadow: `0 4px 15px ${currentTheme.colors.primary}30`
                    }}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p 
              className="text-sm"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-semibold hover:underline"
                style={{ color: currentTheme.colors.primary }}
              >
                Sign in
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
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
