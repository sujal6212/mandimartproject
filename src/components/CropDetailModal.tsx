import React from 'react';
import { 
  X, 
  MapPin, 
  Star, 
  Phone, 
  CheckCircle2, 
  Send, 
  Truck, 
  Package, 
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { Crop } from '../types';
import { getAssetUrl } from '../utils/assets';

interface CropDetailModalProps {
  crop: Crop | null;
  onClose: () => void;
  onSendInquiryClick: (crop: Crop) => void;
}

export const CropDetailModal: React.FC<CropDetailModalProps> = ({
  crop,
  onClose,
  onSendInquiryClick,
}) => {
  if (!crop) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="relative bg-slate-50 border-b border-slate-200 p-6 flex flex-col sm:flex-row items-center gap-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>

          <img
            src={getAssetUrl(crop.imageUrl || (crop as any).image)}
            alt={crop.name}
            className="w-36 h-36 object-contain drop-shadow-md"
          />

          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="bg-amber-400 text-amber-950 text-xs font-bold px-2 py-0.5 rounded">
                Grade {crop.grade}
              </span>
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {crop.rating.toFixed(1)} Rating
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
              {crop.name}
            </h2>

            <div className="text-2xl font-bold text-emerald-800 font-sans">
              ₹{crop.expectedPrice.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-slate-500">/ {crop.unit}</span>
            </div>

            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Harvest Location: {crop.location}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-600">
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
              Harvest & Quality Description
            </h4>
            <p className="leading-relaxed">
              {crop.description}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Available Batch</span>
              <strong className="text-sm font-serif text-slate-900">{crop.quantity} {crop.unit}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Packaging</span>
              <strong className="text-sm font-serif text-slate-900">Jute Bags / Crates</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Dispatch Speed</span>
              <strong className="text-sm font-serif text-slate-900">Within 24 Hours</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">APMC Clearance</span>
              <strong className="text-sm font-serif text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Certified
              </strong>
            </div>
          </div>

          {/* Producer Contact Box */}
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-900">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 block">
                Verified Cultivator
              </span>
              <div className="font-bold text-sm">{crop.farmerName || 'Registered Producer'}</div>
              <div className="text-[11px] text-emerald-700 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" /> {crop.farmerPhone || '+91 98120 44321'}
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onSendInquiryClick(crop);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              Direct Purchase Inquiry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
