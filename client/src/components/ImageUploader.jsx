import React, { useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

export const ImageUploader = ({
  selectedImage,
  selectedSample,
  onImageSelected,
  onSampleSelected,
  onClearSelection,
  samples = []
}) => {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    onImageSelected({
      file,
      previewUrl,
      name: file.name,
      sizeKB: +(file.size / 1024).toFixed(1)
    });
  };

  const hasSelection = !!(selectedImage || selectedSample);

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {!hasSelection ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-slate-500 bg-slate-900/80 rounded-lg p-6 text-center cursor-pointer transition-colors"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <div className="w-10 h-10 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center mx-auto mb-2">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-200">
            Click to upload photo
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Supports low-resolution, blurred, or historical photos (JPG, PNG)
          </p>
        </div>
      ) : (
        /* Selected Image Preview */
        <div className="p-3 bg-slate-850 border border-slate-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-black overflow-hidden border border-slate-700 flex-shrink-0">
              <img
                src={selectedImage?.previewUrl || selectedSample?.url}
                alt="Selected"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                {selectedImage?.name || selectedSample?.name}
              </p>
              <p className="text-[11px] text-slate-400">
                {selectedImage ? `${selectedImage.sizeKB} KB` : selectedSample?.issue}
              </p>
            </div>
          </div>
          <button
            onClick={onClearSelection}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            title="Remove selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Or Pick a Sample */}
      {!hasSelection && samples.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-2">
            Or test with a sample photo:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {samples.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSampleSelected(s)}
                className="flex items-center gap-2 p-2 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 text-left transition-colors"
              >
                <div className="w-9 h-9 rounded bg-black overflow-hidden flex-shrink-0">
                  <img src={s.url} alt={s.name} className="w-full h-full object-cover" />
                </div>
                <div className="truncate">
                  <span className="text-xs text-slate-200 font-medium block truncate">
                    {s.name}
                  </span>
                  <span className="text-[10px] text-blue-400">
                    {s.issue}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
