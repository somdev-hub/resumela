const HeaderConfig = ({ layoutConfig, setLayoutConfig }) => {
  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold text-slate-800 mb-4">Header</h3>
      <div className="mb-6">
        <label className="text-sm font-medium text-slate-700 block mb-3">
          Header Position
        </label>
        <div className="flex gap-3">
          {[
            { value: "top", label: "Top" },
            { value: "left", label: "Left" },
            { value: "right", label: "Right" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() =>
                setLayoutConfig((prev) => ({
                  ...prev,
                  headerPosition: option.value,
                }))
              }
              className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
                layoutConfig.headerPosition === option.value
                  ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                  : "border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeaderConfig;
