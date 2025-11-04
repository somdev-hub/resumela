const SpacingControls = ({ spacingConfig, setSpacingConfig }) => {
  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold text-slate-800 mb-4">Spacing</h3>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">
            Font Size
          </label>
          <span className="text-sm text-slate-600">
            {spacingConfig.fontSize}pt
          </span>
        </div>
        <input
          type="range"
          min="8"
          max="14"
          value={spacingConfig.fontSize}
          onChange={(e) =>
            setSpacingConfig((prev) => ({
              ...prev,
              fontSize: parseInt(e.target.value),
            }))
          }
          className="w-full"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">
            Line Height
          </label>
          <span className="text-sm text-slate-600">
            {spacingConfig.lineHeight}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="2"
          step="0.05"
          value={spacingConfig.lineHeight}
          onChange={(e) =>
            setSpacingConfig((prev) => ({
              ...prev,
              lineHeight: parseFloat(e.target.value),
            }))
          }
          className="w-full"
        />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">
              Left & Right Margin
            </label>
            <span className="text-sm text-slate-600">
              {spacingConfig.marginLR}mm
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="25"
            value={spacingConfig.marginLR}
            onChange={(e) =>
              setSpacingConfig((prev) => ({
                ...prev,
                marginLR: parseInt(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">
              Top & Bottom Margin
            </label>
            <span className="text-sm text-slate-600">
              {spacingConfig.marginTB}mm
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="25"
            value={spacingConfig.marginTB}
            onChange={(e) =>
              setSpacingConfig((prev) => ({
                ...prev,
                marginTB: parseInt(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">
            Space between Entries
          </label>
          <span className="text-sm text-slate-600">
            {spacingConfig.entrySpacing}px
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="30"
          value={spacingConfig.entrySpacing}
          onChange={(e) =>
            setSpacingConfig((prev) => ({
              ...prev,
              entrySpacing: parseInt(e.target.value),
            }))
          }
          className="w-full"
        />
      </div>
    </div>
  );
};

export default SpacingControls;
