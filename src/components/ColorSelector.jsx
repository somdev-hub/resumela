import MulticolorSelector from "./MulticolorSelector";

const ColorSelector = ({ colorConfig, setColorConfig }) => {
  const colorModes = [
    { key: "basic", label: "Basic", icon: "⬤" },
    { key: "advanced", label: "Advanced", icon: "◐" },
    { key: "border", label: "Border", icon: "◯" },
  ];

  const accentModes = [
    { key: "accent", label: "Accent", icon: "■" },
    { key: "multi", label: "Multi", icon: "Ⱶ" },
    { key: "image", label: "Image", icon: "🖼" },
  ];

  // Filter accent modes based on selected color mode
  const getAvailableAccentModes = () => {
    if (colorConfig.mode === "border") {
      return accentModes.filter(mode => mode.key === "accent" || mode.key === "image");
    } else {
      return accentModes; // All modes for basic and advanced
    }
  };

  const availableAccentModes = getAvailableAccentModes();

  const multicolorPresets = [
    {
      name: "Classic",
      key: "classic",
      text: "#1f2937",
      background: "#ffffff",
      accent: "#2c3e50",
      headerText: "#ffffff",
      headerBackground: "#2c3e50",
      headerAccent: "#ffffff"
    },
    {
      name: "Modern Blue",
      key: "modernBlue",
      text: "#1e293b",
      background: "#f8fafc",
      accent: "#3b82f6",
      headerText: "#ffffff",
      headerBackground: "#3b82f6",
      headerAccent: "#ffffff"
    },
    {
      name: "Professional",
      key: "professional",
      text: "#0f172a",
      background: "#ffffff",
      accent: "#1e40af",
      headerText: "#ffffff",
      headerBackground: "#1e40af",
      headerAccent: "#ffffff"
    },
    {
      name: "Elegant",
      key: "elegant",
      text: "#18181b",
      background: "#fafafa",
      accent: "#7c3aed",
      headerText: "#ffffff",
      headerBackground: "#7c3aed",
      headerAccent: "#ffffff"
    },
    {
      name: "Warm",
      key: "warm",
      text: "#292524",
      background: "#fef3c7",
      accent: "#dc2626",
      headerText: "#ffffff",
      headerBackground: "#dc2626",
      headerAccent: "#ffffff"
    },
    {
      name: "Cool",
      key: "cool",
      text: "#0c4a6e",
      background: "#e0f2fe",
      accent: "#0891b2",
      headerText: "#ffffff",
      headerBackground: "#0891b2",
      headerAccent: "#ffffff"
    },
  ];

  const predefinedColors = [
    { name: "None", value: null, class: "bg-white border-2 border-slate-300" },
    { name: "Dark Blue", value: "#2c3e50", class: "bg-[#2c3e50]" },
    { name: "Teal", value: "#16697a", class: "bg-[#16697a]" },
    { name: "Light Teal", value: "#5c9ead", class: "bg-[#5c9ead]" },
    { name: "Sky Blue", value: "#1e88a8", class: "bg-[#1e88a8]" },
    { name: "Navy", value: "#2a5a7d", class: "bg-[#2a5a7d]" },
    { name: "Medium Blue", value: "#4682b4", class: "bg-[#4682b4]" },
    { name: "Cornflower", value: "#6495ed", class: "bg-[#6495ed]" },
    { name: "Light Blue", value: "#7eb5d6", class: "bg-[#7eb5d6]" },
    { name: "Baby Blue", value: "#87ceeb", class: "bg-[#87ceeb]" },
    { name: "Purple", value: "#4a148c", class: "bg-[#4a148c]" },
    { name: "Plum", value: "#6b2569", class: "bg-[#6b2569]" },
    { name: "Rose", value: "#b25973", class: "bg-[#b25973]" },
    { name: "Pink", value: "#c2185b", class: "bg-[#c2185b]" },
    { name: "Coral", value: "#ff6b6b", class: "bg-[#ff6b6b]" },
    { name: "Rainbow", value: "rainbow", class: "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" },
  ];

  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold text-slate-800 mb-4">Color</h3>
      
      {/* Color Mode Selection */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-3">
          {colorModes.map((mode) => (
            <button
              key={mode.key}
              onClick={() =>
                setColorConfig((prev) => ({
                  ...prev,
                  mode: mode.key,
                  // Reset accent mode if not available in new mode
                  accentMode: mode.key === "basic" ? "accent" : 
                              mode.key === "border" && prev.accentMode === "multi" ? "accent" : 
                              prev.accentMode,
                }))
              }
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition ${
                colorConfig.mode === mode.key
                  ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                  : "border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <div className="text-2xl mb-1">{mode.icon}</div>
              <div className="text-xs font-medium">{mode.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Mode Selection - Show for all modes except when no options available */}
      {availableAccentModes.length > 0 && (
        <div className="mb-4">
          <div className={`grid gap-3 ${availableAccentModes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {availableAccentModes.map((mode) => (
              <button
                key={mode.key}
                onClick={() =>
                  setColorConfig((prev) => ({
                    ...prev,
                    accentMode: mode.key,
                  }))
                }
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition ${
                  colorConfig.accentMode === mode.key
                    ? "bg-slate-900 text-white border-slate-900"
                    : "border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="text-xl mb-1">{mode.icon}</div>
                <div className="text-xs font-medium">{mode.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Multicolor Presets - Show when multi accent mode is selected in any mode */}
      {colorConfig.accentMode === "multi" && (
        <div className="mb-4">
          <div className="mb-3 text-sm font-medium text-slate-700">
            Color Presets
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {multicolorPresets.map((preset) => (
              <button
                key={preset.key}
                onClick={() =>
                  setColorConfig((prev) => ({
                    ...prev,
                    multiPreset: preset.key,
                    multiTextColor: preset.text,
                    multiBackgroundColor: preset.background,
                    multiAccentColor: preset.accent,
                  }))
                }
                className={`flex flex-col items-center p-2 rounded-lg border transition ${
                  colorConfig.multiPreset === preset.key
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <MulticolorSelector
                  config={colorConfig.mode}
                  text={preset.text}
                  background={preset.background}
                  accent={preset.accent}
                  header_text={preset.headerText}
                  header_background={preset.headerBackground}
                  header_accent={preset.headerAccent}
                />
                <div className="text-xs font-medium text-slate-700 mt-2">
                  {preset.name}
                </div>
              </button>
            ))}
            
            {/* Custom Option */}
            <button
              onClick={() =>
                setColorConfig((prev) => ({
                  ...prev,
                  multiPreset: "custom",
                }))
              }
              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition min-h-[5rem] ${
                colorConfig.multiPreset === "custom"
                  ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="text-3xl mb-1">⚙️</div>
              <div className="text-xs font-medium text-slate-700">
                Custom
              </div>
            </button>
          </div>

          {/* Individual Color Pickers for Multicolor - Show only when Custom is selected */}
          {colorConfig.multiPreset === "custom" && (
            <>
              {colorConfig.mode === "basic" ? (
                // Basic Mode: Show Text, Background, and Accent
                <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-2 text-center">
                      Text
                    </label>
                    <div className="flex flex-col items-center gap-2">
                      <input
                        type="color"
                        value={colorConfig.multiTextColor || "#1f2937"}
                        onChange={(e) =>
                          setColorConfig((prev) => ({
                            ...prev,
                            multiTextColor: e.target.value,
                          }))
                        }
                        className="w-16 h-16 rounded-full border border-slate-200 cursor-pointer"
                      />
                      <span className="text-xs text-slate-600">
                        {colorConfig.multiTextColor || "#1f2937"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-2 text-center">
                      Background
                    </label>
                    <div className="flex flex-col items-center gap-2">
                      <input
                        type="color"
                        value={colorConfig.multiBackgroundColor || "#ffffff"}
                        onChange={(e) =>
                          setColorConfig((prev) => ({
                            ...prev,
                            multiBackgroundColor: e.target.value,
                          }))
                        }
                        className="w-16 h-16 rounded-full border border-slate-200 cursor-pointer"
                      />
                      <span className="text-xs text-slate-600">
                        {colorConfig.multiBackgroundColor || "#ffffff"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-2 text-center">
                      Accent
                    </label>
                    <div className="flex flex-col items-center gap-2">
                      <input
                        type="color"
                        value={colorConfig.multiAccentColor || "#2c3e50"}
                        onChange={(e) =>
                          setColorConfig((prev) => ({
                            ...prev,
                            multiAccentColor: e.target.value,
                          }))
                        }
                        className="w-16 h-16 rounded-full border border-slate-200 cursor-pointer"
                      />
                      <span className="text-xs text-slate-600">
                        {colorConfig.multiAccentColor || "#2c3e50"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // Advanced Mode: Show Text, Background, Accent + Header Text, Header Background, Header Accent
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-slate-800 mb-3">Body Colors</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-700 block mb-2 text-center">
                          Text
                        </label>
                        <div className="flex flex-col items-center gap-2">
                          <input
                            type="color"
                            value={colorConfig.multiTextColor || "#1f2937"}
                            onChange={(e) =>
                              setColorConfig((prev) => ({
                                ...prev,
                                multiTextColor: e.target.value,
                              }))
                            }
                            className="w-14 h-14 rounded-full border border-slate-200 cursor-pointer"
                          />
                          <span className="text-[10px] text-slate-600">
                            {colorConfig.multiTextColor || "#1f2937"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-700 block mb-2 text-center">
                          Background
                        </label>
                        <div className="flex flex-col items-center gap-2">
                          <input
                            type="color"
                            value={colorConfig.multiBackgroundColor || "#ffffff"}
                            onChange={(e) =>
                              setColorConfig((prev) => ({
                                ...prev,
                                multiBackgroundColor: e.target.value,
                              }))
                            }
                            className="w-14 h-14 rounded-full border border-slate-200 cursor-pointer"
                          />
                          <span className="text-[10px] text-slate-600">
                            {colorConfig.multiBackgroundColor || "#ffffff"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-700 block mb-2 text-center">
                          Accent
                        </label>
                        <div className="flex flex-col items-center gap-2">
                          <input
                            type="color"
                            value={colorConfig.multiAccentColor || "#2c3e50"}
                            onChange={(e) =>
                              setColorConfig((prev) => ({
                                ...prev,
                                multiAccentColor: e.target.value,
                              }))
                            }
                            className="w-14 h-14 rounded-full border border-slate-200 cursor-pointer"
                          />
                          <span className="text-[10px] text-slate-600">
                            {colorConfig.multiAccentColor || "#2c3e50"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <h4 className="text-xs font-semibold text-slate-800 mb-3">Header Colors</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-700 block mb-2 text-center">
                          Header Text
                        </label>
                        <div className="flex flex-col items-center gap-2">
                          <input
                            type="color"
                            value={colorConfig.multiHeaderTextColor || "#ffffff"}
                            onChange={(e) =>
                              setColorConfig((prev) => ({
                                ...prev,
                                multiHeaderTextColor: e.target.value,
                              }))
                            }
                            className="w-14 h-14 rounded-full border border-slate-200 cursor-pointer"
                          />
                          <span className="text-[10px] text-slate-600">
                            {colorConfig.multiHeaderTextColor || "#ffffff"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-700 block mb-2 text-center">
                          Header Background
                        </label>
                        <div className="flex flex-col items-center gap-2">
                          <input
                            type="color"
                            value={colorConfig.multiHeaderBackgroundColor || "#2c3e50"}
                            onChange={(e) =>
                              setColorConfig((prev) => ({
                                ...prev,
                                multiHeaderBackgroundColor: e.target.value,
                              }))
                            }
                            className="w-14 h-14 rounded-full border border-slate-200 cursor-pointer"
                          />
                          <span className="text-[10px] text-slate-600">
                            {colorConfig.multiHeaderBackgroundColor || "#2c3e50"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-700 block mb-2 text-center">
                          Header Accent
                        </label>
                        <div className="flex flex-col items-center gap-2">
                          <input
                            type="color"
                            value={colorConfig.multiHeaderAccentColor || "#ffffff"}
                            onChange={(e) =>
                              setColorConfig((prev) => ({
                                ...prev,
                                multiHeaderAccentColor: e.target.value,
                              }))
                            }
                            className="w-14 h-14 rounded-full border border-slate-200 cursor-pointer"
                          />
                          <span className="text-[10px] text-slate-600">
                            {colorConfig.multiHeaderAccentColor || "#ffffff"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Color Selection - Only show if NOT multi mode */}
      {colorConfig.accentMode !== "multi" && (
        <div>
          <div className="mb-2 text-sm font-medium text-slate-700">
            Choose Color
          </div>
          <div className="grid grid-cols-8 gap-2">
            {predefinedColors.map((color) => (
              <button
                key={color.name}
                onClick={() =>
                  setColorConfig((prev) => ({
                    ...prev,
                    selectedColor: color.value,
                    selectedColorName: color.name,
                  }))
                }
                className={`w-10 h-10 rounded-full ${color.class} transition-transform hover:scale-110 ${
                  colorConfig.selectedColor === color.value
                    ? "ring-2 ring-indigo-500 ring-offset-2"
                    : ""
                }`}
                title={color.name}
              >
                {color.value === null && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-6 h-0.5 bg-red-500 rotate-45"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Color Picker - Only for accent mode */}
      {colorConfig.accentMode === "accent" && (
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Custom Color
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={colorConfig.customColor || "#6366f1"}
              onChange={(e) =>
                setColorConfig((prev) => ({
                  ...prev,
                  customColor: e.target.value,
                  selectedColor: e.target.value,
                  selectedColorName: "Custom",
                }))
              }
              className="w-12 h-12 rounded-lg border border-slate-200 cursor-pointer"
            />
            <span className="text-sm text-slate-600">
              {colorConfig.customColor || "#6366f1"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorSelector;
