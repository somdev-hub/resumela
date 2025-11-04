import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Sparkles } from "lucide-react";

const AIGeneratingOverlay = ({ open }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!open) return;

    // Generate random particles for animation
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 1,
    }));
    setParticles(newParticles);
  }, [open]);

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.3s ease-in-out",
        "@keyframes fadeIn": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      {/* Animated particles background */}
      {particles.map((particle, idx) => (
        <Box
          key={particle.id}
          sx={{
            position: "absolute",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: `radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.4))`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: `float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
            "@keyframes float": {
              "0%": {
                transform: "translateY(0px) translateX(0px)",
                opacity: 1,
              },
              "50%": {
                opacity: 0.5,
              },
              "100%": {
                transform: "translateY(-80px) translateX(40px)",
                opacity: 0,
              },
            },
          }}
        />
      ))}

      {/* Central content card */}
      <Box
        sx={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          padding: 4,
          borderRadius: "20px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          minWidth: "320px",
        }}
      >
        {/* Animated sparkles icon */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
            animation: "pulse 2s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": {
                transform: "scale(1)",
                opacity: 1,
              },
              "50%": {
                transform: "scale(1.1)",
                opacity: 0.8,
              },
            },
          }}
        >
          <Sparkles
            size={48}
            style={{
              color: "#6366f1",
              animation: "spin 3s linear infinite",
            }}
          />
        </Box>

        {/* Text content */}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 1,
            }}
          >
            ✨ Generating Your Cover Letter
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our AI is analyzing the job posting and crafting a tailored cover letter...
          </Typography>
        </Box>

        {/* Loading bar */}
        <Box
          sx={{
            width: "100%",
            height: "4px",
            borderRadius: "2px",
            background: "linear-gradient(90deg, #f0f0f0 0%, #f0f0f0 100%)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
              animation: "loading 1.5s ease-in-out infinite",
              "@keyframes loading": {
                "0%": { width: "0%", marginLeft: "0%" },
                "50%": { width: "100%", marginLeft: "0%" },
                "100%": { width: "0%", marginLeft: "100%" },
              },
            }}
          />
        </Box>

        {/* Subtle hint text */}
        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
          This usually takes 30-60 seconds
        </Typography>
      </Box>

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Box>
  );
};

export default AIGeneratingOverlay;
