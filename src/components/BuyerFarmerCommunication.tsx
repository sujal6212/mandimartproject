import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User as UserIcon, 
  Wheat, 
  Tractor, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { Inquiry, User, Crop } from '../types';

interface BuyerFarmerCommunicationProps {
  inquiries: Inquiry[];
  currentUser: User | null;
  crops: Crop[];
  users: User[];
  onUpdateStatus: (inquiryId: number, status: 'accepted' | 'rejected') => Promise<boolean>;
  onSendNewInquiry: (cropId: number, farmerId: number, quantity: number, message: string) => Promise<boolean>;
  onOpenAuth: () => void;
}

export const BuyerFarmerCommunication: React.FC<BuyerFarmerCommunicationProps> = ({
  inquiries,
  currentUser,
  crops,
  users,
  onUpdateStatus,
  onSendNewInquiry,
  onOpenAuth,
}) => {
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(
    inquiries.length > 0 ? inquiries[0].id : null
  );
  const [replyMessage, setReplyMessage] = useState('');
  const [repliesState, setRepliesState] = useState<Record<number, { sender: string; text: string; time: string }[]>>({
    1: [
      { sender: 'Delhi Fresh Agro Wholesale', text: 'Namaste Ramesh ji, we have an order for 25 quintals of Sharbati Wheat. Can you dispatch to Azadpur Mandi by Thursday?', time: '10:30 AM' },
      { sender: 'Ramesh Kumar (Farmer)', text: 'Namaste Rajesh ji, yes 25 Quintal cleaned and moisture-tested batch is packed in 50kg gunny bags ready at Taraori farm.', time: '11:15 AM' }
    ],
    2: [
      { sender: 'Metro Supermarket Procurement', text: 'Sunita ji, we require 40 Quintals of Hybrid Red Tomatoes. Please confirm if cold chain transport can load at Gannaur?', time: 'Yesterday' }
    ]
  });

  // Filter inquiries
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const filteredInquiries = inquiries.filter(inq => {
    if (filterMode === 'all') return true;
    return inq.status === filterMode;
  });

  const activeInquiry = inquiries.find(i => i.id === selectedInquiryId) || inquiries[0];
  const activeCrop = activeInquiry ? crops.find(c => c.id === activeInquiry.cropId) : null;
  const activeFarmer = activeInquiry ? users.find(u => u.id === activeInquiry.farmerId) : null;
  const activeBuyer = activeInquiry ? users.find(u => u.id === activeInquiry.buyerId) : null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeInquiry) return;

    const senderName = currentUser ? currentUser.name : 'Participant';
    const newReply = {
      sender: senderName,
      text: replyMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setRepliesState(prev => ({
      ...prev,
      [activeInquiry.id]: [...(prev[activeInquiry.id] || []), newReply]
    }));

    setReplyMessage('');
  };

  const handleAction = async (inquiryId: number, status: 'accepted' | 'rejected') => {
    await onUpdateStatus(inquiryId, status);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner explaining this College Architecture module */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 text-white rounded-2xl p-6 shadow-sm border border-emerald-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-amber-400 text-dark fw-bold px-2.5 py-1 rounded-pill text-xs">
                Backend Server Feature
              </span>
              <span className="text-emerald-300 text-xs">
                Direct Buyer-Farmer Communication System
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif">Buyer ⇄ Farmer Negotiation & Inquiries</h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
              Eliminating intermediary broker commissions. Institutional buyers send direct purchase inquiries, negotiate harvest batches, and farmers approve or counter terms in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!currentUser ? (
              <button
                onClick={onOpenAuth}
                className="btn btn-warning btn-sm fw-bold px-3 py-2 rounded-pill shadow-sm"
              >
                Log In to Respond
              </button>
            ) : (
              <div className="bg-white/10 px-3 py-2 rounded-xl text-xs backdrop-blur-xs border border-white/20">
                <span className="text-emerald-300">Signed in as: </span>
                <strong className="text-white">{currentUser.name}</strong>
                <span className="ml-1 uppercase text-[10px] bg-emerald-600 px-1.5 py-0.5 rounded text-white font-bold">
                  {currentUser.role}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Layout: Left List of Inquiries, Right Live Discussion & Deal Controls */}
      <div className="row g-4">
        {/* Left Column: Inquiry Threads */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden h-100">
            <div className="card-header bg-white border-bottom p-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold mb-0 text-success d-flex align-items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Trade Inquiries ({inquiries.length})</span>
                </h6>
              </div>

              {/* Status Filter Tabs */}
              <div className="btn-group btn-group-sm w-100">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`btn ${filterMode === 'all' ? 'btn-success' : 'btn-outline-secondary'}`}
                >
                  All ({inquiries.length})
                </button>
                <button
                  onClick={() => setFilterMode('pending')}
                  className={`btn ${filterMode === 'pending' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterMode('accepted')}
                  className={`btn ${filterMode === 'accepted' ? 'btn-success' : 'btn-outline-secondary'}`}
                >
                  Accepted
                </button>
              </div>
            </div>

            <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: '600px' }}>
              {filteredInquiries.length === 0 ? (
                <div className="p-4 text-center text-muted small">
                  No inquiries found under this filter.
                </div>
              ) : (
                filteredInquiries.map(inq => {
                  const isSelected = inq.id === activeInquiry?.id;
                  const crop = crops.find(c => c.id === inq.cropId);
                  return (
                    <button
                      key={inq.id}
                      onClick={() => setSelectedInquiryId(inq.id)}
                      className={`list-group-item list-group-item-action text-start p-3 border-bottom transition-colors ${
                        isSelected ? 'bg-light border-start border-4 border-success' : ''
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <strong className="text-dark small d-flex align-items-center gap-1">
                          <Wheat className="w-3.5 h-3.5 text-warning" />
                          {crop?.name || `Crop #${inq.cropId}`}
                        </strong>
                        <span className={`badge rounded-pill text-[10px] ${
                          inq.status === 'accepted' ? 'bg-success' :
                          inq.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'
                        }`}>
                          {inq.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-muted small mb-1">
                        <strong>Buyer:</strong> {inq.buyerName || 'Verified Institutional Buyer'}
                      </div>

                      <div className="text-dark small text-truncate">
                        "{inq.message}"
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-2 text-[11px] text-muted">
                        <span>Quantity: <strong>{inq.quantity} Qtl</strong></span>
                        <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Thread Details & Interactive Chat */}
        <div className="col-lg-8">
          {activeInquiry ? (
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden h-100">
              {/* Header with Crop & Counterparty Info */}
              <div className="card-header bg-light border-bottom p-4">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div>
                    <span className="badge bg-success rounded-pill px-2.5 py-1 mb-1">
                      Inquiry #{activeInquiry.id}
                    </span>
                    <h5 className="fw-bold mb-0 text-dark">
                      {activeCrop?.name || 'Produce Lot'} – Bulk Procurement Offer
                    </h5>
                    <div className="text-muted small mt-1 d-flex flex-wrap items-center gap-3">
                      <span><Wheat className="w-3.5 h-3.5 inline text-success me-1" />Lot Expected Price: ₹{activeCrop?.expectedPrice || 2200}/Qtl</span>
                      <span><MapPin className="w-3.5 h-3.5 inline text-danger me-1" />{activeCrop?.location || 'Haryana'}</span>
                      <span><Clock className="w-3.5 h-3.5 inline text-secondary me-1" />Sent: {new Date(activeInquiry.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Accept / Reject actions */}
                  <div className="d-flex gap-2">
                    {activeInquiry.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAction(activeInquiry.id, 'accepted')}
                          className="btn btn-success btn-sm px-3 fw-bold rounded-pill d-flex align-items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept Offer
                        </button>
                        <button
                          onClick={() => handleAction(activeInquiry.id, 'rejected')}
                          className="btn btn-outline-danger btn-sm px-3 rounded-pill d-flex align-items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          Decline
                        </button>
                      </>
                    ) : (
                      <span className={`badge px-3 py-2 rounded-pill fs-6 ${
                        activeInquiry.status === 'accepted' ? 'bg-success' : 'bg-danger'
                      }`}>
                        Offer {activeInquiry.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Counterparty Cards */}
                <div className="row g-2 mt-3 pt-3 border-top">
                  <div className="col-sm-6">
                    <div className="p-2.5 rounded-3 bg-white border small">
                      <div className="fw-bold text-success d-flex align-items-center gap-1">
                        <Tractor className="w-3.5 h-3.5" /> Cultivator (Farmer)
                      </div>
                      <div className="text-dark fw-semibold mt-1">
                        {activeFarmer?.name || activeInquiry.farmerName || 'Ramesh Kumar'}
                      </div>
                      <div className="text-muted text-[11px]">
                        {activeFarmer?.village ? `${activeFarmer.village}, ` : ''}{activeFarmer?.district || 'Karnal'}, {activeFarmer?.state || 'Haryana'}
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-2.5 rounded-3 bg-white border small">
                      <div className="fw-bold text-primary d-flex align-items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> Wholesale Buyer
                      </div>
                      <div className="text-dark fw-semibold mt-1">
                        {activeBuyer?.name || activeInquiry.buyerName || 'Delhi Fresh Agro Wholesale'}
                      </div>
                      <div className="text-muted text-[11px]">
                        {activeBuyer?.businessType || 'Institutional Wholesaler'} • {activeBuyer?.district || 'Delhi'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Body */}
              <div className="card-body p-4 bg-white overflow-auto" style={{ minHeight: '280px', maxHeight: '380px' }}>
                <div className="space-y-3">
                  {/* Initial Inquiry Box */}
                  <div className="p-3 rounded-3 bg-emerald-50 border border-emerald-200">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold text-emerald-900 small">
                        {activeInquiry.buyerName || 'Buyer'} (Initial Procurement Request)
                      </span>
                      <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill text-[10px]">
                        Requested: {activeInquiry.quantity} Quintals
                      </span>
                    </div>
                    <p className="text-dark small mb-0">
                      "{activeInquiry.message}"
                    </p>
                  </div>

                  {/* Thread Replies */}
                  {(repliesState[activeInquiry.id] || []).map((msg, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-3 border small ${
                        msg.sender.toLowerCase().includes('farmer')
                          ? 'bg-amber-50/60 border-amber-200 ms-4'
                          : 'bg-slate-50 border-slate-200 me-4'
                      }`}
                    >
                      <div className="d-flex justify-content-between text-[11px] text-muted mb-1">
                        <strong>{msg.sender}</strong>
                        <span>{msg.time}</span>
                      </div>
                      <div className="text-dark">{msg.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Input Footer */}
              <div className="card-footer bg-light border-top p-3">
                <form onSubmit={handleSendReply} className="d-flex gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type counter-offer, delivery date, transport details..."
                    className="form-control form-control-sm rounded-pill px-3"
                  />
                  <button
                    type="submit"
                    className="btn btn-success btn-sm rounded-pill px-4 fw-bold d-flex align-items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Reply
                  </button>
                </form>
                <div className="text-muted text-[11px] mt-2 text-center">
                  Live MySQL table: <code className="bg-white px-1.5 py-0.5 rounded border text-success">inquiries (id, buyer_id, farmer_id, crop_id, quantity, status)</code>
                </div>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm border-0 rounded-4 p-5 text-center text-muted">
              <MessageSquare className="w-12 h-12 mx-auto text-muted mb-3 opacity-40" />
              <h6>Select an inquiry from the left to start communicating</h6>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
