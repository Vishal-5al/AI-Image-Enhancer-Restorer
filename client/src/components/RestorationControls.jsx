import React from 'react';
import { Play, Loader2 } from 'lucide-react';

export const RestorationControls = ({
  mode,
  setMode,
  isProcessing,
  onExecute,
  canExecute
}) => {
  const options = [
    {
      id: 'upscale',
      title: 'Upscale 2x',
      desc: 'Fix pixelation & increase resolution'
    },
    {
      id: 'deblur',
      title: 'Deblur & Sharpen',
      desc: 'Fix camera shake & out-of-focus blur'
    },
    {
      id: 'historical',
      title: 'Restore Old Photo',
      desc: 'Recover contrast and faded tones'
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Select Enhancement Type
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {options.map((opt) => {
          const isSelected = mode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMode(opt.id)}
              className={`p-3 rounded border text-left transition-colors ${
                isSelected
                  ? 'border-blue-500 bg-blue-950/40 text-white'
                  : 'border-slate-800 bg-slate-850 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span className="text-xs font-semibold block">{opt.title}</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">{opt.desc}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!canExecute || isProcessing}
        onClick={onExecute}
        className="w-full py-2.5 px-4 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Restoring photo with AI...</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Enhance Photo</span>
          </>
        )}
      </button>
    </div>
  );
};
