import React, { useState, useEffect } from 'react';
import { 
  Gavel, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Plus, 
  X, 
  Trophy,
  History,
  ShieldCheck,
  Wheat
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Auction, Bid, User } from '../types';

interface AuctionsProps {
  auctions: Auction[];
  currentUser: User | null;
  onPlaceBid: (auctionId: number, amount: number) => Promise<{ success: boolean; message: string }>;
  onCreateAuction: (auctionData: Partial<Auction>) => Promise<boolean>;
  fetchAuctionBids: (auctionId: number) => Promise<Bid[]>;
}

export const Auctions: React.FC<AuctionsProps> = ({
  auctions,
  currentUser,
  onPlaceBid,
  onCreateAuction,
  fetchAuctionBids,
}) => {
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [bidsHistory, setBidsHistory] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidStatusMsg, setBidStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  // Farmer Create Auction Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAuctionForm, setNewAuctionForm] = useState({
    cropName: 'Sharbati Wheat Special Lot',
    quantity: 120,
    unit: 'Quintal',
    grade: 'A+' as 'A+' | 'A' | 'B' | 'C',
    basePrice: 2280,
    endTime: new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16),
    location: currentUser?.district ? `${currentUser.district}, ${currentUser.state}` : 'Karnal, Haryana',
    description: 'Freshly harvested dry Sharbati grain lot. Stored in climate-controlled godown.',
  });

  const handleOpenBidModal = async (auction: Auction) => {
    setSelectedAuction(auction);
    setBidAmount(auction.currentBid + 20);
    setBidStatusMsg(null);
    const history = await fetchAuctionBids(auction.id);
    setBidsHistory(history);
  };

  const handleQuickAdd = (inc: number) => {
    if (selectedAuction) {
      setBidAmount(selectedAuction.currentBid + inc);
    }
  };

  const submitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuction) return;

    if (!currentUser) {
      setBidStatusMsg({ type: 'error', text: 'Please sign in or select a buyer persona from top navigation.' });
      return;
    }

    if (currentUser.id === selectedAuction.farmerId) {
      setBidStatusMsg({ type: 'error', text: 'Farmers cannot place bids on their own auction lots.' });
      return;
    }

    if (bidAmount <= selectedAuction.currentBid) {
      setBidStatusMsg({ type: 'error', text: `Your bid must exceed current leading bid of ₹${selectedAuction.currentBid.toLocaleString('en-IN')}.` });
      return;
    }

    setIsSubmittingBid(true);
    const res = await onPlaceBid(selectedAuction.id, bidAmount);
    setIsSubmittingBid(false);

    if (res.success) {
      // Trigger festive celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1B4332', '#D97706', '#10B981', '#F59E0B']
      });

      setBidStatusMsg({ type: 'success', text: `Success! You are now the leading bidder at ₹${bidAmount.toLocaleString('en-IN')}.` });
      
      // Update local state
      const updatedAuction = { ...selectedAuction, currentBid: bidAmount };
      setSelectedAuction(updatedAuction);
      setBidAmount(bidAmount + 20);

      const refreshed = await fetchAuctionBids(selectedAuction.id);
      setBidsHistory(refreshed);
    } else {
      setBidStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleCreateAuctionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onCreateAuction({
      cropName: newAuctionForm.cropName,
      quantity: Number(newAuctionForm.quantity),
      unit: newAuctionForm.unit,
      grade: newAuctionForm.grade,
      basePrice: Number(newAuctionForm.basePrice),
      currentBid: Number(newAuctionForm.basePrice),
      endTime: new Date(newAuctionForm.endTime).toISOString(),
      location: newAuctionForm.location,
      description: newAuctionForm.description,
    });

    if (ok) {
      setShowCreateModal(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header with Title and Create Auction Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Gavel className="w-3.5 h-3.5 text-amber-500" />
            Electronic Mandi Bidding
          </div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            Live Agricultural Crop Auctions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Real-time wholesale lot auctions with automated clock timeouts, transparent bid logs, and protected reserve pricing.
          </p>
        </div>

        <div>
          {currentUser?.role === 'farmer' ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Launch New Auction
            </button>
          ) : (
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Current Active Persona</span>
              <span className="text-xs font-semibold text-emerald-800">
                {currentUser?.name || 'Visitor (Sign in to bid)'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Live Auctions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((auc) => {
          const isEnded = new Date(auc.endTime).getTime() <= Date.now() || auc.status !== 'active';
          return (
            <div
              key={auc.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Card Header with Status and Grade */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Lot #{auc.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-amber-950 text-[11px] font-bold px-2 py-0.5 rounded">
                    Grade {auc.grade}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                    isEnded ? 'bg-slate-700 text-slate-300' : 'bg-emerald-800 text-emerald-100'
                  }`}>
                    {auc.status}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
                    <span>Producer: <strong>{auc.farmerName}</strong></span>
                    <span>{auc.location}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 font-serif mb-1">
                    {auc.cropName}
                  </h3>

                  <div className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                    {auc.description}
                  </div>

                  {/* Pricing Matrix */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Reserve Base</span>
                      <span className="text-sm font-semibold text-slate-700">
                        ₹{auc.basePrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-emerald-700 block font-bold">Leading Bid</span>
                      <span className="text-lg font-bold text-emerald-800 font-sans">
                        ₹{auc.currentBid.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Lot Size & Time Remaining */}
                  <div className="flex items-center justify-between text-xs text-slate-500 py-2 border-t border-slate-100">
                    <span>Lot Size: <strong className="text-slate-800">{auc.quantity} {auc.unit}</strong></span>
                    <span className="flex items-center gap-1 text-amber-700 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(auc.endTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleOpenBidModal(auc)}
                    className="w-full mt-2 py-2.5 rounded font-bold text-xs sm:text-sm bg-amber-400 hover:bg-amber-500 text-amber-950 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Gavel className="w-4 h-4" />
                    Place Bid / View Logs
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bid Interaction Modal with Live Log */}
      {selectedAuction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold font-serif text-white">
                    Auction Lot #{selectedAuction.id} – {selectedAuction.cropName}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Producer: {selectedAuction.farmerName} · {selectedAuction.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAuction(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Status Alert */}
              {bidStatusMsg && (
                <div className={`p-3 rounded text-xs flex items-center gap-2 ${
                  bidStatusMsg.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {bidStatusMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{bidStatusMsg.text}</span>
                </div>
              )}

              {/* Current Top Bid Hero */}
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-4 rounded-lg border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider block">
                    Current Highest Leading Bid
                  </span>
                  <div className="text-3xl font-bold text-emerald-900 font-sans mt-0.5">
                    ₹{selectedAuction.currentBid.toLocaleString('en-IN')}{' '}
                    <span className="text-xs text-emerald-700 font-normal">/ {selectedAuction.unit}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-600">
                  <div>Lot Volume: <strong>{selectedAuction.quantity} {selectedAuction.unit}</strong></div>
                  <div>Base Reserve: <strong>₹{selectedAuction.basePrice.toLocaleString('en-IN')}</strong></div>
                </div>
              </div>

              {/* Bid Form */}
              <form onSubmit={submitBid} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Competitive Bid (₹ per {selectedAuction.unit}) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="1"
                      min={selectedAuction.currentBid + 1}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      required
                      className="flex-1 px-3 py-2.5 text-base font-bold text-slate-900 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingBid}
                      className="px-6 py-2.5 font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded text-sm transition-all shadow disabled:opacity-50"
                    >
                      {isSubmittingBid ? 'Submitting...' : 'Confirm Bid'}
                    </button>
                  </div>
                </div>

                {/* Quick Increment Chips */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Quick Increments:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(20)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition-colors"
                  >
                    + ₹20
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(50)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition-colors"
                  >
                    + ₹50
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(100)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition-colors"
                  >
                    + ₹100
                  </button>
                </div>
              </form>

              {/* Real-time Bid Log Table */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    Live Bidding History ({bidsHistory.length} bids)
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    Verified Bidders
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto rounded border border-slate-200 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Bidder</th>
                        <th className="p-2.5">Bid Amount</th>
                        <th className="p-2.5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bidsHistory.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-slate-400">
                            No bids recorded yet. Place the opening bid!
                          </td>
                        </tr>
                      ) : (
                        bidsHistory.map((b, idx) => (
                          <tr key={b.id} className={idx === 0 ? 'bg-emerald-50/70 font-semibold' : ''}>
                            <td className="p-2.5 text-slate-800 flex items-center gap-1.5">
                              {idx === 0 && <Trophy className="w-3 h-3 text-amber-500" />}
                              {b.buyerName || `Trader #${b.buyerId}`}
                            </td>
                            <td className="p-2.5 font-bold text-emerald-800">
                              ₹{b.bidAmount.toLocaleString('en-IN')}
                            </td>
                            <td className="p-2.5 text-slate-400 text-[11px]">
                              {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Farmer Create Auction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center text-amber-900">
                <Gavel className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 font-serif text-base">
                Create Live Produce Auction
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Set reserve threshold price and let verified traders compete for your harvest.
            </p>

            <form onSubmit={handleCreateAuctionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Crop / Commodity Name *</label>
                <input
                  type="text"
                  value={newAuctionForm.cropName}
                  onChange={(e) => setNewAuctionForm({ ...newAuctionForm, cropName: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity *</label>
                  <input
                    type="number"
                    value={newAuctionForm.quantity}
                    onChange={(e) => setNewAuctionForm({ ...newAuctionForm, quantity: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit *</label>
                  <select
                    value={newAuctionForm.unit}
                    onChange={(e) => setNewAuctionForm({ ...newAuctionForm, unit: e.target.value })}
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
                    value={newAuctionForm.grade}
                    onChange={(e) => setNewAuctionForm({ ...newAuctionForm, grade: e.target.value as any })}
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                  >
                    <option value="A+">Grade A+</option>
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Reserve Base Price (₹) *</label>
                  <input
                    type="number"
                    value={newAuctionForm.basePrice}
                    onChange={(e) => setNewAuctionForm({ ...newAuctionForm, basePrice: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Auction End Time *</label>
                  <input
                    type="datetime-local"
                    value={newAuctionForm.endTime}
                    onChange={(e) => setNewAuctionForm({ ...newAuctionForm, endTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Storage / Farm Location *</label>
                <input
                  type="text"
                  value={newAuctionForm.location}
                  onChange={(e) => setNewAuctionForm({ ...newAuctionForm, location: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lot Terms & Dispatch Description</label>
                <textarea
                  rows={3}
                  value={newAuctionForm.description}
                  onChange={(e) => setNewAuctionForm({ ...newAuctionForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-bold bg-amber-400 hover:bg-amber-500 text-amber-950 rounded shadow-sm"
                >
                  Launch Auction Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
