import React, { useState } from "react";
import "./EntryLayoutCustomizer.css";
import { Menu } from "lucide-react";

const layoutOptions = [
  {
    id: 1,
    label: "Content - Date - Location",
    icon: "📄📅📍",
    order: ["content", "date", "location"],
  },
  {
    id: 4,
    label: "default",
    icon: <Menu />,
    order: [],
  },
];

const sizeOptions = ["S", "M", "L"];
const subtitleStyles = ["Normal", "Bold", "Italic"];
const subtitlePlacements = ["Try Same Line", "Next Line"];
const listStyles = ["Bullet", "Hyphen"];

export default function EntryLayoutCustomizer({ value, onChange, format }) {
  // Set default layout to the 'default' option (id: 4)
  const defaultLayoutId = 4;
  const defaultOrder = [];
  // If value?.layout is undefined, use defaultLayoutId (4). If value?.entryOrder is undefined, use defaultOrder ([]).
  // Always store layout as a number for reliable comparison
  const [layout, setLayout] = useState(
    value && value.layout != null ? Number(value.layout) : defaultLayoutId
  );
  const [size, setSize] = useState(value?.size || "S");
  const [subtitleStyle, setSubtitleStyle] = useState(
    value?.subtitleStyle || "Normal"
  );
  const [subtitlePlacement, setSubtitlePlacement] = useState(
    value?.subtitlePlacement || "Next Line"
  );
  const [indentBody, setIndentBody] = useState(value?.indentBody || false);
  const [listStyle, setListStyle] = useState(value?.listStyle || "Bullet");
  const [entryOrder, setEntryOrder] = useState(
    Array.isArray(value?.entryOrder) ? value.entryOrder : defaultOrder
  );
  const [conDateLocDisplay, setConDateLocDisplay] = useState(
    value?.conDateLocDisplay || "inline"
  );

  // When column layout changes, force newline for multi-column
  React.useEffect(() => {
    if (format !== "one") {
      // Multi-column layout detected, force newline
      setConDateLocDisplay("newline");
    }
  }, [format]);

  // Notify parent on change
  React.useEffect(() => {
    onChange &&
      onChange({
        layout,
        size,
        subtitleStyle,
        subtitlePlacement,
        indentBody,
        listStyle,
        entryOrder,
        conDateLocDisplay,
      });
  }, [
    layout,
    size,
    subtitleStyle,
    subtitlePlacement,
    indentBody,
    listStyle,
    entryOrder,
    conDateLocDisplay,
    onChange,
  ]);

  return (
    <div className="entry-layout-customizer">
      <h2>Entry Layout</h2>
      {/* Entry field order customization */}
      {format === "one" && (
        <div className="layout-options">
          {layoutOptions.map((opt) => (
            <button
              key={opt.id}
              className={layout === opt.id ? "selected" : ""}
              onClick={() => {
                setLayout(opt.id);
                setEntryOrder(opt.order);
              }}
              aria-label={opt.label}
              title={opt.label}
            >
              <span className="layout-icon">{opt.icon}</span>
            </button>
          ))}
        </div>
      )}
      <div className="section">
        <div className="label">Title & subtitle size</div>
        <div className="size-options">
          {sizeOptions.map((s) => (
            <button
              key={s}
              className={size === s ? "selected" : ""}
              onClick={() => setSize(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="section">
        <div className="label">Subtitle style</div>
        <div className="subtitle-style-options">
          {subtitleStyles.map((style) => (
            <button
              key={style}
              className={subtitleStyle === style ? "selected" : ""}
              onClick={() => setSubtitleStyle(style)}
            >
              {style}
            </button>
          ))}
        </div>
      </div>
      <div className="section">
        <div className="label">Subtitle placement</div>
        <div className="subtitle-placement-options">
          {subtitlePlacements.map((place) => (
            <button
              key={place}
              className={subtitlePlacement === place ? "selected" : ""}
              onClick={() => setSubtitlePlacement(place)}
            >
              {place}
            </button>
          ))}
        </div>
      </div>
      <div className="section">
        <label>
          <input
            type="checkbox"
            checked={indentBody}
            onChange={(e) => setIndentBody(e.target.checked)}
          />
          Indent body
        </label>
      </div>
      <div className="section">
        <div className="label">List style</div>
        <div className="list-style-options">
          {listStyles.map((style) => (
            <button
              key={style}
              className={listStyle === style ? "selected" : ""}
              onClick={() => setListStyle(style)}
            >
              {style === "Bullet" ? (
                <span>&bull; Bullet</span>
              ) : (
                <span>&ndash; Hyphen</span>
              )}
            </button>
          ))}
        </div>
      </div>
      {/* Date & Location Display toggle - only show for one-column AND con-date-loc layout */}
      {format === "one" && layout === 1 && (
        <div className="section">
          <div className="label">Date & Location Display</div>
          <div className="display-options">
            <button
              className={conDateLocDisplay === "inline" ? "selected" : ""}
              onClick={() => setConDateLocDisplay("inline")}
            >
              Inline
            </button>
            <button
              className={conDateLocDisplay === "newline" ? "selected" : ""}
              onClick={() => setConDateLocDisplay("newline")}
            >
              Next Line
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
