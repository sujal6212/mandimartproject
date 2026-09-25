import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Wheat, 
  Gavel, 
  Building2, 
  Download, 
  TrendingUp, 
  Plus, 
  Trash2, 
  FileCode2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Crop, Mandi, MandiPrice, User } from '../types';

interface AdminDashboardProps {
  stats: any;
  users: User[];
  crops: Crop[];
  mandis: Mandi[];
  prices: MandiPrice[];
  onAddMandiPrice: (priceData: Partial<MandiPrice>) => Promise<boolean>;
  onDeleteCrop: (cropId: number) => Promise<boolean>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  users,
  crops,
  mandis,
  prices,
  onAddMandiPrice,
  onDeleteCrop,
}) => {
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [newPriceForm, setNewPriceForm] = useState({
    mandiId: mandis[0]?.id || 1,
    cropName: 'Tomato',
    minPrice: 1200,
    averagePrice: 1550,
    maxPrice: 1850,
    trend: 'stable' as 'up' | 'down' | 'stable',
  });

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onAddMandiPrice({
      mandiId: Number(newPriceForm.mandiId),
      cropName: newPriceForm.cropName,
      minPrice: Number(newPriceForm.minPrice),
      averagePrice: Number(newPriceForm.averagePrice),
      maxPrice: Number(newPriceForm.maxPrice),
      trend: newPriceForm.trend,
    });
    if (ok) {
      setShowPriceModal(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-red-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            National MandiMart Administration
          </div>
          <h1 className="text-2xl font-bold font-serif tracking-tight">
            Exchange Oversight & Moderation Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            System administration, price publishing, user registry, and final viva project export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPriceModal(true)}
            className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Publish Mandi Price
          </button>
          <a
            href="/api/export/zip"
            download
            className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            Download mandimart.zip
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Total Users</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-serif">
            {stats?.users || users.length} Accounts
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            {users.filter(u => u.role === 'farmer').length} Farmers, {users.filter(u => u.role === 'buyer').length} Buyers
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Listed Produce</span>
            <Wheat className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-800 font-serif">
            {stats?.crops || crops.length} Lots
          </div>
          <span className="text-[11px] text-slate-400">
            Across 5 major states
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Live Auctions</span>
            <Gavel className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-serif">
            {stats?.auctions || 3} Active
          </div>
          <span className="text-[11px] text-slate-400">
            Real-time bidding enabled
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">APMC Mandis</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-serif">
            {stats?.mandis || mandis.length} Yards
          </div>
          <span className="text-[11px] text-slate-400">
            With GPS coordinates
          </span>
        </div>
      </div>

      {/* College Project Architecture Callout */}
      <div className="bg-gradient-to-br from-emerald-900 to-[#143D28] text-white p-6 rounded-xl border border-emerald-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <FileCode2 className="w-4 h-4" />
              Comprehensive Multi-Tier Architecture
            </span>
            <h3 className="text-lg font-bold font-serif text-white">
              Full-Stack Repository Ready for Viva & Academic Defense
            </h3>
            <p className="text-xs text-emerald-200/90 leading-relaxed max-w-2xl">
              Includes PHP 8 MVC structure in <code>/mandimart</code>, relational MySQL schema in <code>/mandimart/database/mandimart.sql</code>, Python Flask computer vision in <code>/mandimart/ai-backend/app.py</code>, and React TypeScript frontend on Vite with Node.js Express API.
            </p>
          </div>
          <a
            href="/api/export/zip"
            download
            className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded shadow flex items-center gap-1.5 transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            Download Source Bundle
          </a>
        </div>
      </div>

      {/* Two Columns: Recent Produce Listings & Mandi Price Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crops Management */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-serif">
              Marketplace Crop Listings ({crops.length})
            </h3>
            <span className="text-xs text-slate-500">Moderation</span>
          </div>

          <div className="overflow-x-auto text-xs max-h-80">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-3">Crop</th>
                  <th className="p-3">Farmer</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {crops.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{c.name}</td>
                    <td className="p-3 text-slate-600">{c.farmerName}</td>
                    <td className="p-3 font-bold text-emerald-800">₹{c.expectedPrice}</td>
                    <td className="p-3">
                      <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                        {c.grade}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${c.name}?`)) onDeleteCrop(c.id);
                        }}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mandi Price Records */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-serif">
              Published Benchmark Prices ({prices.length})
            </h3>
            <button
              onClick={() => setShowPriceModal(true)}
              className="text-xs text-emerald-800 font-bold hover:underline"
            >
              + Add Rate
            </button>
          </div>

          <div className="overflow-x-auto text-xs max-h-80">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-3">Mandi</th>
                  <th className="p-3">Crop</th>
                  <th className="p-3">Average (₹)</th>
                  <th className="p-3">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prices.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{p.mandiName}</td>
                    <td className="p-3 text-slate-600">{p.cropName}</td>
                    <td className="p-3 font-bold text-emerald-800">₹{p.averagePrice}</td>
                    <td className="p-3">
                      <span className="font-semibold uppercase text-[11px] text-slate-600">
                        {p.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Publish Price Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative">
            <h3 className="font-bold text-slate-900 font-serif text-base mb-1">
              Publish New Mandi Rate Entry
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update APMC modal prices for market transparency.
            </p>

            <form onSubmit={handlePriceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mandi *</label>
                <select
                  value={newPriceForm.mandiId}
                  onChange={(e) => setNewPriceForm({ ...newPriceForm, mandiId: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                >
                  {mandis.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.district})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Commodity / Crop *</label>
                <input
                  type="text"
                  value={newPriceForm.cropName}
                  onChange={(e) => setNewPriceForm({ ...newPriceForm, cropName: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min (₹)</label>
                  <input
                    type="number"
                    value={newPriceForm.minPrice}
                    onChange={(e) => setNewPriceForm({ ...newPriceForm, minPrice: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Average (₹)</label>
                  <input
                    type="number"
                    value={newPriceForm.averagePrice}
                    onChange={(e) => setNewPriceForm({ ...newPriceForm, averagePrice: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max (₹)</label>
                  <input
                    type="number"
                    value={newPriceForm.maxPrice}
                    onChange={(e) => setNewPriceForm({ ...newPriceForm, maxPrice: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Trend</label>
                <select
                  value={newPriceForm.trend}
                  onChange={(e) => setNewPriceForm({ ...newPriceForm, trend: e.target.value as any })}
                  className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                >
                  <option value="up">UP ↗</option>
                  <option value="stable">STABLE →</option>
                  <option value="down">DOWN ↘</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPriceModal(false)}
                  className="flex-1 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded shadow-sm"
                >
                  Save Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
