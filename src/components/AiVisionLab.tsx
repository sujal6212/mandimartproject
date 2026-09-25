import React, { useState } from 'react';
import { 
  ScanSearch, 
  UploadCloud, 
  Sparkles, 
  AlertTriangle, 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  FileCheck2,
  Info
} from 'lucide-react';
import { VegetableComparisonResult } from '../types';

export const AiVisionLab: React.FC = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string | null>(null);
  const [preview2, setPreview2] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<VegetableComparisonResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: 1 | 2) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (index === 1) {
        setFile1(selected);
        setPreview1(URL.createObjectURL(selected));
      } else {
        setFile2(selected);
        setPreview2(URL.createObjectURL(selected));
      }
      setResult(null);
      setErrorMsg(null);
    }
  };

  const handleLoadDemo = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const r1 = await fetch('/assets/images/sample_tomato.svg');
      const b1 = await r1.blob();
      const demo1 = new File([b1], 'fresh_tomato.png', { type: 'image/png' });

      const r2 = await fetch('/assets/images/sample_tomato_blemished.svg');
      const b2 = await r2.blob();
      const demo2 = new File([b2], 'blemished_field_tomato.png', { type: 'image/png' });

      setFile1(demo1);
      setFile2(demo2);
      setPreview1(URL.createObjectURL(demo1));
      setPreview2(URL.createObjectURL(demo2));

      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Failed to load demo images: ' + err.message);
    }
  };

  const handleReset = () => {
    setFile1(null);
    setFile2(null);
    setPreview1(null);
    setPreview2(null);
    setResult(null);
    setErrorMsg(null);
  };

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file1 || !file2) {
      setErrorMsg('Please upload or load both vegetable images before initiating quality inspection.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
      const response = await fetch('/api/compare-vegetables', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setLoading(false);

      if (!data.success) {
        setErrorMsg(data.error || 'Quality analysis failed.');
        return;
      }

      setResult(data);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Communication error with AI vision microservice: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Title & Mission */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
          <ScanSearch className="w-3.5 h-3.5 text-emerald-600" />
          Computer Vision Quality Assessment
        </div>
        <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
          AI Vegetable Quality & Freshness Comparison
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          Upload dual photographs of produce samples to objectively calculate freshness hydration indices, color consistency matrices, topological contour symmetry, and surface blemish defects.
        </p>

        {/* Mandatory Quality Assessment Disclaimer */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Quality Assessment Disclaimer:</span> AI visual assessment is based strictly on visible characteristics in the uploaded images. Results are indicative and should not be considered a laboratory-grade food safety, chemical residue, or internal disease diagnosis.
          </div>
        </div>

        {/* Demo Quick Load Toolbar */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500">Quick Test:</span>
          <button
            type="button"
            onClick={handleLoadDemo}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Load Sample: Fresh vs Blemished Field Tomato
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Dual Upload Area */}
      <form onSubmit={handleCompare} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sample 1 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-sm text-slate-900 font-serif">Produce Sample #1</h3>
                <span className="text-[11px] text-slate-400">Primary Batch / Lot A</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Upload front-facing photo in balanced lighting.
              </p>

              <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-600 rounded-lg p-4 bg-slate-50/50 flex flex-col items-center justify-center min-h-[220px] transition-colors cursor-pointer group">
                {preview1 ? (
                  <img
                    src={preview1}
                    alt="Preview 1"
                    className="max-h-48 max-w-full object-contain drop-shadow-sm rounded"
                  />
                ) : (
                  <div className="text-center space-y-1">
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-emerald-700 mx-auto transition-colors" />
                    <div className="text-xs font-semibold text-slate-700">
                      Click to choose image or drag & drop
                    </div>
                    <div className="text-[11px] text-slate-400">
                      JPG, PNG, WEBP (Max 5MB)
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileChange(e, 1)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {file1 && (
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                <span className="truncate">{file1.name}</span> ({(file1.size / 1024).toFixed(0)} KB)
              </div>
            )}
          </div>

          {/* Sample 2 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-sm text-slate-900 font-serif">Produce Sample #2</h3>
                <span className="text-[11px] text-slate-400">Comparison Batch / Lot B</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Upload second sample photo to benchmark.
              </p>

              <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-600 rounded-lg p-4 bg-slate-50/50 flex flex-col items-center justify-center min-h-[220px] transition-colors cursor-pointer group">
                {preview2 ? (
                  <img
                    src={preview2}
                    alt="Preview 2"
                    className="max-h-48 max-w-full object-contain drop-shadow-sm rounded"
                  />
                ) : (
                  <div className="text-center space-y-1">
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-emerald-700 mx-auto transition-colors" />
                    <div className="text-xs font-semibold text-slate-700">
                      Click to choose image or drag & drop
                    </div>
                    <div className="text-[11px] text-slate-400">
                      JPG, PNG, WEBP (Max 5MB)
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileChange(e, 2)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {file2 && (
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                <span className="truncate">{file2.name}</span> ({(file2.size / 1024).toFixed(0)} KB)
              </div>
            )}
          </div>
        </div>

        {/* Run Action */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading || !file1 || !file2}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm px-8 py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Computer Vision Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Compare Quality with AI &rarr;</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Comparison Results Area */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Winner Celebratory Banner */}
          <div className="bg-gradient-to-r from-[#143D28] via-[#1B4332] to-[#245D44] text-white p-6 rounded-xl border border-emerald-700 shadow-md">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow">
                <Trophy className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="text-center sm:text-left space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Recommended Produce Lot
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
                  {result.comparison.winner === 'image1' && 'Sample #1 is the Recommended Higher Quality Lot'}
                  {result.comparison.winner === 'image2' && 'Sample #2 is the Recommended Higher Quality Lot'}
                  {result.comparison.winner === 'tie' && 'Both Produce Samples Exhibit Equivalent Quality Grades'}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-3xl">
                  {result.comparison.reason}
                </p>
                <div className="text-[11px] text-emerald-300 font-semibold pt-1">
                  Margin Differential: +{result.comparison.score_difference} Overall Rating Points
                </div>
              </div>
            </div>
          </div>

          {/* Metric Comparison Side-by-Side Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Analysis Card 1 */}
            <div className={`bg-white p-5 rounded-xl border ${
              result.comparison.winner === 'image1' ? 'border-emerald-600 ring-1 ring-emerald-600 shadow-md' : 'border-slate-200'
            } space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase">Sample #1</span>
                  <div className="text-3xl font-bold text-slate-900 font-serif">
                    {result.image1.overall_score} <span className="text-sm font-sans text-slate-400">/ 100</span>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded ${
                  result.image1.grade.startsWith('A') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  Grade {result.image1.grade}
                </span>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">Freshness Index (40%)</span>
                    <span className="font-bold text-emerald-800">{result.image1.freshness}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-700 h-full rounded-full" style={{ width: `${result.image1.freshness}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">Color Uniformity (20%)</span>
                    <span className="font-bold text-emerald-800">{result.image1.color_consistency}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${result.image1.color_consistency}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">Size & Shape Uniformity (20%)</span>
                    <span className="font-bold text-emerald-800">{result.image1.size_shape}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: `${result.image1.size_shape}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">Defect-Free Integrity (20%)</span>
                    <span className="font-bold text-emerald-800">{result.image1.defect_free}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${result.image1.defect_free}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Identified Defects */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Visual Diagnostics:
                </span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {result.image1.defects.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Analysis Card 2 */}
            <div className={`bg-white p-5 rounded-xl border ${
              result.comparison.winner === 'image2' ? 'border-emerald-600 ring-1 ring-emerald-600 shadow-md' : 'border-slate-200'
            } space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase">Sample #2</span>
                  <div className="text-3xl font-bold text-slate-900 font-serif">
                    {result.image2.overall_score} <span className="text-sm font-sans text-slate-400">/ 100</span>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded ${
                  result.image2.grade.startsWith('A') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  Grade {result.image2.grade}
                </span>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">Freshness Index (40%)</span>
                    <span className="font-bold text-emerald-800">{result.image2.freshness}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-700 h-full rounded-full" style={{ width: `${result.image2.freshness}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">Color Uniformity (20%)</span>
                    <span className="font-bold text-emerald-800">{result.image2.color_consistency}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${result.image2.color_consistency}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">Size & Shape Uniformity (20%)</span>
                    <span className="font-bold text-emerald-800">{result.image2.size_shape}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: `${result.image2.size_shape}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">Defect-Free Integrity (20%)</span>
                    <span className="font-bold text-emerald-800">{result.image2.defect_free}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${result.image2.defect_free}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Identified Defects */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Visual Diagnostics:
                </span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {result.image2.defects.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
