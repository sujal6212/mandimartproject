import React, { useState } from 'react';
import { 
  Sprout, 
  Store, 
  Gavel, 
  TrendingUp, 
  ScanSearch, 
  Bot, 
  Bell, 
  User, 
  Download, 
  ShieldCheck,
  ChevronDown,
  MessageSquare,
  Server,
  Database,
  LogIn,
  Tractor,
  Building2
} from 'lucide-react';
import { User as UserType, Notification } from '../types';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  currentUser: UserType | null;
  setCurrentUser: (user: UserType | null) => void;
  availableUsers: UserType[];
  notifications: Notification[];
  onOpenChat: () => void;
  onOpenAuth: () => void;
  onMarkNotificationsRead: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  currentUser,
  setCurrentUser,
  availableUsers,
  notifications,
  onOpenChat,
  onOpenAuth,
  onMarkNotificationsRead,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-[#143D28] text-white border-b border-[#1E5638] shadow-md">
      {/* Top Format Banner (Highlighting the User's Exact 3-Tier Architecture) */}
      <div className="bg-[#0D281A] px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-[#1E5638]/60">
        <div className="flex items-center gap-2 text-emerald-200">
          <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-400 text-amber-950 px-2 py-0.5 rounded">
            Project Architecture
          </span>
          <span className="text-emerald-100 text-[11px] hidden sm:inline">
            <strong>Frontend:</strong> HTML / CSS / JS / Bootstrap &nbsp;|&nbsp; 
            <strong>Backend:</strong> PHP & Python (Flask) &nbsp;|&nbsp; 
            <strong>Database:</strong> MySQL
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const farmer = availableUsers.find(u => u.role === 'farmer');
                if (farmer) setCurrentUser(farmer);
                setCurrentView('farmer-portal');
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white transition-colors flex items-center gap-1 border border-emerald-600/40"
              title="Switch to what farmers see on the website"
            >
              <Tractor className="w-3 h-3 text-amber-400" />
              <span>Farmer View</span>
            </button>

            <button
              onClick={() => {
                const buyer = availableUsers.find(u => u.role === 'buyer');
                if (buyer) setCurrentUser(buyer);
                setCurrentView('marketplace');
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-blue-900/60 hover:bg-blue-800 text-blue-200 hover:text-white transition-colors flex items-center gap-1 border border-blue-600/40"
              title="Switch to what buyers see on the website"
            >
              <Building2 className="w-3 h-3 text-blue-300" />
              <span>Buyer View</span>
            </button>
          </div>

          <a
            href="/api/export/zip"
            download
            className="text-amber-300 hover:text-white text-[11px] flex items-center gap-1 bg-amber-950/60 hover:bg-amber-900 border border-amber-600/50 px-2 py-0.5 rounded transition-colors font-bold"
            title="Download complete PHP/MySQL/Python project archive for college submission"
          >
            <Download className="w-3 h-3" />
            <span>Export Full Code (.zip)</span>
          </a>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div 
            onClick={() => setCurrentView('marketplace')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-[#0D281A] shadow-md group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-serif">
                MandiMart
                <span className="text-[10px] bg-amber-400 text-amber-950 font-sans font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">
                  Bootstrap Ready
                </span>
              </div>
              <p className="text-[10px] text-emerald-300/90 tracking-wide uppercase font-medium">
                Direct Farmer-Buyer Agricultural Marketplace
              </p>
            </div>
          </div>

          {/* Primary Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Frontend Group */}
            <button
              onClick={() => setCurrentView('marketplace')}
              className={`px-3 py-2 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
                currentView === 'marketplace'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900/50 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              Buyer Marketplace
            </button>

            <button
              onClick={() => setCurrentView('farmer-portal')}
              className={`px-3 py-2 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
                currentView === 'farmer-portal'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900/50 hover:text-white'
              }`}
            >
              <Tractor className="w-3.5 h-3.5 text-amber-300" />
              Farmer Portal
            </button>

            <button
              onClick={() => setCurrentView('communication')}
              className={`px-3 py-2 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
                currentView === 'communication'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900/50 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-300" />
              Buyer-Farmer Chat
            </button>

            <button
              onClick={() => setCurrentView('mandi-prices')}
              className={`px-3 py-2 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
                currentView === 'mandi-prices'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900/50 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              Mandi Rates
            </button>

            <button
              onClick={() => setCurrentView('backend-hub')}
              className={`px-3 py-2 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
                currentView === 'backend-hub'
                  ? 'bg-amber-400 text-amber-950 font-bold shadow-xs'
                  : 'text-amber-300 hover:bg-emerald-900/50 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              Backend (PHP/Python)
            </button>

            <button
              onClick={() => setCurrentView('database')}
              className={`px-3 py-2 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
                currentView === 'database'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900/50 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-teal-300" />
              Database (MySQL)
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Assistant Button */}
            <button
              onClick={onOpenChat}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-amber-950 font-bold text-xs px-2.5 py-1.5 rounded flex items-center gap-1.5 shadow-sm transition-all"
              title="Open AI Agriculture Assistant"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI Help</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  if (unreadCount > 0) onMarkNotificationsRead();
                }}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-900/50 rounded relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Notifications & Bids
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      {notifications.length} total
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400">No alerts yet</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 hover:bg-slate-50 ${!n.isRead ? 'bg-emerald-50/50' : ''}`}>
                          <div className="font-semibold text-slate-900">{n.title}</div>
                          <div className="text-slate-600 mt-0.5">{n.message}</div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role / User Switcher */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-emerald-900/80 hover:bg-emerald-900 text-white text-xs px-2.5 py-1.5 rounded border border-emerald-700/60 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-emerald-300" />
                  <div className="text-left hidden sm:block">
                    <div className="font-medium leading-none max-w-[100px] truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-emerald-300/90 uppercase font-semibold mt-0.5">
                      {currentUser.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-emerald-300" />
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="btn btn-warning btn-sm fw-bold px-3 py-1.5 rounded text-xs d-flex align-items-center gap-1.5 shadow-sm text-amber-950"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login / Register
                </button>
              )}

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                    <span>Active Personas</span>
                    <button onClick={onOpenAuth} className="text-emerald-700 hover:underline">New</button>
                  </div>
                  {availableUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 ${
                        currentUser?.id === u.id ? 'bg-emerald-50 font-bold text-emerald-900' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div>{u.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {u.district}, {u.state}
                        </div>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        u.role === 'farmer' ? 'bg-emerald-100 text-emerald-800' :
                        u.role === 'buyer' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.role}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1 px-3">
                    <button
                      onClick={() => {
                        setCurrentUser(null);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left py-1 text-xs text-red-600 hover:underline"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
