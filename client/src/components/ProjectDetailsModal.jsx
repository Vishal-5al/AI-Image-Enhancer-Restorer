import React, { useState } from 'react';
import {
  X,
  Cpu,
  Layers,
  Database,
  Key,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Code2,
  BarChart3,
  Server
} from 'lucide-react';
import { api } from '../services/api';

export const ProjectDetailsModal = ({ isOpen, onClose, systemStatus, onTokenUpdated }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [isUpdatingToken, setIsUpdatingToken] = useState(false);
  const [tokenMsg, setTokenMsg] = useState(null);

  if (!isOpen) return null;

  const handleUpdateToken = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setIsUpdatingToken(true);
    setTokenMsg(null);
    try {
      const res = await api.updateHfToken(tokenInput.trim());
      if (res.success) {
        setTokenMsg({ type: 'success', text: res.message });
        setTokenInput('');
        if (onTokenUpdated) onTokenUpdated();
      } else {
        setTokenMsg({ type: 'error', text: res.error || 'Failed to update token' });
      }
    } catch (err) {
      setTokenMsg({ type: 'error', text: 'Error contacting server' });
    } finally {
      setIsUpdatingToken(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Project Architecture & ML Specifications
              </h3>
              <p className="text-xs text-slate-400">
                AI Image Enhancement & Restoration Platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs text-slate-300">
          {/* Tech Stack Summary Cards */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2.5">
              1. End-to-End Technology Stack
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-blue-400 font-bold block mb-1">FRONTEND</span>
                <p className="font-semibold text-slate-200">React.js & Vite</p>
                <p className="text-[11px] text-slate-400 mt-1">Dual-frame slider, responsive dark UI</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-emerald-400 font-bold block mb-1">BACKEND API</span>
                <p className="font-semibold text-slate-200">Node.js & Express</p>
                <p className="text-[11px] text-slate-400 mt-1">REST API, Multer stream, JWT Auth</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-amber-400 font-bold block mb-1">DATABASE</span>
                <p className="font-semibold text-slate-200">MongoDB & Mongoose</p>
                <p className="text-[11px] text-slate-400 mt-1">Users & restorations with JSON fallback</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-purple-400 font-bold block mb-1">AI / ML API</span>
                <p className="font-semibold text-slate-200">Hugging Face API</p>
                <p className="text-[11px] text-slate-400 mt-1">Inference Router & Sharp Lanczos3</p>
              </div>
            </div>
          </div>

          {/* Hugging Face Token & Connection Status */}
          <div className="p-4 rounded-xl bg-slate-850/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  2. Hugging Face API Configuration
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[11px] font-mono">
                {systemStatus?.huggingFace?.username
                  ? `User: @${systemStatus.huggingFace.username}`
                  : 'Token Configured'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Active HF Token</span>
                <span className="font-mono text-slate-200">
                  {systemStatus?.huggingFace?.maskedToken || 'Configured via .env'}
                </span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">API Verification Status</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified & Ready for Inference
                </span>
              </div>
            </div>

            {/* Token Update Form */}
            <form onSubmit={handleUpdateToken} className="pt-2">
              <label className="block text-[11px] text-slate-400 mb-1">
                Change or update Hugging Face token dynamically:
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="hf_..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={isUpdatingToken || !tokenInput}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  {isUpdatingToken ? 'Verifying...' : 'Update Token'}
                </button>
              </div>

              {tokenMsg && (
                <p
                  className={`text-[11px] mt-1.5 ${
                    tokenMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {tokenMsg.text}
                </p>
              )}
            </form>
          </div>

          {/* Restoration Models Integrated */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
              3. Restoration Networks & Vision Pipelines
            </h4>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-mono text-blue-400 font-semibold block">
                    caidas/swin2SR-classical-sr-x2-64
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Swin Transformer for Image Restoration (Super-Resolution 2x/4x)
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Super-Res
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-mono text-blue-400 font-semibold block">
                    microsoft/swinir-classical-sr-x2-64
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Image Restoration using Swin Transformer for deblurring & artifact removal
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Deblur
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-mono text-blue-400 font-semibold block">
                    Sharp Lanczos3 + Laplacian Filtering Engine
                  </span>
                  <span className="text-[11px] text-slate-400">
                    High-performance server pipeline for sub-millisecond edge sharpening, tone recovery & metric calculation
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Realtime Fallback
                </span>
              </div>
            </div>
          </div>

          {/* Performance & Quality Metrics */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
              4. Quantitative Quality Metrics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded bg-slate-850 border border-slate-800">
                <span className="font-semibold text-slate-200 block">Laplacian Variance</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Convolution with a 3x3 second-order derivative operator to measure high-frequency focus gain.
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-850 border border-slate-800">
                <span className="font-semibold text-slate-200 block">PSNR (dB)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Peak Signal-to-Noise Ratio measuring reconstruction fidelity against compression artifacts.
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-850 border border-slate-800">
                <span className="font-semibold text-slate-200 block">SSIM Index</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Structural Similarity metric evaluating perceived luminance, contrast, and structural consistency.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            ResAura AI • Student Capstone Project • 2026
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close Specifications
          </button>
        </div>
      </div>
    </div>
  );
};
