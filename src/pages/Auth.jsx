import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api';
import LogoImage from '../assests/Capture.PNG';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegisterOnly = localStorage.getItem('registerNewAdmin') === 'true' || new URLSearchParams(location.search).get('register') === 'true';

  const [isLogin, setIsLogin] = useState(() => {
    return !isRegisterOnly;
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.removeItem('registerNewAdmin');
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'admin' // Defaulting to admin for an admin panel
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await loginUser({
      email: formData.email,
      password: formData.password,
      role: formData.role
    });

    // Check for token in multiple possible locations
    const token = res.token || (res.data && res.data.token);
    const user = res.user || (res.data && res.data.user) || { fullName: 'Admin User' };

    if (token) {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      window.dispatchEvent(new Event('auth-change'));
      navigate('/');
    } else if (res.message && res.message.toLowerCase().includes('success') && !token) {
      // If the API says success but didn't provide a token in expected places
      setError('Login successful but no security token received from server.');
    } else {
      setError(res.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (step < 2) {
      setStep(2);
      return;
    }
    
    setLoading(true);
    const res = await registerUser(formData);
    const token = res.token || (res.data && res.data.token);
    const isSuccess = token || (res.message && res.message.toLowerCase().includes('success'));

    if (isSuccess) {
      if (token) {
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(res.user || (res.data && res.data.user) || { fullName: formData.fullName }));
        window.dispatchEvent(new Event('auth-change'));
        navigate('/');
      } else {
        // Auto-login attempt for seamless redirect
        const loginRes = await loginUser({
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        
        const loginToken = loginRes.token || (loginRes.data && loginRes.data.token);
        const loginUserObj = loginRes.user || (loginRes.data && loginRes.data.user) || { fullName: formData.fullName };

        if (loginToken) {
          localStorage.setItem('adminToken', loginToken);
          localStorage.setItem('adminUser', JSON.stringify(loginUserObj));
          window.dispatchEvent(new Event('auth-change'));
          navigate('/');
        } else {
          if (isRegisterOnly) {
            navigate('/auth');
          } else {
            setIsLogin(true);
            setStep(1);
            setError('Account created! Please login now.');
          }
        }
      }
    } else {
      setError(res.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent-purple/10 blur-[150px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent-pink/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-[calc(100%-28px)] sm:w-full max-w-[480px] p-6 sm:p-10 glass rounded-[30px] sm:rounded-[40px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative z-10 mx-[14px] sm:mx-auto"
      >
        {/* Logo/Title */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(192,38,211,0.2)] bg-black border border-white/10 overflow-hidden group">
            <img src={LogoImage} alt="Escentrum Logo" className="w-full h-full object-cover scale-[1.45] transition-transform duration-700 group-hover:scale-[1.55]" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
            {isLogin ? 'Welcome Back' : 'Join the Elite'}
          </h1>
          <p className="text-text-muted text-sm font-medium">
            {isLogin ? 'Enter your credentials to access the vault' : 'Create your professional admin profile'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-5">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                <div className="relative group">
                  <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent-pink transition-colors"></i>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="off"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-accent-pink/50 transition-all placeholder:text-white/20"
                  />
                </div>
                <div className="relative group">
                  <i className="ri-lock-2-line absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent-pink transition-colors"></i>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-accent-pink/50 transition-all placeholder:text-white/20"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`signup-step-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {/* Stepper Indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 1 ? 'w-8 bg-accent-pink' : 'w-4 bg-white/10'}`}></div>
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 2 ? 'w-8 bg-accent-pink' : 'w-4 bg-white/10'}`}></div>
                </div>

                {step === 1 ? (
                  <>
                    <div className="relative group">
                      <i className="ri-user-line absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent-pink transition-colors"></i>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        autoComplete="off"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-accent-pink/50 transition-all placeholder:text-white/20"
                      />
                    </div>
                    <div className="relative group">
                      <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent-pink transition-colors"></i>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="off"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-accent-pink/50 transition-all placeholder:text-white/20"
                      />
                    </div>
                    <div className="relative group">
                      <i className="ri-lock-2-line absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent-pink transition-colors"></i>
                      <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-accent-pink/50 transition-all placeholder:text-white/20"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative group">
                      <i className="ri-phone-line absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent-pink transition-colors"></i>
                      <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        autoComplete="off"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-accent-pink/50 transition-all placeholder:text-white/20"
                      />
                    </div>
                    <div className="relative group">
                      <i className="ri-map-pin-line absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent-pink transition-colors"></i>
                      <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        autoComplete="off"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-accent-pink/50 transition-all placeholder:text-white/20"
                      />
                    </div>
                    <select
                      name="role"
                      onChange={handleChange}
                      value={formData.role}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-accent-pink/50 transition-all appearance-none"
                    >
                      <option value="admin" className="bg-sidebar">Admin</option>
                      <option value="customer" className="bg-sidebar">Customer</option>
                    </select>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-accent-purple to-accent-pink text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-[0_15px_30px_rgba(244,63,94,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Processing</span>
              </div>
            ) : (
              <span>{isLogin ? 'Sign In' : (step === 1 ? 'Next Step' : 'Create Account')}</span>
            )}
          </button>
        </form>

        {!isLogin && (
          <div className="mt-8 text-center">
            <p className="text-text-muted text-xs font-medium">
              Already a member?
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setStep(1);
                  setError('');
                  navigate('/auth');
                }}
                className="ml-2 text-accent-pink font-bold hover:underline"
              >
                Back to Vault
              </button>
            </p>
          </div>
        )}
      </motion.div>

      {/* Decorative Corner Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none"></div>
    </div>
  );
};

export default Auth;
