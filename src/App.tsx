import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Marketplace } from './components/Marketplace';
import { Auctions } from './components/Auctions';
import { MandiPrices } from './components/MandiPrices';
import { AiVisionLab } from './components/AiVisionLab';
import { FarmerDashboard } from './components/FarmerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { BackendHub } from './components/BackendHub';
import { DatabaseExplorer } from './components/DatabaseExplorer';
import { BuyerFarmerCommunication } from './components/BuyerFarmerCommunication';
import { AuthModal } from './components/AuthModal';
import { AiChatbotModal } from './components/AiChatbotModal';
import { CropDetailModal } from './components/CropDetailModal';
import { Crop, Auction, Mandi, MandiPrice, Notification, User, Bid, Inquiry } from './types';
import { Sprout, Download, ShieldCheck, Server, Database, Code2, Tractor, Building2, MessageSquare, TrendingUp } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('marketplace');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Entity Data
  const [crops, setCrops] = useState<Crop[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [mandis, setMandis] = useState<Mandi[]>([]);
  const [mandiPrices, setMandiPrices] = useState<MandiPrice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Modals
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [detailCrop, setDetailCrop] = useState<Crop | null>(null);

  // Initial Data Fetching
  const refreshAllData = async () => {
    try {
      const [cropsRes, auctionsRes, mandisRes, pricesRes, statsRes, notifRes] = await Promise.all([
        fetch('/api/crops').then(r => r.json()),
        fetch('/api/auctions').then(r => r.json()),
        fetch('/api/mandis').then(r => r.json()),
        fetch('/api/mandi-prices').then(r => r.json()),
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/notifications').then(r => r.json()),
      ]);

      if (cropsRes.success) setCrops(cropsRes.data);
      if (auctionsRes.success) setAuctions(auctionsRes.data);
      if (mandisRes.success) setMandis(mandisRes.data);
      if (pricesRes.success) setMandiPrices(pricesRes.data);
      if (statsRes.success) setStats(statsRes.data);
      if (notifRes.success) setNotifications(notifRes.data);

      // Default demo personas
      const usersRes = await fetch('/api/users').catch(() => null);
      if (usersRes && usersRes.ok) {
        const udata = await usersRes.json();
        if (udata.success && udata.data.length > 0) {
          setAvailableUsers(udata.data);
          // Default to farmer Ramesh Kumar or first user
          if (!currentUser) {
            const farmer = udata.data.find((u: User) => u.role === 'farmer');
            setCurrentUser(farmer || udata.data[0]);
          }
        }
      }

      // Fetch inquiries if user logged in
      const inqRes = await fetch('/api/inquiries').catch(() => null);
      if (inqRes && inqRes.ok) {
        const idata = await inqRes.json();
        if (idata.success) setInquiries(idata.data);
      }
    } catch (err) {
      console.error('Data sync error:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Handlers
  const handlePlaceBid = async (auctionId: number, amount: number) => {
    try {
      const res = await fetch(`/api/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: currentUser?.id || 2,
          amount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh auctions and notifications
        const [aRes, nRes] = await Promise.all([
          fetch('/api/auctions').then(r => r.json()),
          fetch('/api/notifications').then(r => r.json()),
        ]);
        if (aRes.success) setAuctions(aRes.data);
        if (nRes.success) setNotifications(nRes.data);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const handleCreateAuction = async (auctionData: Partial<Auction>) => {
    try {
      const res = await fetch('/api/auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...auctionData,
          farmerId: currentUser?.id || 1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const aRes = await fetch('/api/auctions').then(r => r.json());
        if (aRes.success) setAuctions(aRes.data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const fetchAuctionBids = async (auctionId: number): Promise<Bid[]> => {
    try {
      const res = await fetch(`/api/auctions/${auctionId}`);
      const data = await res.json();
      if (data.success && data.data?.bids) {
        return data.data.bids;
      }
      return [];
    } catch {
      return [];
    }
  };

  const handleAddCrop = async (cropData: Partial<Crop>) => {
    try {
      const res = await fetch('/api/crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cropData),
      });
      const data = await res.json();
      if (data.success) {
        const cRes = await fetch('/api/crops').then(r => r.json());
        if (cRes.success) setCrops(cRes.data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleDeleteCrop = async (cropId: number) => {
    try {
      const res = await fetch(`/api/crops/${cropId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCrops(crops.filter(c => c.id !== cropId));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleSendInquiry = async (cropId: number, farmerId: number, quantity: number, message: string) => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropId,
          farmerId,
          buyerId: currentUser?.id || 2,
          quantity,
          message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const inqRes = await fetch('/api/inquiries').then(r => r.json());
        if (inqRes.success) setInquiries(inqRes.data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId: number, status: 'accepted' | 'rejected') => {
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(inquiries.map(i => i.id === inquiryId ? { ...i, status } : i));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleAddMandiPrice = async (priceData: Partial<MandiPrice>) => {
    try {
      const res = await fetch('/api/mandi-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(priceData),
      });
      const data = await res.json();
      if (data.success) {
        const pRes = await fetch('/api/mandi-prices').then(r => r.json());
        if (pRes.success) setMandiPrices(pRes.data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id || 1 }),
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Safe farmer object fallback if user visits farmer-portal while guest
  const activeFarmerUser = (currentUser?.role === 'farmer' ? currentUser : availableUsers.find(u => u.role === 'farmer')) || {
    id: 1,
    name: 'Ramesh Kumar',
    email: 'ramesh.farmer@mandimart.in',
    phone: '9876543210',
    role: 'farmer' as const,
    district: 'Karnal',
    state: 'Haryana',
    village: 'Taraori',
    pincode: '132116',
    address: 'VPO Taraori',
    createdAt: '2026-08-10 09:30:00'
  };

  return (
    <div className="min-h-screen bg-[#F8FAF6] text-[#1B3022] flex flex-col font-sans">
      {/* Universal Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        availableUsers={availableUsers}
        notifications={notifications}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Navigation Quick Bar for Mobile / Tablet */}
        <div className="lg:hidden mb-4 overflow-x-auto pb-2 flex items-center gap-1 text-xs">
          <button
            onClick={() => setCurrentView('marketplace')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium ${
              currentView === 'marketplace' ? 'bg-emerald-800 text-white' : 'bg-white border text-slate-700'
            }`}
          >
            Buyer Marketplace
          </button>
          <button
            onClick={() => setCurrentView('farmer-portal')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium ${
              currentView === 'farmer-portal' ? 'bg-emerald-800 text-white' : 'bg-white border text-slate-700'
            }`}
          >
            Farmer Portal
          </button>
          <button
            onClick={() => setCurrentView('communication')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium ${
              currentView === 'communication' ? 'bg-emerald-800 text-white' : 'bg-white border text-slate-700'
            }`}
          >
            Buyer-Farmer Chat
          </button>
          <button
            onClick={() => setCurrentView('backend-hub')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium ${
              currentView === 'backend-hub' ? 'bg-amber-400 text-amber-950 font-bold' : 'bg-white border text-slate-700'
            }`}
          >
            Backend (PHP/Python)
          </button>
          <button
            onClick={() => setCurrentView('database')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium ${
              currentView === 'database' ? 'bg-emerald-800 text-white' : 'bg-white border text-slate-700'
            }`}
          >
            Database (MySQL)
          </button>
        </div>

        {/* View 1: Buyer Marketplace */}
        {currentView === 'marketplace' && (
          <Marketplace
            crops={crops}
            onSelectCropForDetails={(crop) => setDetailCrop(crop)}
            onSendInquiry={handleSendInquiry}
            currentUser={currentUser}
            onNavigateToAuctions={() => setCurrentView('auctions')}
            onNavigateToAiVision={() => setCurrentView('ai-vision')}
          />
        )}

        {/* View 2: Farmer Portal */}
        {currentView === 'farmer-portal' && (
          <FarmerDashboard
            currentUser={activeFarmerUser}
            crops={crops}
            inquiries={inquiries}
            onAddCrop={handleAddCrop}
            onDeleteCrop={handleDeleteCrop}
            onUpdateInquiryStatus={handleUpdateInquiryStatus}
          />
        )}

        {/* View 3: Buyer-Farmer Communication Center */}
        {currentView === 'communication' && (
          <BuyerFarmerCommunication
            inquiries={inquiries}
            currentUser={currentUser}
            crops={crops}
            users={availableUsers}
            onUpdateStatus={handleUpdateInquiryStatus}
            onSendNewInquiry={handleSendInquiry}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {/* View 4: Mandi Benchmark Rates & Distances */}
        {currentView === 'mandi-prices' && (
          <MandiPrices
            mandis={mandis}
            prices={mandiPrices}
          />
        )}

        {/* View 5: Backend (Server Side) Hub - PHP & Python */}
        {currentView === 'backend-hub' && (
          <BackendHub />
        )}

        {/* View 6: Database (MySQL) Explorer */}
        {currentView === 'database' && (
          <DatabaseExplorer
            users={availableUsers}
            crops={crops}
            prices={mandiPrices}
            mandis={mandis}
            inquiries={inquiries}
          />
        )}

        {/* View 7: Live Auctions */}
        {currentView === 'auctions' && (
          <Auctions
            auctions={auctions}
            currentUser={currentUser}
            onPlaceBid={handlePlaceBid}
            onCreateAuction={handleCreateAuction}
            fetchAuctionBids={fetchAuctionBids}
          />
        )}

        {/* View 8: AI Quality Lab */}
        {currentView === 'ai-vision' && (
          <AiVisionLab />
        )}

        {/* View 9: Admin Panel */}
        {currentView === 'admin-panel' && (
          <AdminDashboard
            stats={stats}
            users={availableUsers}
            crops={crops}
            mandis={mandis}
            prices={mandiPrices}
            onAddMandiPrice={handleAddMandiPrice}
            onDeleteCrop={handleDeleteCrop}
          />
        )}
      </main>

      {/* Produce Detail Modal */}
      <CropDetailModal
        crop={detailCrop}
        onClose={() => setDetailCrop(null)}
        onSendInquiryClick={(crop) => {
          setCurrentView('marketplace');
        }}
      />

      {/* AI Agricultural Assistant Modal */}
      <AiChatbotModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Farmer & Buyer Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
        availableUsers={availableUsers}
      />

      {/* Footer */}
      <footer className="bg-[#143D28] text-white border-t border-[#1E5638] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-amber-400 text-amber-950 flex items-center justify-center font-bold">
                  <Sprout className="w-5 h-5" />
                </div>
                <span className="font-serif font-bold text-base tracking-tight">MandiMart</span>
              </div>
              <p className="text-emerald-200/80 leading-relaxed">
                National agricultural direct exchange connecting farmers directly with institutional buyers, backed by Bootstrap responsive design, PHP/Python backend, and MySQL database.
              </p>
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>APMC Verified & Regulated Market Data</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
                Frontend (Website Design)
              </h4>
              <ul className="space-y-2 text-emerald-200/80">
                <li><button onClick={() => setCurrentView('marketplace')} className="hover:text-white">🛒 Buyer Marketplace (HTML/CSS/JS)</button></li>
                <li><button onClick={() => setCurrentView('farmer-portal')} className="hover:text-white">🌾 Farmer Portal (Bootstrap Responsive)</button></li>
                <li><button onClick={() => setCurrentView('communication')} className="hover:text-white">💬 Buyer-Farmer Negotiation</button></li>
                <li><button onClick={() => setCurrentView('mandi-prices')} className="hover:text-white">📊 Mandi Rates & Index</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
                Backend & Database
              </h4>
              <ul className="space-y-2 text-emerald-200/80">
                <li><button onClick={() => setCurrentView('backend-hub')} className="hover:text-white">⚙️ PHP Backend (Simple & Beginner-friendly)</button></li>
                <li><button onClick={() => setCurrentView('backend-hub')} className="hover:text-white">🐍 Python Backend (Flask Microservice)</button></li>
                <li><button onClick={() => setCurrentView('database')} className="hover:text-white">🗄️ MySQL Database (Farmers, Buyers, Crops)</button></li>
                <li><button onClick={() => setIsAuthOpen(true)} className="hover:text-white">🔑 Login & Session Auth System</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
                Academic & Submission Package
              </h4>
              <p className="text-emerald-200/80 mb-3 leading-relaxed">
                Complete multi-tier project archive with HTML, CSS, JavaScript, Bootstrap, PHP, Python Flask, and MySQL schema dump.
              </p>
              <a
                href="/api/export/zip"
                download
                className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold px-3 py-2 rounded text-xs transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download mandimart-project.zip
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300/80">
            <div>
              © 2026 MandiMart Agricultural Exchange. All rights reserved.
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="badge bg-emerald-900 border border-emerald-700 text-emerald-200">HTML5 + CSS3 + JS</span>
              <span className="badge bg-emerald-900 border border-emerald-700 text-emerald-200">Bootstrap 5</span>
              <span className="badge bg-emerald-900 border border-emerald-700 text-emerald-200">PHP 8 / Python</span>
              <span className="badge bg-emerald-900 border border-emerald-700 text-emerald-200">MySQL DB</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
