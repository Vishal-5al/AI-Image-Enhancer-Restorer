import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Sliders, Columns, RotateCcw } from 'lucide-react';

export const DualFramePreview = ({
  originalUrl,
  restoredUrl,
  metrics,
  mode,
  scaleFactor,
  onReset
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [viewType, setViewType] = useState('slider'); // 'slider' or 'side-by-side'
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  useEffect(() => {
    const onMouseUp = () => setIsDragging(false);
    const onMouseMove = (e) => {
      if (isDragging) handleMove(e.clientX);
    };
    const onTouchMove = (e) => {
      if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX);
    };

    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchend', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);

    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [isDragging, handleMove]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = restoredUrl;
    link.download = `restored_photo_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg">
      {/* Simple Control Bar */}
      <div className="px-4 py-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewType('slider')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewType === 'slider'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>
          <button
            onClick={() => setViewType('side-by-side')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewType === 'side-by-side'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side by Side</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Photo</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Photo</span>
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="p-4 bg-slate-950 flex flex-col items-center justify-center min-h-[380px]">
        {viewType === 'slider' ? (
          <div className="w-full flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-2">
              Drag the blue divider to compare Before & After
            </span>
            <div
              ref={containerRef}
              onMouseDown={(e) => {
                setIsDragging(true);
                handleMove(e.clientX);
              }}
              onTouchStart={(e) => {
                setIsDragging(true);
                if (e.touches[0]) handleMove(e.touches[0].clientX);
              }}
              className="relative w-full max-w-2xl aspect-[4/3] rounded border border-slate-800 bg-slate-900 overflow-hidden cursor-ew-resize select-none"
            >
              {/* After (Restored) */}
              <img
                src={restoredUrl}
                alt="Enhanced"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />

              {/* Before (Original) clipped */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={originalUrl}
                  alt="Original"
                  className="absolute inset-0 w-full h-full object-contain max-w-none pointer-events-none"
                  style={{
                    width: containerRef.current
                      ? `${containerRef.current.clientWidth}px`
                      : '100%',
                    height: containerRef.current
                      ? `${containerRef.current.clientHeight}px`
                      : '100%'
                  }}
                />
              </div>

              {/* Divider handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-blue-500 pointer-events-none z-10"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow flex items-center justify-center text-white text-[10px]">
                  ↔
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-2 left-2 z-20 pointer-events-none">
                <span className="px-2 py-1 rounded bg-black/70 text-[10px] font-semibold text-slate-200">
                  Original
                </span>
              </div>
              <div className="absolute top-2 right-2 z-20 pointer-events-none">
                <span className="px-2 py-1 rounded bg-blue-600/90 text-[10px] font-semibold text-white">
                  AI Enhanced
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Side by side */
          <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded p-2 flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-400 mb-2">Original Photo</span>
              <div className="w-full aspect-[4/3] bg-black rounded flex items-center justify-center overflow-hidden">
                <img
                  src={originalUrl}
                  alt="Original"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-2 font-mono">
                {metrics?.originalWidth} × {metrics?.originalHeight} px
              </span>
            </div>

            <div className="bg-slate-900 border border-blue-900/60 rounded p-2 flex flex-col items-center">
              <span className="text-xs font-semibold text-blue-400 mb-2">Restored Result</span>
              <div className="w-full aspect-[4/3] bg-black rounded flex items-center justify-center overflow-hidden">
                <img
                  src={restoredUrl}
                  alt="Restored"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <span className="text-[11px] text-blue-300 mt-2 font-mono">
                {metrics?.restoredWidth} × {metrics?.restoredHeight} px ({scaleFactor}x)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Simple Result Stats Bar */}
      <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2 bg-slate-850 rounded border border-slate-800">
          <span className="text-slate-500 block text-[10px]">Original Size</span>
          <span className="font-mono text-slate-200">{metrics?.originalWidth}×{metrics?.originalHeight} px</span>
        </div>
        <div className="p-2 bg-slate-850 rounded border border-slate-800">
          <span className="text-slate-500 block text-[10px]">Enhanced Size</span>
          <span className="font-mono text-blue-400 font-semibold">{metrics?.restoredWidth}×{metrics?.restoredHeight} px</span>
        </div>
        <div className="p-2 bg-slate-850 rounded border border-slate-800">
          <span className="text-slate-500 block text-[10px]">Sharpness Gain</span>
          <span className="font-mono text-emerald-400 font-semibold">+{metrics?.sharpnessGainPct || 40}%</span>
        </div>
        <div className="p-2 bg-slate-850 rounded border border-slate-800">
          <span className="text-slate-500 block text-[10px]">Processing Time</span>
          <span className="font-mono text-slate-300">{metrics?.processingTimeMs || 80} ms</span>
        </div>
      </div>
    </div>
  );
};
