import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import Navbar from "../components/Navbar";
import MarketplaceCard from "../components/marketplace/MarketplaceCard";

const Marketplace = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Templates", icon: "✨" },
    { id: "professional", label: "Professional", icon: "💼" },
    { id: "creative", label: "Creative", icon: "🎨" },
    { id: "minimal", label: "Minimal", icon: "📄" },
    { id: "modern", label: "Modern", icon: "🚀" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:border-white/40 transition-colors">
            <Sparkles size={16} className="text-yellow-400" />
            <span className="text-sm font-semibold text-white">
              Explore Professional Templates
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Stand Out with
            <span className="relative">
              <span className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 blur-md opacity-75"></span>
              <span className="relative bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {" "}
                Premium Templates
              </span>
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Choose from expertly crafted resume templates designed by industry professionals. 
            Make a lasting impression with modern designs that showcase your skills.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => {
                const newDocId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                navigate(`/resume/${newDocId}`);
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl"
            >
              <Zap size={20} />
              Create from Template
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-lg border border-white/20 hover:bg-white/20 transition-all"
            >
              Back to Home
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 py-8">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">8+</p>
              <p className="text-sm text-gray-400">Premium Templates</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-pink-400 mb-2">1K+</p>
              <p className="text-sm text-gray-400">Happy Users</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">100%</p>
              <p className="text-sm text-gray-400">Customizable</p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
      </div>

      {/* Templates Section */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Choose Your Perfect Template
            </h2>
            <p className="text-gray-400 text-lg">
              Each template is fully customizable and ready to download
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all transform ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                    : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="group relative rounded-xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-purple-500/50 transition-all transform hover:scale-105 hover:shadow-2xl"
              >
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20"></div>

                {/* Card Content */}
                <MarketplaceCard />

                {/* Overlay Buttons */}
                <div className="absolute inset-0 flex items-end justify-center p-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      const newDocId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                      navigate(`/resume/${newDocId}`);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="inline-block p-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-colors">
              <h3 className="text-2xl font-bold text-white mb-3">
                Can't find what you're looking for?
              </h3>
              <p className="text-gray-300 mb-6">
                Create a completely custom resume from scratch with our powerful builder
              </p>
              <button
                onClick={() => {
                  const newDocId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                  navigate(`/resume/${newDocId}`);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-900 font-bold rounded-lg hover:bg-gray-100 transition-all"
              >
                Build from Scratch
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animated CSS */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Marketplace;
