import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Sparkles, 
  Scale, 
  Send, 
  CheckCircle2, 
  Info,
  X,
  Wheat,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Crop, User } from '../types';
import { getAssetUrl } from '../utils/assets';

interface MarketplaceProps {
  crops: Crop[];
  onSelectCropForDetails: (crop: Crop) => void;
  onSendInquiry: (cropId: number, farmerId: number, quantity: number, message: string) => Promise<boolean>;
  currentUser: User | null;
  onNavigateToAuctions: () => void;
  onNavigateToAiVision: () => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  crops,
  onSelectCropForDetails,
  onSendInquiry,
  currentUser,
  onNavigateToAuctions,
  onNavigateToAiVision,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  // Comparison State
  const [selectedForCompare, setSelectedForCompare] = useState<Crop[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Inquiry Modal State
  const [inquiryTargetCrop, setInquiryTargetCrop] = useState<Crop | null>(null);
  const [inquiryQty, setInquiryQty] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Filter crops
  const filteredCrops = crops.filter(crop => {
    const matchesSearch = 
      crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (crop.farmerName && crop.farmerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = !locationFilter || crop.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesGrade = !gradeFilter || crop.grade === gradeFilter;
    const matchesPrice = !maxPrice || crop.expectedPrice <= maxPrice;
    return matchesSearch && matchesLocation && matchesGrade && matchesPrice;
  });

  const handleToggleCompare = (crop: Crop) => {
    if (selectedForCompare.some(c => c.id === crop.id)) {
      setSelectedForCompare(selectedForCompare.filter(c => c.id !== crop.id));
    } else {
      if (selectedForCompare.length >= 4) {
        alert('You can compare a maximum of 4 crops side-by-side.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, crop]);
    }
  };

  const handleOpenInquiry = (crop: Crop) => {
    setInquiryTargetCrop(crop);
    setInquiryQty('25');
    setInquiryMsg(`Hello ${crop.farmerName || 'Farmer'}, I would like to purchase ${crop.name} in bulk. Please confirm availability and loading schedule.`);
    setInquirySuccess(false);
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryTargetCrop) return;
    setInquirySubmitting(true);
    const ok = await onSendInquiry(
      inquiryTargetCrop.id,
      inquiryTargetCrop.farmerId,
      parseFloat(inquiryQty) || 10,
      inquiryMsg
    );
    setInquirySubmitting(false);
    if (ok) {
      setInquirySuccess(true);
      setTimeout(() => {
        setInquiryTargetCrop(null);
        setInquirySuccess(false);
      }, 1600);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Banner with Value Proposition */}
      <div className="bg-gradient-to-br from-[#1B4332] via-[#245D44] to-[#143D28] text-white rounded-xl p-6 sm:p-8 border border-emerald-800/80 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Transparent Agricultural Commerce
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight leading-tight text-white mb-2">
            Direct Farm Produce Marketplace
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed mb-6 font-normal">
            Procure freshly harvested crops directly from verified Indian cultivators. Zero intermediary cuts, certified quality grades, and transparent wholesale mandi pricing.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onNavigateToAuctions}
              className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded transition-all shadow flex items-center gap-1.5"
            >
              Explore Live Auctions <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigateToAiVision}
              className="bg-emerald-900/80 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded border border-emerald-600/70 transition-all flex items-center gap-1.5"
            >
              Test AI Vegetable Scanner
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by crop, farmer, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-slate-50/50"
            />
          </div>

          <div className="lg:col-span-3 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter by location (e.g. Haryana)..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-slate-50/50"
            />
          </div>

          <div className="lg:col-span-2">
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-slate-50/50 text-slate-700"
            >
              <option value="">All Grades</option>
              <option value="A+">Grade A+ (Premium)</option>
              <option value="A">Grade A (Standard)</option>
              <option value="B">Grade B (Commercial)</option>
              <option value="C">Grade C (Processing)</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <input
              type="number"
              placeholder="Max Price (₹)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 text-sm rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-slate-50/50"
            />
          </div>

          <div className="lg:col-span-1 flex items-center justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('');
                setGradeFilter('');
                setMaxPrice('');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-800 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Quick Filter Tag Chips */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium mr-1">Popular Crops:</span>
          {['Tomato', 'Onion', 'Potato', 'Wheat', 'Brinjal', 'Cauliflower', 'Carrot'].map((c) => (
            <button
              key={c}
              onClick={() => setSearchTerm(c)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors border ${
                searchTerm === c
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Produce Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-slate-700">
            Available Produce Listings ({filteredCrops.length})
          </div>
          <div className="text-xs text-slate-500">
            Sorted by Most Recent Harvest
          </div>
        </div>

        {filteredCrops.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Wheat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No produce matching your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms, removing location filters, or resetting maximum price threshold.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCrops.map((crop) => {
              const isCompared = selectedForCompare.some(c => c.id === crop.id);
              return (
                <div
                  key={crop.id}
                  className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group relative"
                >
                  {/* Card Thumbnail Area */}
                  <div className="relative bg-slate-50 h-48 border-b border-slate-100 p-4 flex items-center justify-center overflow-hidden">
                    <img
                      src={getAssetUrl(crop.imageUrl || (crop as any).image)}
                      alt={crop.name}
                      className="max-h-36 max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
                    />

                    {/* Grade Tag */}
                    <div className="absolute top-3 right-3 bg-amber-400 text-amber-950 font-bold text-xs px-2 py-0.5 rounded shadow-sm">
                      Grade {crop.grade}
                    </div>

                    {/* Compare Selector Checkbox */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2 py-1 rounded border border-slate-200 shadow-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-700 select-none">
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => handleToggleCompare(crop)}
                          className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                        />
                        <span>Compare</span>
                      </label>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Farmer and Rating */}
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-medium truncate max-w-[65%]">
                          {crop.farmerName || 'Verified Producer'}
                        </span>
                        <span className="flex items-center gap-1 text-amber-700 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {crop.rating.toFixed(1)}
                        </span>
                      </div>

                      {/* Title & Price */}
                      <h3 className="font-bold text-slate-900 text-base mb-1 font-serif group-hover:text-emerald-800 transition-colors">
                        {crop.name}
                      </h3>

                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-xl font-bold text-emerald-800 font-sans tracking-tight">
                          ₹{crop.expectedPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500">/ {crop.unit}</span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                        {crop.description}
                      </p>
                    </div>

                    {/* Meta Specs */}
                    <div>
                      <div className="grid grid-cols-2 gap-2 text-xs py-2 px-2.5 bg-slate-50 rounded border border-slate-100 mb-3 text-slate-600">
                        <div>
                          <span className="text-slate-400 text-[11px] block">Available Lot</span>
                          <span className="font-semibold text-slate-800">{crop.quantity} {crop.unit}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">Location</span>
                          <span className="font-semibold text-slate-800 truncate block flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {crop.location}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => onSelectCropForDetails(crop)}
                          className="flex-1 py-2 text-xs font-semibold rounded border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Specs & Details
                        </button>
                        <button
                          onClick={() => handleOpenInquiry(crop)}
                          className="flex-1 py-2 text-xs font-bold rounded bg-emerald-800 hover:bg-emerald-900 text-white transition-colors flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                          Direct Inquiry
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Compare Bar */}
      {selectedForCompare.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D281A] text-white py-3 px-4 border-t border-emerald-700/80 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-amber-400 text-amber-950 font-bold text-xs px-2 py-0.5 rounded">
                {selectedForCompare.length} Selected
              </span>
              <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-200">
                {selectedForCompare.map(c => (
                  <span key={c.id} className="bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700/50">
                    {c.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedForCompare([])}
                className="text-xs text-emerald-300 hover:text-white px-2 py-1"
              >
                Clear
              </button>
              <button
                onClick={() => setShowCompareModal(true)}
                className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 shadow"
              >
                <Scale className="w-3.5 h-3.5" />
                Compare Side-by-Side &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-800" />
                <h2 className="text-base font-bold text-slate-900 font-serif">
                  Side-by-Side Produce Comparison
                </h2>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-3 bg-slate-50 font-bold text-slate-500 w-36 uppercase tracking-wider text-[10px]">
                      Parameter
                    </th>
                    {selectedForCompare.map(c => (
                      <th key={c.id} className="py-3 px-3 font-bold text-slate-900 min-w-[160px] text-center">
                        <img src={c.imageUrl} alt={c.name} className="w-16 h-16 object-contain mx-auto mb-1" />
                        <div className="text-sm font-serif">{c.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-500 bg-slate-50">Quality Grade</td>
                    {selectedForCompare.map(c => (
                      <td key={c.id} className="py-2.5 px-3 text-center">
                        <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                          Grade {c.grade}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-500 bg-slate-50">Price per Unit</td>
                    {selectedForCompare.map(c => (
                      <td key={c.id} className="py-2.5 px-3 text-center font-bold text-emerald-800 text-sm">
                        ₹{c.expectedPrice.toLocaleString('en-IN')} / {c.unit}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-500 bg-slate-50">Lot Size Available</td>
                    {selectedForCompare.map(c => (
                      <td key={c.id} className="py-2.5 px-3 text-center font-semibold text-slate-800">
                        {c.quantity} {c.unit}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-500 bg-slate-50">Farmer & Location</td>
                    {selectedForCompare.map(c => (
                      <td key={c.id} className="py-2.5 px-3 text-center text-slate-600">
                        <div className="font-semibold text-slate-900">{c.farmerName}</div>
                        <div className="text-[11px] text-slate-400">{c.location}</div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-500 bg-slate-50">Farmer Rating</td>
                    {selectedForCompare.map(c => (
                      <td key={c.id} className="py-2.5 px-3 text-center font-bold text-amber-700">
                        ★ {c.rating.toFixed(1)} / 5.0
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-500 bg-slate-50">Action</td>
                    {selectedForCompare.map(c => (
                      <td key={c.id} className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setShowCompareModal(false);
                            handleOpenInquiry(c);
                          }}
                          className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-3 py-1.5 rounded text-xs"
                        >
                          Send Inquiry
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Direct Farmer Inquiry Modal */}
      {inquiryTargetCrop && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setInquiryTargetCrop(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Send className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 font-serif text-base">
                Send Direct Inquiry
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Negotiate supply, transport, and delivery terms directly with the farmer.
            </p>

            {inquirySuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto animate-bounce" />
                <h4 className="font-bold text-slate-800 text-sm">Inquiry Sent Successfully!</h4>
                <p className="text-xs text-slate-500">
                  The farmer has received your request and phone notification.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Produce</span>
                    <strong className="text-slate-800 font-serif">{inquiryTargetCrop.name}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Farmer</span>
                    <strong className="text-slate-800">{inquiryTargetCrop.farmerName}</strong>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Required Quantity ({inquiryTargetCrop.unit}) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max={inquiryTargetCrop.quantity}
                    value={inquiryQty}
                    onChange={(e) => setInquiryQty(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 text-sm"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Available batch size: {inquiryTargetCrop.quantity} {inquiryTargetCrop.unit}
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Message & Delivery Conditions *
                  </label>
                  <textarea
                    rows={4}
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 text-sm leading-relaxed"
                  ></textarea>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setInquiryTargetCrop(null)}
                    className="flex-1 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inquirySubmitting}
                    className="flex-1 py-2 font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded shadow-sm disabled:opacity-50"
                  >
                    {inquirySubmitting ? 'Transmitting...' : 'Submit Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
