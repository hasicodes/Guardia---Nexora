import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck, 
  Camera, 
  Hash, 
  Cpu, 
  Info, 
  Sparkles, 
  Search, 
  Download, 
  Lock, 
  FileText, 
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { ImageAuthenticityResult, ImageAuthenticityStatus } from '../types/index.ts';
import { Language } from '../translations/index.ts';

interface RealityCheckDashboardProps {
  language: Language;
}

export const RealityCheckDashboard: React.FC<RealityCheckDashboardProps> = ({ language }) => {
  const [history, setHistory] = useState<ImageAuthenticityResult[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ImageAuthenticityResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('incident_capture_live.jpg');

  // Review Notes State
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewActionMsg, setReviewActionMsg] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/reality-check/history');
      const data = await res.json();
      if (data.history) {
        setHistory(data.history);
        if (!selectedRecord && data.history.length > 0) {
          setSelectedRecord(data.history[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunVerification = async () => {
    if (!imagePreview) return;
    try {
      setIsVerifying(true);
      const res = await fetch('/api/reality-check/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imagePreview,
          fileName: fileName || 'uploaded_evidence.jpg',
          fileSizeKb: Math.round(imagePreview.length / 1024),
          mimeType: 'image/jpeg'
        })
      });
      const data = await res.json();
      if (data.success && data.verification) {
        setSelectedRecord(data.verification);
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOfficerReview = async (action: 'approved' | 'rejected' | 'flagged') => {
    if (!selectedRecord) return;
    try {
      const res = await fetch(`/api/reality-check/records/${selectedRecord.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: reviewNotes.trim() || `Officer verified as ${action}`,
          actor: 'Forensic Intelligence Officer'
        })
      });
      const data = await res.json();
      if (data.success && data.record) {
        setSelectedRecord(data.record);
        setReviewActionMsg(`Evidence successfully marked as ${action.toUpperCase()}`);
        setTimeout(() => setReviewActionMsg(null), 3000);
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: ImageAuthenticityStatus) => {
    switch (status) {
      case 'verified_real':
        return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold font-mono">VERIFIED CAMERA CAPTURE</span>;
      case 'likely_real':
        return <span className="px-3 py-1 bg-sky-500/20 text-sky-400 border border-sky-500/40 rounded-lg text-xs font-bold font-mono">LIKELY AUTHENTIC</span>;
      case 'ai_generated':
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/40 rounded-lg text-xs font-bold font-mono">SYNTHETIC / AI DIFFUSION DETECTED</span>;
      case 'manipulated':
        return <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-lg text-xs font-bold font-mono">MANIPULATION DETECTED</span>;
      default:
        return <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-xs font-bold font-mono">UNVERIFIED EVIDENCE</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1A365D]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#268BFF]">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>REALITY CHECK</span>
            <span>·</span>
            <span>AI Forensic Image Verification Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Emergency Evidence Authenticity & Anti-Disinformation
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Detects generative diffusion artifacts, EXIF tampering, and synthetic deepfakes in crisis photos. Cryptographic SHA-256 evidence hashing and C2PA provenance analysis.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="p-2 text-slate-300 hover:text-white bg-[#10233C] border border-[#1A365D] rounded-xl self-start md:self-auto"
          title="Refresh History"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* MANDATORY EMERGENCY SAFETY PROTOCOL BANNER */}
      <div className="p-4 bg-gradient-to-r from-red-950/40 via-[#10233C] to-red-950/40 border-2 border-red-500/40 rounded-2xl flex items-start gap-3 shadow-lg">
        <ShieldAlert className="w-6 h-6 text-[#E63946] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-xs font-mono uppercase tracking-wider text-[#E63946] font-bold">
            LIFE-FIRST EMERGENCY DISPATCH IMMUNITY RULE
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            <strong>CRITICAL PROTOCOL:</strong> Emergency rescue teams, fire engines, and trauma medical units are <strong>NEVER</strong> withheld, delayed, or cancelled solely because an attached image is flagged as synthetic or manipulated. First-responder dispatch proceeds immediately while photographic evidence is routed to this forensic queue for legal validation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Upload & Test or Select Record */}
        <div className="space-y-4">
          
          {/* Upload Verification Box */}
          <div className="p-5 bg-[#10233C] border border-[#1A365D] rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#268BFF]" />
              <span>Verify New Incident Photo</span>
            </h3>

            <label className="flex flex-col items-center justify-center p-5 bg-[#071426] border border-dashed border-[#1A365D] hover:border-[#268BFF] rounded-xl cursor-pointer transition-colors text-center">
              {imagePreview ? (
                <div className="space-y-2 w-full">
                  <img
                    src={imagePreview}
                    alt="Upload Preview"
                    className="max-h-36 mx-auto rounded-lg object-contain"
                  />
                  <div className="text-[11px] font-mono text-slate-300 truncate">{fileName}</div>
                </div>
              ) : (
                <div className="space-y-1.5 py-4">
                  <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                  <span className="text-xs text-slate-300 font-semibold block">Click to upload scene photograph</span>
                  <span className="text-[10px] text-slate-400 block">JPEG, PNG, HEIC up to 10MB</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handleRunVerification}
              disabled={!imagePreview || isVerifying}
              className="w-full py-2.5 bg-[#268BFF] hover:bg-[#1D7AE8] text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Scanning Diffusion Anomalies...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Forensic Reality Check</span>
                </>
              )}
            </button>
          </div>

          {/* Verification History Log */}
          <div className="p-5 bg-[#10233C] border border-[#1A365D] rounded-2xl space-y-3">
            <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider font-bold">
              Inspected Evidence Log ({history.length})
            </h4>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {history.map(rec => (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    selectedRecord?.id === rec.id
                      ? 'bg-[#142B46] border-[#268BFF]'
                      : 'bg-[#071426] border-[#1A365D] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-white">
                    <span className="truncate max-w-[140px]">{rec.fileName}</span>
                    <span className="font-mono text-[#268BFF]">{rec.confidenceScore}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span className="capitalize">{rec.status.replace('_', ' ')}</span>
                    <span className="font-mono">{new Date(rec.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Detailed Inspection Dossier */}
        <div className="lg:col-span-2 space-y-5">
          {selectedRecord ? (
            <div className="p-6 bg-[#10233C] border border-[#1A365D] rounded-2xl space-y-6">
              
              {/* Verdict Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1A365D]">
                <div>
                  <div className="text-xs font-mono text-slate-400">
                    EVIDENCE AUDIT RECORD: {selectedRecord.id}
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {selectedRecord.fileName}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedRecord.status)}
                </div>
              </div>

              {/* Confidence Meter Strip */}
              <div className="p-4 bg-[#071426] border border-[#1A365D] rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Authenticity Confidence Index:</span>
                  <span className="text-base font-extrabold font-mono text-white">
                    {selectedRecord.confidenceScore} / 100
                  </span>
                </div>
                <div className="w-full h-3 bg-[#10233C] rounded-full overflow-hidden border border-[#1A365D]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedRecord.confidenceScore > 75 ? 'bg-emerald-500' :
                      selectedRecord.confidenceScore > 45 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${selectedRecord.confidenceScore}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400">
                  {selectedRecord.explanation}
                </div>
              </div>

              {/* Cryptographic & Forensic Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="p-3.5 bg-[#071426] rounded-xl border border-[#1A365D] space-y-1">
                  <div className="text-slate-400 font-mono text-[10px] uppercase flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-[#268BFF]" />
                    <span>Cryptographic SHA-256 Hash</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-200 break-all select-all">
                    {selectedRecord.cryptographicHash}
                  </div>
                </div>

                <div className="p-3.5 bg-[#071426] rounded-xl border border-[#1A365D] space-y-1">
                  <div className="text-slate-400 font-mono text-[10px] uppercase flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>C2PA / Content Provenance</span>
                  </div>
                  <div className="font-semibold text-white">
                    {selectedRecord.provenanceCredentials === 'c2pa_present' ? 'Hardware Secure Element Present' : 'Standard Web/Camera Bitstream'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    EXIF Metadata Status: <strong className="text-slate-200 capitalize">{selectedRecord.metadataStatus}</strong>
                  </div>
                </div>

                <div className="p-3.5 bg-[#071426] rounded-xl border border-[#1A365D] space-y-1">
                  <div className="text-slate-400 font-mono text-[10px] uppercase flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" />
                    <span>Synthetic Diffusion Indicators</span>
                  </div>
                  {selectedRecord.syntheticIndicators.length === 0 ? (
                    <div className="text-emerald-400 font-medium">No generative diffusion residuals found</div>
                  ) : (
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                      {selectedRecord.syntheticIndicators.map((ind, i) => (
                        <li key={i}>{ind}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="p-3.5 bg-[#071426] rounded-xl border border-[#1A365D] space-y-1">
                  <div className="text-slate-400 font-mono text-[10px] uppercase flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Manipulation Signals</span>
                  </div>
                  {selectedRecord.manipulationIndicators.length === 0 ? (
                    <div className="text-emerald-400 font-medium">Pixel distribution intact, no cloning detected</div>
                  ) : (
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                      {selectedRecord.manipulationIndicators.map((ind, i) => (
                        <li key={i}>{ind}</li>
                      ))}
                    </ul>
                  )}
                </div>

              </div>

              {/* Officer Forensic Review Controls */}
              <div className="p-4 bg-[#142B46] border border-[#1A365D] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase text-[#268BFF] font-bold">
                    Officer Human-In-The-Loop Validation
                  </h4>
                  {selectedRecord.reviewAction && (
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
                      Action: {selectedRecord.reviewAction} ({selectedRecord.reviewedBy})
                    </span>
                  )}
                </div>

                <textarea
                  rows={2}
                  placeholder="Officer notes on scene context, lighting corroboration, or camera device..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#268BFF]"
                />

                {reviewActionMsg && (
                  <div className="text-xs font-mono text-emerald-400">
                    {reviewActionMsg}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleOfficerReview('flagged')}
                    className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-colors"
                  >
                    Flag for Senior Review
                  </button>
                  <button
                    onClick={() => handleOfficerReview('rejected')}
                    className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold transition-colors"
                  >
                    Reject as Evidence
                  </button>
                  <button
                    onClick={() => handleOfficerReview('approved')}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Approve Evidence
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select an evidence file or upload a photograph to view forensic reality check diagnostics.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
