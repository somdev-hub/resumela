import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { Sparkles } from "lucide-react";
import { getAllResumes } from "../../firebase/firestore";

const AIGenerationDialog = ({ open, onClose, onGenerate }) => {
  const [jobUrl, setJobUrl] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [error, setError] = useState("");

  // Fetch all resumes when dialog opens
  useEffect(() => {
    if (open) {
      setError("");
      setJobUrl("");
      setSelectedResumeId("");
      fetchResumes();
    }
  }, [open]);

  const fetchResumes = async () => {
    setLoadingResumes(true);
    try {
      const allResumes = await getAllResumes();
      setResumes(allResumes);
      if (allResumes.length > 0) {
        setSelectedResumeId(allResumes[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
      setError("Failed to load resumes");
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleGenerate = async () => {
    if (!jobUrl.trim()) {
      setError("Please enter a job URL");
      return;
    }
    if (!selectedResumeId) {
      setError("Please select a resume");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Validate URL
      try {
        new URL(jobUrl);
      } catch {
        setError("Please enter a valid URL");
        setLoading(false);
        return;
      }

      // Call the onGenerate callback with the selected resume and job URL
      await onGenerate({
        jobUrl: jobUrl.trim(),
        resumeId: selectedResumeId,
      });

      onClose();
    } catch (err) {
      console.error("Generation failed:", err);
      setError(err.message || "Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Sparkles size={24} />
        Generate Cover Letter with AI
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Job URL"
            placeholder="https://example.com/job-posting"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            fullWidth
            disabled={loading}
            variant="outlined"
            helperText="Enter the URL of the job posting"
          />

          <FormControl fullWidth disabled={loadingResumes || loading}>
            <InputLabel>Select Resume</InputLabel>
            <Select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              label="Select Resume"
            >
              {resumes.map((resume) => (
                <MenuItem key={resume.id} value={resume.id}>
                  {resume.title || "Untitled Resume"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loadingResumes && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Loading resumes...
              </Typography>
            </Box>
          )}

          {!loadingResumes && resumes.length === 0 && (
            <Alert severity="warning">
              No resumes found. Please create a resume first.
            </Alert>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            The AI will analyze the job posting and your resume to generate a
            tailored cover letter.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          disabled={loading || loadingResumes || resumes.length === 0}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {loading && <CircularProgress size={16} />}
          Generate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIGenerationDialog;
