import { useEffect, useState } from "react";

export const useFontLoading = (selectedFont) => {
  const [fontStatus, setFontStatus] = useState("idle");
  const [fontReadyToggle, setFontReadyToggle] = useState(false);

  const loadGoogleFont = (cssFamily) => {
    if (!cssFamily) return;
    const existingLinks = Array.from(
      document.querySelectorAll("link[data-googlefont]")
    );
    if (
      existingLinks.find((l) => l.getAttribute("data-googlefont") === cssFamily)
    )
      return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${cssFamily}&display=swap`;
    link.setAttribute("data-googlefont", cssFamily);
    document.head.appendChild(link);
  };

  useEffect(() => {
    if (selectedFont && selectedFont.css) {
      loadGoogleFont(selectedFont.css);
    }
  }, [selectedFont]);

  useEffect(() => {
    if (!selectedFont || !selectedFont.family) return;
    setFontStatus("loading");
    if (document.fonts && document.fonts.load) {
      document.fonts
        .load(`1em "${selectedFont.family}"`)
        .then(() => {
          setFontStatus("loaded");
          setFontReadyToggle((s) => !s);
        })
        .catch(() => {
          setFontStatus("failed");
        });
    } else {
      setFontStatus("loading");
    }
  }, [selectedFont]);

  useEffect(() => {
    if (
      selectedFont &&
      selectedFont.family &&
      document.fonts &&
      document.fonts.load
    ) {
      const fam = selectedFont.family;
      document.fonts
        .load(`1em '${fam}'`)
        .then(() => {
          setFontReadyToggle((s) => !s);
        })
        .catch(() => {
          // ignore
        });
    }
  }, [selectedFont]);

  return { fontStatus, fontReadyToggle, loadGoogleFont };
};
