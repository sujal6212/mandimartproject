import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  Compass, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  AlertTriangle, 
  Navigation, 
  ExternalLink,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Mandi, MandiPrice } from '../types';

interface MandiPricesProps {
  mandis: Mandi[];
  prices: MandiPrice[];
}

export const MandiPrices: React.FC<MandiPricesProps> = ({ mandis, prices }) => {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoStatusMsg, setGeoStatusMsg] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState('all');
  const [searchMandi, setSearchMandi] = useState('');

  // Haversine formula to compute great-circle distance between two coordinates in km
  const calculateHaversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  const handleDetectLocation = () => {
    setGeoLoading(true);
    setGeoStatusMsg('Requesting browser GPS coordinates...');

    if (!navigator.geolocation) {
      setGeoLoading(false);
      setGeoStatusMsg('Geolocation is not supported by your browser. Please use the region filter below.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserCoords(coords);
        setGeoLoading(false);
        setGeoStatusMsg(`Location detected (${coords.lat.toFixed(3)}°N, ${coords.lng.toFixed(3)}°E). Mandis sorted by closest road distance.`);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoStatusMsg('Location permission was denied. You can filter by state or search mandis below.');
        } else {
          setGeoStatusMsg('Could not detect location. Please use the regional filters.');
        }
      },
      { timeout: 10000 }
    );
  };

  // Filter prices by selected crop
  const filteredPrices = prices.filter(p => p.cropName.toLowerCase().includes(selectedCrop.toLowerCase()));

  // Compute distances for all mandis if user coordinates are known
  const processedMandis = mandis.map(m => {
    if (userCoords) {
      const distance = calculateHaversine(userCoords.lat, userCoords.lng, m.latitude, m.longitude);
      return { ...m, distanceKm: distance };
    }
    return m;
  });

  // Sort mandis: nearest first if coords available, else alphabetical
  const sortedMandis = [...processedMandis]
    .filter(m => {
      const matchState = stateFilter === 'all' || m.state.toLowerCase() === stateFilter.toLowerCase();
      const matchSearch = !searchMandi || m.name.toLowerCase().includes(searchMandi.toLowerCase()) || m.location.toLowerCase().includes(searchMandi.toLowerCase());
      return matchState && matchSearch;
    })
    .sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      return a.name.localeCompare(b.name);
    });

  // Max price for visual bar scale
  const maxAveragePrice = Math.max(...filteredPrices.map(p => p.averagePrice), 1);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 flex items-center justify-between gap-3 text-amber-900 shadow-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold">Demo Data – Not Live Market Prices:</span> Benchmark rates shown reflect recent sample trading averages across northern wholesale APMC yards for planning and analysis.
          </div>
        </div>
      </div>

      {/* Hero Title & Commodity Filter */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Mandi Market Intelligence
            </div>
            <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
              Mandi Benchmark Price Index
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Compare wholesale modal prices across Azadpur, Ghazipur, Keshopur, Okhla, and regional APMCs.
            </p>
          </div>

          {/* Crop Selector Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {['Tomato', 'Onion', 'Potato', 'Wheat', 'Brinjal', 'Cauliflower', 'Carrot'].map((crop) => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  selectedCrop === crop
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Price Comparison Bar Chart */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Wholesale Price Comparison for {selectedCrop} (₹ / Quintal)
          </h3>

          <div className="space-y-3">
            {filteredPrices.map((p) => {
              const pct = Math.round((p.averagePrice / (maxAveragePrice * 1.1)) * 100);
              return (
                <div key={p.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {p.mandiName || `Mandi #${p.mandiId}`}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-[11px]">
                        Range: ₹{p.minPrice} - ₹{p.maxPrice}
                      </span>
                      <span className="font-bold text-emerald-800 text-sm font-sans">
                        ₹{p.averagePrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Geolocation & Nearest Mandi Finder */}
      <div className="bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 p-6 rounded-xl border border-emerald-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              Geolocation Distance Calculator
            </div>
            <h2 className="text-lg font-bold font-serif text-slate-900">
              Find Your Nearest Mandi
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Allow location permission to automatically compute exact road kilometer distance to wholesale markets using the Haversine formula.
            </p>
          </div>

          <button
            onClick={handleDetectLocation}
            disabled={geoLoading}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded shadow-sm flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <Navigation className="w-4 h-4" />
            {geoLoading ? 'Detecting GPS...' : 'Detect My Farm Location'}
          </button>
        </div>

        {geoStatusMsg && (
          <div className="p-3 bg-white rounded border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{geoStatusMsg}</span>
          </div>
        )}

        {/* Manual Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search mandi by name or address..."
              value={searchMandi}
              onChange={(e) => setSearchMandi(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
            />
          </div>

          <div>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white text-slate-700"
            >
              <option value="all">All States & Territories</option>
              <option value="Delhi">Delhi (NCT)</option>
              <option value="Haryana">Haryana</option>
            </select>
          </div>
        </div>

        {/* Nearest Mandis Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {sortedMandis.map((m) => (
            <div
              key={m.id}
              className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs hover:border-emerald-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {m.state}
                  </span>

                  {m.distanceKm !== undefined ? (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {m.distanceKm} km away
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      {m.district}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-slate-900 font-serif mb-1">
                  {m.name}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {m.location}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {m.latitude.toFixed(2)}°N, {m.longitude.toFixed(2)}°E
                </span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${m.latitude},${m.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-800 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                >
                  Navigate <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Price Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 font-serif">
            Wholesale Price Records for {selectedCrop}
          </h3>
          <span className="text-xs text-slate-500">
            {filteredPrices.length} Reporting Centers
          </span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Mandi Market</th>
                <th className="p-3">Min Price (₹)</th>
                <th className="p-3">Average / Modal (₹)</th>
                <th className="p-3">Max Price (₹)</th>
                <th className="p-3">Trend</th>
                <th className="p-3">Effective Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrices.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-semibold text-slate-900">
                    {p.mandiName || `Mandi #${p.mandiId}`}
                  </td>
                  <td className="p-3 text-slate-600">
                    ₹{p.minPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 font-bold text-emerald-800 text-sm">
                    ₹{p.averagePrice.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-slate-600">
                    ₹{p.maxPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    {p.trend === 'up' && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        <ArrowUpRight className="w-3.5 h-3.5" /> UP
                      </span>
                    )}
                    {p.trend === 'down' && (
                      <span className="inline-flex items-center gap-1 text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded text-[11px]">
                        <ArrowDownRight className="w-3.5 h-3.5" /> DOWN
                      </span>
                    )}
                    {p.trend === 'stable' && (
                      <span className="inline-flex items-center gap-1 text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        <Minus className="w-3.5 h-3.5" /> STABLE
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-slate-400">
                    {p.priceDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
