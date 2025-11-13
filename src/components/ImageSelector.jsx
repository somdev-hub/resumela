import React, { useState } from "react";

const ImageSelector = ({ colorConfig, setColorConfig }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Curated image categories with Picsum Photos
  const imageCategories = [
    { name: "Professional", id: 1 },
    { name: "Modern", id: 2 },
    { name: "Minimal", id: 3 },
    { name: "Abstract", id: 4 },
    { name: "Nature", id: 5 },
    { name: "Urban", id: 6 },
    { name: "Architecture", id: 7 },
    { name: "Technology", id: 8 },
  ];

  // Generate image URLs using Picsum Photos
  // Each category gets 8 different images in high resolution
  const getImagesForCategory = (categoryId) => {
    const images = [];
    const baseId = categoryId * 100; // Offset IDs to get different images per category
    
    for (let i = 0; i < 8; i++) {
      const imageId = baseId + i;
      images.push({
        id: `picsum-${imageId}`,
        url: `https://picsum.photos/id/${imageId}/1200/900`, // Higher resolution for better quality
        thumbnail: `https://picsum.photos/id/${imageId}/200/150`,
        category: categoryId,
      });
    }
    return images;
  };

  // Get all images
  const allImages = imageCategories.flatMap(category => 
    getImagesForCategory(category.id)
  );

  // Filter images based on search
  const filteredImages = searchQuery
    ? allImages.filter((_, index) => {
        const categoryIndex = Math.floor(index / 8);
        return imageCategories[categoryIndex]?.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      })
    : allImages;

  return (
    <div className="mb-4">
      <div className="mb-3 text-sm font-medium text-slate-700">
        Select Background Image
      </div>

      {/* Search/Filter */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search images (e.g., Professional, Nature, Abstract...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
        {/* None Option */}
        <button
          onClick={() =>
            setColorConfig((prev) => ({
              ...prev,
              selectedImage: null,
            }))
          }
          className={`aspect-video rounded-lg border-2 flex items-center justify-center transition ${
            !colorConfig.selectedImage
              ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500"
              : "border-slate-200 hover:border-slate-300 bg-white"
          }`}
        >
          <div className="text-center">
            <div className="text-2xl mb-1">🚫</div>
            <div className="text-xs font-medium text-slate-700">None</div>
          </div>
        </button>

        {filteredImages.map((image, index) => (
          <button
            key={image.id}
            onClick={() =>
              setColorConfig((prev) => ({
                ...prev,
                selectedImage: image.url,
                selectedImageId: image.id,
              }))
            }
            className={`aspect-video rounded-lg border-2 overflow-hidden transition ${
              colorConfig.selectedImage === image.url
                ? "border-indigo-500 ring-2 ring-indigo-500"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <img
              src={image.thumbnail}
              alt={`Background ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {filteredImages.length === 0 && searchQuery && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No images found. Try a different search term.
        </div>
      )}

      {/* Image Overlay Opacity Control */}
      {colorConfig.selectedImage && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <label className="text-xs font-medium text-slate-700 block mb-2">
            Image Opacity: {Math.round((colorConfig.imageOpacity || 0.3) * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={colorConfig.imageOpacity || 0.3}
            onChange={(e) =>
              setColorConfig((prev) => ({
                ...prev,
                imageOpacity: parseFloat(e.target.value),
              }))
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Light</span>
            <span>Dark</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSelector;
