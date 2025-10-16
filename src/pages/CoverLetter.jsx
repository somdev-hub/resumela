import React, { useCallback, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import { usePDF } from "react-to-pdf";
import {
  Box,
  Container,
  Grid,
  TextField,
  Button,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  Switch,
  FormControlLabel,
  Stack,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  Link as LinkIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import RichTextEditor from "../components/RichTextEditor";
import FormSection from "../components/FormSection";

const CoverLetter = () => {
  const [syncWithResume, setSyncWithResume] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    date: "",
    recipientName: "",
    company: "",
    companyLocation: "",
    letterContent: "<p></p>",
    signatureImage: null,
    signatureName: "",
    signaturePlace: "",
    signatureDate: ""
  });

  const pdfPreviewRef = useRef(null);
  const signatureInputRef = useRef(null);

  const sanitizedFilename = useMemo(() => {
    const trimmed = formData.fullName.trim();
    return trimmed ? trimmed.replace(/[^a-z0-9]+/gi, "_").toLowerCase() : "cover_letter";
  }, [formData.fullName]);

  const { toPDF, targetRef } = usePDF({
    filename: `${sanitizedFilename}_styled.pdf`,
    resolution: 2
  });

  const combinedPreviewRef = useCallback(
    (node) => {
      pdfPreviewRef.current = node;
      if (targetRef && "current" in targetRef) {
        targetRef.current = node;
      }
    },
    [targetRef]
  );

  const letterParagraphs = useMemo(() => {
    try {
      const el = document.createElement("div");
      el.innerHTML = formData.letterContent || "";
      const paras = [];
      el.querySelectorAll("p").forEach((p) => {
        const txt = p.innerText.replace(/\u00A0/g, " ").trim();
        if (txt) paras.push(txt);
      });
      if (paras.length > 0) return paras;
      const text = el.innerText || "";
      return text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    } catch {
      return (formData.letterContent || "").split(/\n+/).filter(Boolean);
    }
  }, [formData.letterContent]);

  const contactLine = useMemo(() => {
    return [formData.email, formData.phone, formData.location]
      .filter(Boolean)
      .join(" | ");
  }, [formData.email, formData.phone, formData.location]);

  const secondaryLine = useMemo(() => {
    return [formData.linkedin, formData.github].filter(Boolean).join(" | ");
  }, [formData.github, formData.linkedin]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignatureUpload = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({ ...prev, signatureImage: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const downloadATSOptimizedPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(formData.fullName, pageWidth / 2, y, { align: "center" });
    y += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(formData.title, pageWidth / 2, y, { align: "center" });
    y += 18;

    doc.setFontSize(10);
    const contactInfo = [contactLine, secondaryLine].filter(Boolean).join(" | ");
    doc.text(contactInfo, pageWidth / 2, y, { align: "center", maxWidth: pageWidth - margin * 2 });
    y += 28;

    const addLine = (text) => {
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
      lines.forEach((line) => {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 16;
      });
      y += 8;
    };

    doc.setFontSize(11);
    addLine(formData.date);
    addLine(formData.recipientName);
    addLine(formData.company);
    addLine(formData.companyLocation);
    addLine("");
    addLine(`Dear ${formData.recipientName},`);
    letterParagraphs.forEach((paragraph) => addLine(paragraph));
    addLine("Sincerely,");
    addLine(formData.fullName);

    doc.save(`${sanitizedFilename}_ats.pdf`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" color="inherit" elevation={1}>
        <Toolbar>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <DescriptionIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Cover Letter Builder
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Edit details on the left, preview updates instantly on the right
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => toPDF()}
            >
              Styled PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={downloadATSOptimizedPDF}
            >
              ATS-friendly PDF
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Toolbar /> {/* Spacer for fixed AppBar */}

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Left Column - Editor */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, height: 'calc(100vh - 120px)', overflow: 'auto' }}>
              {/* Personal Information */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Personalise your cover letter
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Toggle sync to pull details from your latest resume or edit manually
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={syncWithResume}
                        onChange={(e) => setSyncWithResume(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Sync with resume"
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Professional Title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="LinkedIn"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.disabled' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="GitHub"
                      name="github"
                      value={formData.github}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.disabled' }} />,
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Letter Details */}
              <FormSection title="Letter details">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Recipient Name"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Location"
                      name="companyLocation"
                      value={formData.companyLocation}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              </FormSection>

              {/* Letter Content */}
              <FormSection title="Letter content">
                <RichTextEditor
                  value={formData.letterContent}
                  onChange={(html) => setFormData(prev => ({ ...prev, letterContent: html }))}
                  placeholder="Write your cover letter here..."
                  minHeight={200}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Use the toolbar to format text. The preview and PDFs will render paragraph breaks and formatting.
                </Typography>
              </FormSection>

              {/* Signature */}
              <FormSection title="Signature">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      width: 200,
                      height: 80,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'background.default',
                    }}
                  >
                    {formData.signatureImage ? (
                      <img src={formData.signatureImage} alt="signature" style={{ maxHeight: 60 }} />
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        No signature uploaded
                      </Typography>
                    )}
                  </Paper>
                  <Stack spacing={1}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => signatureInputRef.current?.click()}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, signatureImage: null, signatureName: "", signaturePlace: "", signatureDate: "" }));
                        if (signatureInputRef.current) signatureInputRef.current.value = null;
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                  <input
                    ref={signatureInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    style={{ display: 'none' }}
                  />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Full name"
                      name="signatureName"
                      value={formData.signatureName}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Place"
                      name="signaturePlace"
                      value={formData.signaturePlace}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Date"
                      name="signatureDate"
                      value={formData.signatureDate}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              </FormSection>
            </Paper>
          </Grid>

          {/* Right Column - Preview */}
          <Grid item xs={12} md={6}>
            <Paper
              ref={combinedPreviewRef}
              elevation={3}
              sx={{ p: 5, height: 'calc(100vh - 120px)', overflow: 'auto', position: 'relative' }}
            >
              <Chip
                label="Live preview"
                color="primary"
                size="small"
                sx={{ position: 'absolute', top: 16, right: 16 }}
              />

              {/* Header */}
              <Box sx={{ textAlign: 'center', borderBottom: 1, borderColor: 'divider', pb: 3, mb: 3 }}>
                <Typography variant="h4" fontWeight={600} gutterBottom>
                  {formData.fullName || "Your Name"}
                </Typography>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  {formData.title || "Professional Title"}
                </Typography>
                {contactLine && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {contactLine}
                  </Typography>
                )}
                {secondaryLine && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    {secondaryLine}
                  </Typography>
                )}
              </Box>

              {/* Letter Body */}
              <Box sx={{ typography: 'body2', color: 'text.primary' }}>
                {formData.date && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{formData.date}</Typography>}
                {formData.recipientName && <Typography variant="body2">{formData.recipientName}</Typography>}
                {formData.company && <Typography variant="body2">{formData.company}</Typography>}
                {formData.companyLocation && <Typography variant="body2" sx={{ mb: 3 }}>{formData.companyLocation}</Typography>}

                <Typography variant="body2" sx={{ mb: 2 }}>
                  Dear {formData.recipientName || "Hiring Manager"},
                </Typography>

                <Box
                  sx={{ mb: 3 }}
                  dangerouslySetInnerHTML={{ __html: formData.letterContent }}
                />

                <Box sx={{ mt: 4 }}>
                  <Typography variant="body2">Kind regards,</Typography>
                  {formData.signatureImage && (
                    <Box sx={{ my: 2 }}>
                      <img src={formData.signatureImage} alt="signature" style={{ height: 60 }} />
                    </Box>
                  )}
                  <Typography variant="body2" fontWeight={600} sx={{ mt: formData.signatureImage ? 0 : 2 }}>
                    {formData.signatureName || formData.fullName}
                  </Typography>
                  {(formData.signaturePlace || formData.signatureDate) && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {[formData.signaturePlace, formData.signatureDate].filter(Boolean).join(' • ')}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CoverLetter;
