import { fontsByCategory } from "../../customization/Fonts";

const FontSelector = ({
  activeFontCategory,
  setActiveFontCategory,
  selectedFont,
  setSelectedFont,
  loadGoogleFont,
  fontStatus,
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold text-slate-800 mb-4">Font</h3>
      <div className="flex items-center gap-3 mb-4">
        {["serif", "sans", "mono"].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFontCategory(cat)}
            className={`px-4 py-2 rounded-lg border transition text-sm ${
              activeFontCategory === cat
                ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                : "border-slate-200 text-slate-700"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-slate-600">Choose a font</div>
        <div className="text-sm">
          <span className="mr-2 text-xs text-slate-500">Status:</span>
          <span
            className={`text-xs font-medium ${
              fontStatus === "loaded"
                ? "text-emerald-600"
                : fontStatus === "failed"
                ? "text-rose-600"
                : "text-slate-600"
            }`}
          >
            {fontStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {fontsByCategory[activeFontCategory].map((f) => (
          <button
            key={f.family}
            onClick={() => {
              setSelectedFont({
                family: f.family,
                category: activeFontCategory,
                css: f.css,
              });
              loadGoogleFont(f.css);
            }}
            className={`w-full text-left px-4 py-2 rounded-lg border transition text-sm ${
              selectedFont.family === f.family
                ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                : "border-slate-200 text-slate-700"
            }`}
          >
            {f.family}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FontSelector;
