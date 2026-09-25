import React, { useState } from 'react';
import { User, LogIn, UserPlus, X, ShieldCheck, Tractor, Building2 } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
  availableUsers: UserType[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  availableUsers,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('password123');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('password123');
  const [regState, setRegState] = useState('Haryana');
  const [regDistrict, setRegDistrict] = useState('Karnal');
  const [regVillage, setRegVillage] = useState('Taraori');
  const [regBusinessType, setRegBusinessType] = useState('Wholesale Merchant');
  const [regContactPerson, setRegContactPerson] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setLoginError(data.message || 'Login failed. Please check credentials.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Connection error with server backend.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuickLogin = (u: UserType) => {
    onLoginSuccess(u);
    onClose();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setRegSuccess('');
    setRegLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          role,
          state: regState,
          district: regDistrict,
          village: role === 'farmer' ? regVillage : undefined,
          businessType: role === 'buyer' ? regBusinessType : undefined,
          contactPerson: role === 'buyer' ? regContactPerson : undefined,
          pincode: '132001',
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setRegSuccess('Registration successful! Logging you in...');
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 1000);
      } else {
        setLoginError(data.message || 'Registration failed.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Connection error with server backend.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-emerald-900/10">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xl">
              🌾
            </div>
            <div>
              <h3 className="font-bold text-lg font-serif tracking-wide">MandiMart Authentication</h3>
              <p className="text-xs text-emerald-200">
                Backend Server: PHP & Python MySQL-Compatible Session Engine
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 border-b border-slate-200 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('login')}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'login'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'register'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Register Account
          </button>
        </div>

        <div className="p-6">
          {/* Role selector */}
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole('farmer');
                  if (activeTab === 'login') setIdentifier('ramesh.farmer@mandimart.in');
                }}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                  role === 'farmer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Tractor className="w-4 h-4 text-emerald-600" />
                <div className="text-left">
                  <div>Farmer (Cultivator)</div>
                  <div className="text-[10px] font-normal text-slate-500">Sell harvest & check mandi</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('buyer');
                  if (activeTab === 'login') setIdentifier('buyer.rajesh@delhifresh.com');
                }}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                  role === 'buyer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-600" />
                <div className="text-left">
                  <div>Buyer (Institutional)</div>
                  <div className="text-[10px] font-normal text-slate-500">Wholesaler, retailer, trader</div>
                </div>
              </button>
            </div>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {loginError}
            </div>
          )}

          {regSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {regSuccess}
            </div>
          )}

          {activeTab === 'login' ? (
            <div>
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email or Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={role === 'farmer' ? 'e.g. 9876543210 or ramesh.farmer@mandimart.in' : 'e.g. buyer.rajesh@delhifresh.com'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="text-[11px] text-slate-500 mt-1">
                    Demo credential password: <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-mono">password123</code>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg text-sm transition-colors shadow-sm mt-2"
                >
                  {loginLoading ? 'Authenticating...' : `Log In as ${role === 'farmer' ? 'Farmer' : 'Buyer'}`}
                </button>
              </form>

              {/* Quick Persona Switcher for College Evaluation & Viva */}
              <div className="mt-5 pt-4 border-t border-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                  <span>Quick Demo Personas</span>
                  <span className="text-[10px] text-emerald-700 font-normal">Click to test instantly</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {availableUsers.slice(0, 4).map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u)}
                      className="p-2 border border-slate-200 hover:border-emerald-500 rounded-lg text-left text-xs bg-slate-50 hover:bg-emerald-50/60 transition-colors"
                    >
                      <div className="font-semibold text-slate-800 truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{u.role} • {u.district}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'farmer' ? 'e.g. Vikramaditya Patil' : 'e.g. AgroPulse Foods Pvt Ltd'}
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit phone"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {role === 'farmer' ? (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Village</label>
                    <input
                      type="text"
                      placeholder="Village name"
                      value={regVillage}
                      onChange={(e) => setRegVillage(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                    <input
                      type="text"
                      placeholder="District"
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      placeholder="State"
                      value={regState}
                      onChange={(e) => setRegState(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Business Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Wholesaler / Exporter"
                      value={regBusinessType}
                      onChange={(e) => setRegBusinessType(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={regContactPerson}
                      onChange={(e) => setRegContactPerson(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg text-sm transition-colors shadow-sm mt-3"
              >
                {regLoading ? 'Registering...' : `Create ${role === 'farmer' ? 'Farmer' : 'Buyer'} Account`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
