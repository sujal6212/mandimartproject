import React, { useState } from 'react';
import { 
  Sprout, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  PackageCheck
} from 'lucide-react';
import { Crop, Inquiry, User } from '../types';
import { getAssetUrl } from '../utils/assets';

interface FarmerDashboardProps {
  currentUser: User;
  crops: Crop[];
  inquiries: Inquiry[];
  onAddCrop: (cropData: Partial<Crop>) => Promise<boolean>;
  onDeleteCrop: (cropId: number) => Promise<boolean>;
  onUpdateInquiryStatus: (inquiryId: number, status: 'accepted' | 'rejected') => Promise<boolean>;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  currentUser,
  crops,
  inquiries,
  onAddCrop,
  onDeleteCrop,
  onUpdateInquiryStatus,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: 'Fresh Hybrid Tomato',
    quantity: 50,
    unit: 'Quintal',
    grade: 'A' as 'A+' | 'A' | 'B' | 'C',
    expectedPrice: 1450,
    location: `${currentUser.district}, ${currentUser.state}`,
    description: 'Direct field harvested produce, sorted and packed in 25kg crates. Ready for dispatch.',
    imageUrl: '/assets/images/sample_tomato.svg',
  });

  const farmerCrops = crops.filter(c => c.farmerId === currentUser.id);
  const farmerInquiries = inquiries.filter(i => i.farmerId === currentUser.id);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onAddCrop({
      ...addForm,
      quantity: Number(addForm.quantity),
      expectedPrice: Number(addForm.expectedPrice),
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmerPhone: currentUser.phone,
    });
    if (ok) {
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            Cultivator Central
          </div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            Farmer Portal: {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentUser.village ? `${currentUser.village}, ` : ''}{currentUser.district}, {currentUser.state} · Registered Cultivator #{currentUser.id}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded shadow-sm flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          List New Harvest
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-medium block">Active Crop Listings</span>
          <div className="text-2xl font-bold text-emerald-800 font-serif mt-1">
            {farmerCrops.length} Lots
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-medium block">Total Harvest Volume Listed</span>
          <div className="text-2xl font-bold text-slate-800 font-serif mt-1">
            {farmerCrops.reduce((acc, c) => acc + c.quantity, 0)} Quintals
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-medium block">Direct Buyer Inquiries</span>
          <div className="text-2xl font-bold text-amber-700 font-serif mt-1">
            {farmerInquiries.length} Requests
          </div>
        </div>
      </div>

      {/* Farmer's Crop Listings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 font-serif">
            My Harvest Listings ({farmerCrops.length})
          </h3>
          <span className="text-xs text-slate-500">Live on Public Marketplace</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Produce</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Available Quantity</th>
                <th className="p-3">Asking Price</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {farmerCrops.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    You have no active crop listings. Click "List New Harvest" to post your first lot!
                  </td>
                </tr>
              ) : (
                farmerCrops.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                      <img src={c.imageUrl} alt={c.name} className="w-8 h-8 object-contain rounded" />
                      <div>
                        <div>{c.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{c.location}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px]">
                        Grade {c.grade}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-700">
                      {c.quantity} {c.unit}
                    </td>
                    <td className="p-3 font-bold text-emerald-800">
                      ₹{c.expectedPrice.toLocaleString('en-IN')} / {c.unit}
                    </td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px] uppercase">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remove listing for ${c.name}?`)) {
                            onDeleteCrop(c.id);
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Received Buyer Inquiries */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 font-serif">
            Direct Buyer Inquiries & Offers ({farmerInquiries.length})
          </h3>
          <span className="text-xs text-slate-500">Negotiate & Confirm Dispatch</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Buyer Company</th>
                <th className="p-3">Produce</th>
                <th className="p-3">Requested Quantity</th>
                <th className="p-3">Buyer Message</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {farmerInquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No buyer inquiries received yet.
                  </td>
                </tr>
              ) : (
                farmerInquiries.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{i.buyerName || `Trader #${i.buyerId}`}</div>
                      <div className="text-[11px] text-emerald-700 font-normal">{i.buyerPhone || 'Verified Buyer'}</div>
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      {i.cropName}
                    </td>
                    <td className="p-3 font-bold text-slate-700">
                      {i.quantity} Quintals
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs">
                      {i.message}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] uppercase ${
                        i.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                        i.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {i.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onUpdateInquiryStatus(i.id, 'accepted')}
                            className="p-1.5 bg-emerald-800 text-white hover:bg-emerald-900 rounded"
                            title="Accept Inquiry"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onUpdateInquiryStatus(i.id, 'rejected')}
                            className="p-1.5 bg-slate-100 text-red-600 hover:bg-red-50 rounded"
                            title="Decline Inquiry"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Responded</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Crop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center text-emerald-900">
                <Sprout className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 font-serif text-base">
                List New Crop Lot
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Publish harvest to verified wholesale traders across India.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Produce Name *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity *</label>
                  <input
                    type="number"
                    value={addForm.quantity}
                    onChange={(e) => setAddForm({ ...addForm, quantity: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit *</label>
                  <select
                    value={addForm.unit}
                    onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                  >
                    <option value="Quintal">Quintal</option>
                    <option value="Kg">Kg</option>
                    <option value="Ton">Ton</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Grade *</label>
                  <select
                    value={addForm.grade}
                    onChange={(e) => setAddForm({ ...addForm, grade: e.target.value as any })}
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                  >
                    <option value="A+">Grade A+</option>
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expected Wholesale Price (₹ / {addForm.unit}) *</label>
                <input
                  type="number"
                  value={addForm.expectedPrice}
                  onChange={(e) => setAddForm({ ...addForm, expectedPrice: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Farm / Yard Location *</label>
                <input
                  type="text"
                  value={addForm.location}
                  onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Produce Description</label>
                <textarea
                  rows={3}
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded shadow-sm"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
