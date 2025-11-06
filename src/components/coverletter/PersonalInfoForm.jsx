import { Box, TextField, FormControlLabel, Switch, Typography } from "@mui/material";
import { Link as LinkIcon } from "@mui/icons-material";

const PersonalInfoForm = ({
  formData,
  handleInputChange,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            Personalise your cover letter
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Toggle sync to pull details from your latest resume or edit manually
          </Typography>
        </Box>
      
      </Box>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: "1 1 calc(50% - 8px)" }}>
          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
          />
        </div>
        <div style={{ flex: "1 1 calc(50% - 8px)" }}>
          <TextField
            fullWidth
            label="Professional Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
          />
        </div>
        <div style={{ flex: "1 1 calc(50% - 8px)" }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div style={{ flex: "1 1 calc(50% - 8px)" }}>
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>
        <div style={{ flex: "1 1 100%" }}>
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
          />
        </div>
        <div style={{ flex: "1 1 calc(50% - 8px)" }}>
          <TextField
            fullWidth
            label="LinkedIn"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <LinkIcon sx={{ mr: 1, color: "text.disabled" }} />
              ),
            }}
          />
        </div>
        <div style={{ flex: "1 1 calc(50% - 8px)" }}>
          <TextField
            fullWidth
            label="GitHub"
            name="github"
            value={formData.github}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <LinkIcon sx={{ mr: 1, color: "text.disabled" }} />
              ),
            }}
          />
        </div>
      </div>
    </Box>
  );
};

export default PersonalInfoForm;
