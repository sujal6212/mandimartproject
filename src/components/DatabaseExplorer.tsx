import React, { useState } from 'react';
import { 
  Database, 
  Table, 
  Terminal, 
  Download, 
  Search, 
  Key, 
  Layers, 
  Play, 
  Check, 
  Copy,
  Tractor,
  Building2,
  Wheat,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { User, Crop, MandiPrice, Inquiry, Mandi } from '../types';

interface DatabaseExplorerProps {
  users: User[];
  crops: Crop[];
  prices: MandiPrice[];
  mandis: Mandi[];
  inquiries: Inquiry[];
}

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({
  users,
  crops,
  prices,
  mandis,
  inquiries,
}) => {
  const [activeTable, setActiveTable] = useState<'farmers' | 'buyers' | 'crops' | 'mandi_prices' | 'inquiries'>('farmers');
  const [searchTerm, setSearchTerm] = useState('');
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM crops WHERE grade = 'A+' ORDER BY expected_price ASC;");
  const [queryResults, setQueryResults] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  const farmers = users.filter(u => u.role === 'farmer');
  const buyers = users.filter(u => u.role === 'buyer');

  // Quick preset queries for college project evaluation / viva
  const sampleQueries = [
    { label: 'All Registered Farmers', query: "SELECT id, name, phone, village, district, state FROM users WHERE role = 'farmer';" },
    { label: 'All Registered Buyers', query: "SELECT id, name, business_type, contact_person, phone, district FROM users WHERE role = 'buyer';" },
    { label: 'Crops with Farmer Names (JOIN)', query: "SELECT c.id, c.name, c.grade, c.expected_price, u.name AS farmer_name FROM crops c JOIN users u ON c.farmer_id = u.id;" },
    { label: 'Average Mandi Rates by Crop', query: "SELECT crop_name, AVG(average_price) AS modal_avg FROM mandi_prices GROUP BY crop_name;" },
    { label: 'Buyer-Farmer Inquiries (JOIN)', query: "SELECT i.id, b.name AS buyer, f.name AS farmer, c.name AS crop, i.quantity, i.status FROM inquiries i JOIN users b ON i.buyer_id = b.id JOIN users f ON i.farmer_id = f.id JOIN crops c ON i.crop_id = c.id;" },
  ];

  const handleExecuteQuery = () => {
    setQueryError('');
    const q = sqlQuery.trim().toLowerCase();

    try {
      if (q.includes('from users') && q.includes("role = 'farmer'")) {
        setQueryResults(farmers.map(f => ({
          id: f.id,
          name: f.name,
          phone: f.phone,
          village: f.village || 'N/A',
          district: f.district,
          state: f.state
        })));
      } else if (q.includes('from users') && q.includes("role = 'buyer'")) {
        setQueryResults(buyers.map(b => ({
          id: b.id,
          name: b.name,
          business_type: b.businessType || 'Wholesaler',
          contact_person: b.contactPerson || b.name,
          phone: b.phone,
          district: b.district
        })));
      } else if (q.includes('join') && q.includes('crops') && q.includes('users')) {
        setQueryResults(crops.map(c => {
          const farmer = users.find(u => u.id === c.farmerId);
          return {
            crop_id: c.id,
            crop_name: c.name,
            grade: c.grade,
            price_per_qtl: `₹${c.expectedPrice}`,
            farmer_name: farmer?.name || c.farmerName || 'Farmer'
          };
        }));
      } else if (q.includes('mandi_prices') && (q.includes('avg') || q.includes('group by'))) {
        const cropGroups: Record<string, number[]> = {};
        prices.forEach(p => {
          if (!cropGroups[p.cropName]) cropGroups[p.cropName] = [];
          cropGroups[p.cropName].push(p.averagePrice);
        });
        const rows = Object.entries(cropGroups).map(([cName, vals]) => ({
          crop_name: cName,
          average_modal_rate: `₹${Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)}/Qtl`,
          data_points: vals.length
        }));
        setQueryResults(rows);
      } else if (q.includes('inquiries')) {
        setQueryResults(inquiries.map(i => {
          const b = users.find(u => u.id === i.buyerId);
          const f = users.find(u => u.id === i.farmerId);
          const c = crops.find(cr => cr.id === i.cropId);
          return {
            inquiry_id: i.id,
            buyer_name: b?.name || i.buyerName || 'Buyer',
            farmer_name: f?.name || i.farmerName || 'Farmer',
            crop: c?.name || `Crop #${i.cropId}`,
            quantity_qtl: i.quantity,
            status: i.status.toUpperCase()
          };
        }));
      } else if (q.includes('from crops')) {
        let res = [...crops];
        if (q.includes("grade = 'a+'")) res = res.filter(c => c.grade === 'A+');
        setQueryResults(res.map(c => ({
          id: c.id,
          name: c.name,
          quantity: `${c.quantity} ${c.unit}`,
          grade: c.grade,
          expected_price: `₹${c.expectedPrice}`,
          location: c.location,
          status: c.status
        })));
      } else {
        // Fallback generic demo table
        setQueryResults(crops.slice(0, 5).map(c => ({
          id: c.id,
          name: c.name,
          grade: c.grade,
          expected_price: c.expectedPrice,
          status: c.status
        })));
      }
    } catch (err: any) {
      setQueryError('Query parse error: ' + err.message);
    }
  };

  const handleCopySqlFile = () => {
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-emerald-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-amber-400 text-slate-950 fw-bold px-2.5 py-1 rounded-pill text-xs">
                Relational Database
              </span>
              <span className="text-emerald-300 text-xs">
                MySQL (Recommended for College Projects)
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif">MySQL Database & Relational Schema Explorer</h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Stores farmer details, buyer details, crop information, and mandi benchmark prices. Fully normalized tables with InnoDB engine and foreign key constraints.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/export/zip"
              download
              className="btn btn-warning btn-sm fw-bold px-3 py-2 rounded-pill shadow-sm d-flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Download mandimart.sql
            </a>
          </div>
        </div>

        {/* 4 Core Entities Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-800/60 text-xs">
          <button
            onClick={() => setActiveTable('farmers')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTable === 'farmers'
                ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1"><Tractor className="w-3.5 h-3.5 text-emerald-400" /> Farmers</span>
              <span className="badge bg-emerald-700">{farmers.length} rows</span>
            </div>
            <div className="text-[11px] text-slate-400 font-normal">Table: users (role='farmer')</div>
          </button>

          <button
            onClick={() => setActiveTable('buyers')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTable === 'buyers'
                ? 'bg-blue-500/20 border-blue-400 text-white font-bold'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-blue-400" /> Buyers</span>
              <span className="badge bg-blue-700">{buyers.length} rows</span>
            </div>
            <div className="text-[11px] text-slate-400 font-normal">Table: users (role='buyer')</div>
          </button>

          <button
            onClick={() => setActiveTable('crops')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTable === 'crops'
                ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1"><Wheat className="w-3.5 h-3.5 text-amber-400" /> Crops</span>
              <span className="badge bg-amber-700">{crops.length} rows</span>
            </div>
            <div className="text-[11px] text-slate-400 font-normal">Table: crops (harvest info)</div>
          </button>

          <button
            onClick={() => setActiveTable('mandi_prices')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTable === 'mandi_prices'
                ? 'bg-green-500/20 border-green-400 text-white font-bold'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-green-400" /> Mandi Rates</span>
              <span className="badge bg-green-700">{prices.length} rows</span>
            </div>
            <div className="text-[11px] text-slate-400 font-normal">Table: mandi_prices</div>
          </button>
        </div>
      </div>

      {/* Interactive SQL Query Simulator Console */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-slate-900 text-white p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="fw-bold mb-0 d-flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>Interactive SQL Query Console (College Viva & Evaluation Simulator)</span>
            </h6>
            <span className="badge bg-slate-800 text-emerald-400 font-mono text-[11px]">
              MySQL 8.0 / InnoDB
            </span>
          </div>

          {/* Quick preset queries */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            <span className="text-slate-400 text-xs self-center">Sample Queries:</span>
            {sampleQueries.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSqlQuery(item.query);
                  setQueryResults(null);
                }}
                className="badge bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded-pill text-[11px] font-normal transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="form-control form-control-sm font-mono text-emerald-300 bg-slate-950 border-slate-700 text-xs"
              placeholder="Write SQL query, e.g. SELECT * FROM crops;"
            />
            <button
              onClick={handleExecuteQuery}
              className="btn btn-warning btn-sm px-4 fw-bold rounded-pill text-dark d-flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Query
            </button>
          </div>
        </div>

        {/* Query Results Box */}
        {queryResults && (
          <div className="p-4 bg-slate-50 border-bottom">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong className="text-dark small">
                Query Result ({queryResults.length} records returned):
              </strong>
            </div>
            <div className="table-responsive rounded-3 border bg-white shadow-xs">
              <table className="table table-sm table-striped table-hover mb-0 text-xs font-mono">
                <thead className="table-light text-slate-600">
                  <tr>
                    {Object.keys(queryResults[0] || {}).map((col) => (
                      <th key={col} className="p-2">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryResults.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} className="p-2">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Table Data Viewers */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-white border-bottom p-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <Table className="w-4 h-4 text-emerald-600" />
              <span>
                {activeTable === 'farmers' && 'Table: users (Farmer Details)'}
                {activeTable === 'buyers' && 'Table: users (Buyer Details)'}
                {activeTable === 'crops' && 'Table: crops (Crop Information)'}
                {activeTable === 'mandi_prices' && 'Table: mandi_prices (Benchmark Prices)'}
                {activeTable === 'inquiries' && 'Table: inquiries (Buyer-Farmer Communication)'}
              </span>
            </h5>
            <p className="text-muted text-xs mb-0">
              Primary Key, Foreign Keys, and Columns as defined in <code className="text-emerald-700">mandimart.sql</code>
            </p>
          </div>

          {/* Quick Search inside Table */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search table rows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control form-control-sm rounded-pill ps-4 pe-3 text-xs"
            />
          </div>
        </div>

        <div className="table-responsive">
          {activeTable === 'farmers' && (
            <table className="table table-hover table-striped mb-0 text-xs">
              <thead className="table-light">
                <tr>
                  <th><Key className="w-3 h-3 inline text-warning me-1" />ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Village</th>
                  <th>District</th>
                  <th>State</th>
                  <th>Pincode</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {farmers
                  .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.district.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(f => (
                    <tr key={f.id}>
                      <td className="fw-bold">{f.id}</td>
                      <td className="fw-semibold text-dark">{f.name}</td>
                      <td>{f.phone}</td>
                      <td>{f.village || 'N/A'}</td>
                      <td>{f.district}</td>
                      <td>{f.state}</td>
                      <td>{f.pincode}</td>
                      <td><span className="badge bg-success-subtle text-success border border-success-subtle">FARMER</span></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeTable === 'buyers' && (
            <table className="table table-hover table-striped mb-0 text-xs">
              <thead className="table-light">
                <tr>
                  <th><Key className="w-3 h-3 inline text-warning me-1" />ID</th>
                  <th>Company / Business Name</th>
                  <th>Contact Person</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>District / State</th>
                  <th>Business Category</th>
                </tr>
              </thead>
              <tbody>
                {buyers
                  .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()) || (b.businessType && b.businessType.toLowerCase().includes(searchTerm.toLowerCase())))
                  .map(b => (
                    <tr key={b.id}>
                      <td className="fw-bold">{b.id}</td>
                      <td className="fw-semibold text-dark">{b.name}</td>
                      <td>{b.contactPerson || 'Rajesh Gupta'}</td>
                      <td>{b.phone}</td>
                      <td>{b.email}</td>
                      <td>{b.district}, {b.state}</td>
                      <td><span className="badge bg-primary-subtle text-primary border border-primary-subtle">{b.businessType || 'Wholesaler'}</span></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeTable === 'crops' && (
            <table className="table table-hover table-striped mb-0 text-xs">
              <thead className="table-light">
                <tr>
                  <th><Key className="w-3 h-3 inline text-warning me-1" />ID</th>
                  <th>Farmer ID</th>
                  <th>Crop Name</th>
                  <th>Grade</th>
                  <th>Quantity</th>
                  <th>Price / Qtl</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {crops
                  .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.location.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(c => (
                    <tr key={c.id}>
                      <td className="fw-bold">{c.id}</td>
                      <td><span className="badge bg-secondary">Farmer #{c.farmerId}</span></td>
                      <td className="fw-semibold text-dark">{c.name}</td>
                      <td>
                        <span className={`badge ${c.grade.startsWith('A') ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {c.grade}
                        </span>
                      </td>
                      <td>{c.quantity} {c.unit}</td>
                      <td className="fw-bold text-success">₹{c.expectedPrice}</td>
                      <td>{c.location}</td>
                      <td><span className="badge bg-success-subtle text-success">{c.status}</span></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeTable === 'mandi_prices' && (
            <table className="table table-hover table-striped mb-0 text-xs">
              <thead className="table-light">
                <tr>
                  <th><Key className="w-3 h-3 inline text-warning me-1" />ID</th>
                  <th>Mandi Yard</th>
                  <th>Crop Name</th>
                  <th>Min Price</th>
                  <th>Max Price</th>
                  <th>Modal / Avg Price</th>
                  <th>Trend</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {prices
                  .filter(p => p.cropName.toLowerCase().includes(searchTerm.toLowerCase()) || (p.mandiName || '').toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(p => (
                    <tr key={p.id}>
                      <td className="fw-bold">{p.id}</td>
                      <td className="fw-semibold text-dark">{p.mandiName}</td>
                      <td>{p.cropName}</td>
                      <td>₹{p.minPrice}</td>
                      <td>₹{p.maxPrice}</td>
                      <td className="fw-bold text-success">₹{p.averagePrice}</td>
                      <td>
                        <span className={`badge ${p.trend === 'up' ? 'bg-success' : p.trend === 'down' ? 'bg-danger' : 'bg-secondary'}`}>
                          {p.trend.toUpperCase()}
                        </span>
                      </td>
                      <td>{p.priceDate}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
