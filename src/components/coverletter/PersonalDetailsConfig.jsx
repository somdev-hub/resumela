const PersonalDetailsConfig = ({ personalConfig, setPersonalConfig }) => {
  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold text-slate-800 mb-4">
        Personal Details
      </h3>
      <div className="mb-4">
        <div className="mb-2 text-sm font-medium text-slate-700">Align</div>
        <div className="flex gap-3">
          {[
            { key: "left", label: "Left" },
            { key: "center", label: "Center" },
            { key: "right", label: "Right" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() =>
                setPersonalConfig((prev) => ({
                  ...prev,
                  align: opt.key,
                }))
              }
              className={`px-4 py-3 rounded-lg border w-32 text-sm ${
                personalConfig.align === opt.key
                  ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                  : "border-slate-200 text-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 text-sm font-medium text-slate-700">
          Arrangement
        </div>
        <div className="flex gap-3">
          <button
            onClick={() =>
              setPersonalConfig((prev) => ({
                ...prev,
                arrangement: "single",
              }))
            }
            className={`px-4 py-3 rounded-lg border w-40 text-sm ${
              personalConfig.arrangement === "single"
                ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                : "border-slate-200 text-slate-700"
            }`}
          >
            Single column
          </button>
          <button
            onClick={() =>
              setPersonalConfig((prev) => ({
                ...prev,
                arrangement: "two",
              }))
            }
            className={`px-4 py-3 rounded-lg border w-40 text-sm ${
              personalConfig.arrangement === "two"
                ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                : "border-slate-200 text-slate-700"
            }`}
          >
            Two columns
          </button>
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-medium text-slate-700">
          Contact style
        </div>
        <div className="flex gap-3">
          {[
            { key: "icon", label: "Icon" },
            { key: "bullet", label: "Bullet" },
            { key: "bar", label: "Bar" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() =>
                setPersonalConfig((prev) => ({
                  ...prev,
                  contactStyle: opt.key,
                }))
              }
              className={`px-4 py-3 rounded-lg border w-32 text-sm ${
                personalConfig.contactStyle === opt.key
                  ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                  : "border-slate-200 text-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsConfig;
