import React from 'react';
import { Download, Trash2, ArrowRight, History } from 'lucide-react';

export const HistoryList = ({
  history = [],
  onSelectRestoration,
  onDeleteRestoration,
  onGoToStudio
}) => {
  if (history.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center max-w-md mx-auto my-6">
        <History className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-200">No Past Restorations</h3>
        <p className="text-xs text-slate-400 mt-1">
          Enhanced images will be saved here so you can re-download or view them.
        </p>
        <button
          onClick={onGoToStudio}
          className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
        >
          Enhance an Image
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">
          Saved Restorations ({history.length})
        </h2>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-800">
        {history.map((item) => (
          <div
            key={item._id || item.id}
            className="p-3 flex items-center justify-between gap-3 hover:bg-slate-850/60 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded bg-black overflow-hidden flex-shrink-0 border border-slate-850">
                <img
                  src={item.restoredUrl}
                  alt="Restored"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {item.originalName || 'Photo'}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="capitalize text-blue-400 font-medium">{item.mode}</span>
                  <span>•</span>
                  <span>{item.metrics?.restoredWidth}×{item.metrics?.restoredHeight} px</span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onSelectRestoration(item)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded flex items-center gap-1 transition-colors"
              >
                <span>View</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <a
                href={item.restoredUrl}
                download="restored.jpg"
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => onDeleteRestoration(item._id || item.id)}
                className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
